import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Wind,
  Compass,
  ArrowDown,
  Info,
} from 'lucide-react';
import { ChatMessage, UserProfile, MoodEntry, ScreenType } from '../../types';
import { storage, EMOTIONS_CONFIG } from '../../utils/storage';

interface ChatScreenProps {
  profile: UserProfile;
  currentMood?: MoodEntry | null;
  onNavigate: (screen: ScreenType) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ profile, currentMood, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const history = storage.getChatHistory();
    setMessages(history);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const starterPrompts = [
    'Help me ground my thoughts right now.',
    'I feel sensory overload from my day.',
    'Guide me through a 2-minute stillness reflection.',
    'Why does my mind feel restless tonight?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    storage.saveChatHistory(newMessages);
    setInputText('');
    setIsSending(true);

    try {
      const moodHistory = storage.getMoodHistory();
      const latestLoggedMood = currentMood || moodHistory[0];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userContext: {
            name: profile.name,
            currentMood: latestLoggedMood ? {
              label: latestLoggedMood.label,
              description: EMOTIONS_CONFIG[latestLoggedMood.emotion]?.description,
            } : undefined,
            recentReflection: latestLoggedMood?.note,
            completedBreaths: profile.completedSessionsCount,
          },
        }),
      });

      const data = await res.json();
      const reply = data.text || data.fallbackText || "Take a gentle breath in... and let it softly go. What would bring you peace right now?";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };

      const updatedWithAi = [...newMessages, aiMsg];
      setMessages(updatedWithAi);
      storage.saveChatHistory(updatedWithAi);
    } catch (e) {
      console.warn('Chat error:', e);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: "I am holding this space with you. Even if words fail for a moment, gently soften your shoulders and breathe with me.",
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Would you like to clear this conversation history?")) {
      storage.clearChatHistory();
      setMessages(storage.getChatHistory());
    }
  };

  const latestMood = currentMood || storage.getMoodHistory()[0];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B3022] flex flex-col pb-36 pt-2 max-w-md mx-auto">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[rgba(250,248,243,0.92)] backdrop-blur-md border-b border-[rgba(122,154,112,0.15)] sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7A9A70] to-[#AED0A2] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-semibold text-[#1B3022]">Solace Companion</h1>
              <span className="w-2 h-2 rounded-full bg-[#7A9A70] animate-pulse" />
            </div>
            <p className="text-[10px] text-[#486640] font-medium">
              Empathetic • Grounding • Gemini 3.8 Flash
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onNavigate('breathing')}
            className="p-2 rounded-full text-[#486640] hover:bg-[#E1FAE4] transition-colors"
            title="Switch to guided breathing"
          >
            <Wind className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-full text-[#73796F] hover:text-[#BA1A1A] hover:bg-[#F4F1EA] transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Banner: Active Mood Awareness */}
      {latestMood && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-full bg-[#E1FAE4]/80 border border-[#AED0A2]/60 flex items-center justify-between text-[11px] text-[#344D2D]">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="text-sm">{latestMood.emoji}</span>
            <span className="font-medium">Context: Feeling {latestMood.label}</span>
            {latestMood.note && <span className="opacity-80 italic truncate">"{latestMood.note}"</span>}
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-[#486640] bg-[#FFFFFF] px-2 py-0.5 rounded-full">
            Active Context
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 px-4 py-4 space-y-3.5 overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[85%] rounded-[24px] px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#F4F1EA] text-[#1B3022] rounded-br-sm border border-[rgba(122,154,112,0.1)]'
                    : 'bg-[#FFFFFF] text-[#1B3022] rounded-bl-sm border border-[rgba(122,154,112,0.18)] shadow-sanctuary'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center space-x-1 mb-1 text-[10px] text-[#7A9A70] font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Solace</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="text-[10px] text-[#73796F] mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {/* Loading / Typing indicator */}
        {isSending && (
          <div className="flex items-start space-x-2 animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] border border-[rgba(122,154,112,0.18)] rounded-full px-4 py-2.5 shadow-sm flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9A70] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9A70] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A9A70] animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[10px] text-[#486640] ml-1 font-medium">Solace is reflecting...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2">
          <div className="text-[10px] uppercase font-bold text-[#7A9A70] mb-1.5 tracking-wider">
            Gentle Reflection Prompts
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {starterPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-[11px] bg-[#FFFFFF] hover:bg-[#E9FFEC] border border-[rgba(122,154,112,0.2)] rounded-full px-3 py-1.5 text-[#1B3022] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="px-4 pt-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-[#FFFFFF] border border-[rgba(122,154,112,0.25)] rounded-full p-1.5 pl-4 shadow-sanctuary flex items-center space-x-2 focus-within:border-[#7A9A70] transition-colors"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share what is on your heart..."
            className="flex-1 bg-transparent text-xs text-[#1B3022] outline-none placeholder:text-[#434840]/60"
            disabled={isSending}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              inputText.trim() && !isSending
                ? 'bg-[#7A9A70] text-[#FAF8F3] shadow-sm hover:bg-[#68855F]'
                : 'bg-[#F4F1EA] text-[#73796F] opacity-60 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
