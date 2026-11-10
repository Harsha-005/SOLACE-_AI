import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wind,
  MessageCircle,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Flame,
  ChevronRight,
  Smile,
  Clock,
  Compass,
} from 'lucide-react';
import { UserProfile, MoodEntry, MoodEmotion, ScreenType } from '../../types';
import { storage, EMOTIONS_CONFIG } from '../../utils/storage';

interface HomeScreenProps {
  profile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onSelectMoodForChat?: (mood: MoodEntry) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ profile, onNavigate, onSelectMoodForChat }) => {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<MoodEmotion>('reflective');
  const [intensity, setIntensity] = useState<number>(4);
  const [moodNote, setMoodNote] = useState<string>('');
  const [isLoggingMood, setIsLoggingMood] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Affirmation state
  const [affirmation, setAffirmation] = useState<string>(
    "I allow myself to soften into this moment, trusting the quiet rhythm of my breath."
  );
  const [isLoadingAffirmation, setIsLoadingAffirmation] = useState(false);

  // Activity Recommendation
  const [recommendation, setRecommendation] = useState<{
    title: string;
    duration: string;
    category: string;
    description: string;
  }>({
    title: 'Box Breathing Anchor',
    duration: '4 mins',
    category: 'Breathwork',
    description: 'Even 4-count cycles to gently settle sensory overload.',
  });
  const [isLoadingRec, setIsLoadingRec] = useState(false);

  // Load persistent data
  useEffect(() => {
    setMoodHistory(storage.getMoodHistory());

    const cachedAffirmation = storage.getDailyAffirmation();
    if (cachedAffirmation?.affirmation) {
      setAffirmation(cachedAffirmation.affirmation);
    } else {
      fetchAffirmation();
    }
  }, []);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchAffirmation = async (customMood?: string) => {
    setIsLoadingAffirmation(true);
    try {
      const res = await fetch('/api/affirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: customMood || selectedEmotion,
          intention: profile.intention,
        }),
      });
      const data = await res.json();
      if (data.affirmation) {
        setAffirmation(data.affirmation);
        storage.saveDailyAffirmation(data.affirmation);
      }
    } catch (e) {
      console.warn('Affirmation error:', e);
    } finally {
      setIsLoadingAffirmation(false);
    }
  };

  const fetchRecommendation = async (emotion: MoodEmotion) => {
    setIsLoadingRec(true);
    try {
      const res = await fetch('/api/activity-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: EMOTIONS_CONFIG[emotion].label,
          energyLevel: emotion === 'tired' || emotion === 'sad' ? 'low' : 'medium',
        }),
      });
      const data = await res.json();
      if (data.recommendation?.title) {
        setRecommendation(data.recommendation);
      }
    } catch (e) {
      console.warn('Rec error:', e);
    } finally {
      setIsLoadingRec(false);
    }
  };

  const handleSaveMood = () => {
    const config = EMOTIONS_CONFIG[selectedEmotion];
    const newEntry = storage.addMoodEntry({
      emotion: selectedEmotion,
      label: config.label,
      emoji: config.emoji,
      intensity,
      note: moodNote.trim() || undefined,
      tags: [config.label],
    });

    setMoodHistory(storage.getMoodHistory());
    setMoodNote('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    setIsLoggingMood(false);

    // Contextually update recommendation based on new mood
    fetchRecommendation(selectedEmotion);
  };

  const handleDeleteMood = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storage.deleteMoodEntry(id);
    setMoodHistory(storage.getMoodHistory());
  };

  const latestMood = moodHistory[0];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B3022] pb-36 pt-4 px-4 max-w-md mx-auto space-y-6">
      {/* Editorial Header */}
      <header className="flex items-start justify-between pt-2">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A9A70] flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A9A70] animate-pulse" />
            <span>Solace Sanctuary</span>
          </span>
          <h1 className="text-2xl font-serif text-[#1B3022] font-medium mt-0.5">
            {getGreeting()}, <span className="italic">{profile.name}</span>
          </h1>
          <p className="text-xs text-[#434840]">
            Your space for calm pause and gentle reflection.
          </p>
        </div>

        {/* Mindful Streak Badge */}
        <div className="flex items-center space-x-1.5 bg-[#FFFFFF] border border-[rgba(122,154,112,0.18)] px-3 py-1.5 rounded-full shadow-sm">
          <Flame className="w-4 h-4 text-[#7A9A70] fill-[#7A9A70]/20" />
          <span className="text-xs font-semibold text-[#1B3022]">{profile.streakDays}d Streak</span>
        </div>
      </header>

      {/* Daily Reflection / Affirmation Card */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFFFFF] via-[#FAF8F3] to-[#EBE7FA]/50 border border-[rgba(122,154,112,0.18)] p-5 shadow-sanctuary">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8BFF0]/20 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#605984] flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#605984]" />
            <span>Daily Affirmation</span>
          </span>
          <button
            onClick={() => fetchAffirmation()}
            disabled={isLoadingAffirmation}
            className="text-[#605984] hover:text-[#1B3022] p-1 rounded-full hover:bg-[#FFFFFF] transition-colors"
            title="Refresh with Gemini AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAffirmation ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <blockquote className="text-base font-serif italic text-[#1B3022] leading-relaxed relative z-10 pl-2 border-l-2 border-[#C8BFF0]">
          "{affirmation}"
        </blockquote>

        <div className="mt-3 flex items-center justify-between text-[11px] text-[#73796F]">
          <span>Anchor: {profile.intention}</span>
          <button
            onClick={() => onNavigate('chat')}
            className="text-[#486640] hover:underline font-medium flex items-center space-x-0.5"
          >
            <span>Reflect with Solace</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* Mood Check-In Section */}
      <section className="bg-[#FFFFFF] rounded-[28px] border border-[rgba(122,154,112,0.15)] p-5 shadow-sanctuary space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1B3022]">How is your heart resting?</h2>
            <p className="text-[11px] text-[#434840]">
              {latestMood
                ? `Last check-in: ${latestMood.label} (${new Date(latestMood.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                : 'Select an emotion stone to log your mood'}
            </p>
          </div>
          <button
            onClick={() => setIsLoggingMood(!isLoggingMood)}
            className="text-xs bg-[#E1FAE4] text-[#486640] border border-[#AED0A2] px-3 py-1 rounded-full font-medium hover:bg-[#D0E9D4] transition-colors"
          >
            {isLoggingMood ? 'Close' : '+ Check In'}
          </button>
        </div>

        {/* Emotion Stones Grid */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(EMOTIONS_CONFIG) as MoodEmotion[]).map((emotionKey) => {
            const item = EMOTIONS_CONFIG[emotionKey];
            const isSelected = selectedEmotion === emotionKey;
            return (
              <button
                key={emotionKey}
                onClick={() => {
                  setSelectedEmotion(emotionKey);
                  setIsLoggingMood(true);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#7A9A70] bg-[#E9FFEC] shadow-sm ring-1 ring-[#7A9A70]'
                    : 'border-[rgba(122,154,112,0.12)] bg-[#FAF8F3] hover:border-[#AED0A2]'
                }`}
              >
                <span className="text-xl mb-1">{item.emoji}</span>
                <span className="text-[11px] font-medium text-[#1B3022] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mood Logging Drawer */}
        {isLoggingMood && (
          <div className="pt-3 border-t border-[rgba(122,154,112,0.12)] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1B3022]">
                Feeling: <span className="text-[#486640]">{EMOTIONS_CONFIG[selectedEmotion].label}</span>
              </span>
              <span className="text-[11px] text-[#434840]">Intensity: {intensity} / 5</span>
            </div>

            {/* Intensity slider */}
            <input
              type="range"
              min="1"
              max="5"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#F4F1EA] accent-[#7A9A70] rounded-full cursor-pointer"
            />

            {/* Note text field */}
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="What thoughts or sensations are present right now? (Optional note for your journal)"
              rows={2}
              className="w-full bg-[#F4F1EA] border border-transparent focus:border-[#7A9A70] focus:bg-[#FFFFFF] rounded-2xl p-3 text-xs text-[#1B3022] outline-none transition-all resize-none placeholder:text-[#434840]/60"
            />

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleSaveMood}
                className="flex-1 h-11 bg-[#7A9A70] hover:bg-[#68855F] text-[#FAF8F3] rounded-full font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to Sanctuary Journal</span>
              </button>

              <button
                onClick={() => {
                  const entry = moodHistory[0] || {
                    id: 'temp',
                    emotion: selectedEmotion,
                    label: EMOTIONS_CONFIG[selectedEmotion].label,
                    emoji: EMOTIONS_CONFIG[selectedEmotion].emoji,
                    intensity,
                    timestamp: new Date().toISOString(),
                    note: moodNote,
                  };
                  if (onSelectMoodForChat) {
                    onSelectMoodForChat(entry);
                  }
                  onNavigate('chat');
                }}
                className="px-3.5 h-11 bg-[#EBE7FA] hover:bg-[#DCD6F5] text-[#605984] rounded-full font-medium text-xs flex items-center space-x-1 transition-all"
                title="Chat with Solace about this mood"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Talk with AI</span>
              </button>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="text-center text-xs text-[#486640] bg-[#E1FAE4] py-1.5 rounded-full font-medium animate-in fade-in">
            ✓ Mindful check-in logged to your sanctuary.
          </div>
        )}
      </section>

      {/* Quick Action Cards: Breathing & AI Companion */}
      <div className="grid grid-cols-2 gap-3">
        {/* Guided Breathing Launch Card */}
        <div
          onClick={() => onNavigate('breathing')}
          className="group relative overflow-hidden rounded-[26px] bg-[#FFFFFF] border border-[rgba(122,154,112,0.18)] p-4 shadow-sanctuary cursor-pointer hover:border-[#7A9A70] transition-all hover:shadow-sanctuary-hover"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#E1FAE4] text-[#486640] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Wind className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#1B3022]">Guided Breath</h3>
          <p className="text-[11px] text-[#434840] mt-0.5 line-clamp-2">
            Box & 4-7-8 relaxing breathing cycles.
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-[#486640]">
            <span>Start Session</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* AI Companion Launch Card */}
        <div
          onClick={() => onNavigate('chat')}
          className="group relative overflow-hidden rounded-[26px] bg-[#FFFFFF] border border-[rgba(122,154,112,0.18)] p-4 shadow-sanctuary cursor-pointer hover:border-[#C8BFF0] transition-all hover:shadow-sanctuary-hover"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#EBE7FA] text-[#605984] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#1B3022]">Solace Companion</h3>
          <p className="text-[11px] text-[#434840] mt-0.5 line-clamp-2">
            Context-aware dialogue powered by Gemini.
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-[#605984]">
            <span>Open Dialogue</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Dynamic Wellness Recommendation */}
      <section className="bg-gradient-to-r from-[#E9FFEC] to-[#FAF8F3] rounded-[28px] border border-[rgba(122,154,112,0.2)] p-4 shadow-sanctuary flex items-center justify-between">
        <div className="space-y-0.5 pr-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#486640] border border-[#AED0A2]">
              {recommendation.category}
            </span>
            <span className="text-[11px] text-[#73796F] flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {recommendation.duration}
            </span>
          </div>
          <h4 className="text-xs font-semibold text-[#1B3022] pt-1">{recommendation.title}</h4>
          <p className="text-[11px] text-[#434840]">{recommendation.description}</p>
        </div>
        <button
          onClick={() => onNavigate('breathing')}
          className="shrink-0 h-9 px-3.5 rounded-full bg-[#7A9A70] text-[#FAF8F3] font-semibold text-xs hover:bg-[#68855F] transition-colors"
        >
          Practice
        </button>
      </section>

      {/* Persistent Mood History Section */}
      <section className="bg-[#FFFFFF] rounded-[28px] border border-[rgba(122,154,112,0.15)] p-5 shadow-sanctuary space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#7A9A70]" />
            <h3 className="text-sm font-semibold text-[#1B3022]">Recent Sanctuary Logs</h3>
          </div>
          <span className="text-[11px] font-mono text-[#73796F]">{moodHistory.length} total entries</span>
        </div>

        {moodHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#73796F]">
            No reflections logged yet. Tap '+ Check In' above to record how you feel.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
            {moodHistory.slice(0, 6).map((entry) => {
              const conf = EMOTIONS_CONFIG[entry.emotion] || EMOTIONS_CONFIG.calm;
              const dateObj = new Date(entry.timestamp);
              const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={entry.id}
                  className="group flex items-start justify-between p-3 rounded-2xl bg-[#FAF8F3] border border-transparent hover:border-[rgba(122,154,112,0.18)] transition-all"
                >
                  <div className="flex items-start space-x-2.5">
                    <span className="text-xl p-1.5 rounded-xl bg-[#FFFFFF] border border-[rgba(122,154,112,0.1)]">
                      {conf.emoji}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-[#1B3022]">{conf.label}</span>
                        <span className="text-[10px] text-[#73796F] bg-[#FFFFFF] px-1.5 py-0.2 rounded-full border border-[rgba(122,154,112,0.1)]">
                          Level {entry.intensity}/5
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-[11px] text-[#434840] mt-0.5 line-clamp-2">
                          "{entry.note}"
                        </p>
                      )}
                      <span className="text-[10px] text-[#73796F] block mt-1">
                        {dateStr} at {timeStr}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteMood(entry.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#73796F] hover:text-[#BA1A1A] transition-opacity"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
