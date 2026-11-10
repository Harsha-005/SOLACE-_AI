import React, { useState } from 'react';
import {
  User,
  Heart,
  Flame,
  Clock,
  Sparkles,
  Volume2,
  Trash2,
  Shield,
  RotateCcw,
  Check,
} from 'lucide-react';
import { UserProfile, ScreenType } from '../../types';
import { storage } from '../../utils/storage';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (screen: ScreenType) => void;
  onResetAll: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onNavigate,
  onResetAll,
}) => {
  const [name, setName] = useState(profile.name);
  const [intention, setIntention] = useState(profile.intention);
  const [isSaved, setIsSaved] = useState(false);

  const moodLogsCount = storage.getMoodHistory().length;

  const handleSave = () => {
    onUpdateProfile({
      name: name.trim() || 'Mindful Seeker',
      intention: intention.trim() || 'Cultivate inner calm and clarity',
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const intentionsList = [
    'Grounding in the Present',
    'Stress & Tension Relief',
    'Restorative Sleep & Ease',
    'Emotional Clarity & Compassion',
    'Focused Mind & Creative Energy',
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B3022] pb-36 pt-4 px-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <header className="pt-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A9A70]">
          Sanctuary Identity
        </span>
        <h1 className="text-2xl font-serif text-[#1B3022] font-medium">
          Profile & Preferences
        </h1>
        <p className="text-xs text-[#434840]">
          Personalize your mindful retreat and data persistence.
        </p>
      </header>

      {/* Sanctuary Metrics Summary */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#FFFFFF] border border-[rgba(122,154,112,0.18)] rounded-2xl p-3 text-center shadow-sanctuary">
          <Flame className="w-4 h-4 text-[#7A9A70] mx-auto mb-1 fill-[#7A9A70]/20" />
          <span className="text-lg font-serif font-semibold text-[#1B3022] block leading-none">
            {profile.streakDays}
          </span>
          <span className="text-[10px] text-[#73796F] mt-1 block">Day Streak</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[rgba(122,154,112,0.18)] rounded-2xl p-3 text-center shadow-sanctuary">
          <Clock className="w-4 h-4 text-[#605984] mx-auto mb-1" />
          <span className="text-lg font-serif font-semibold text-[#1B3022] block leading-none">
            {profile.totalBreathingMinutes}m
          </span>
          <span className="text-[10px] text-[#73796F] mt-1 block">Breathing Time</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[rgba(122,154,112,0.18)] rounded-2xl p-3 text-center shadow-sanctuary">
          <Heart className="w-4 h-4 text-[#8A6D1C] mx-auto mb-1" />
          <span className="text-lg font-serif font-semibold text-[#1B3022] block leading-none">
            {moodLogsCount}
          </span>
          <span className="text-[10px] text-[#73796F] mt-1 block">Mood Logs</span>
        </div>
      </section>

      {/* Profile Form */}
      <section className="bg-[#FFFFFF] rounded-[28px] border border-[rgba(122,154,112,0.15)] p-5 shadow-sanctuary space-y-4">
        <h2 className="text-sm font-semibold text-[#1B3022] flex items-center space-x-1.5">
          <User className="w-4 h-4 text-[#7A9A70]" />
          <span>Personal Anchor</span>
        </h2>

        <div>
          <label className="block text-xs font-semibold text-[#1B3022] mb-1">
            Preferred Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#F4F1EA] border border-transparent focus:border-[#7A9A70] focus:bg-[#FFFFFF] rounded-2xl px-3.5 py-2.5 text-xs text-[#1B3022] outline-none transition-all"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1B3022] mb-1">
            Current Intention
          </label>
          <input
            type="text"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            className="w-full bg-[#F4F1EA] border border-transparent focus:border-[#7A9A70] focus:bg-[#FFFFFF] rounded-2xl px-3.5 py-2.5 text-xs text-[#1B3022] outline-none transition-all mb-2"
          />

          <div className="flex flex-wrap gap-1.5">
            {intentionsList.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setIntention(item)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                  intention === item
                    ? 'bg-[#E1FAE4] text-[#486640] border-[#AED0A2]'
                    : 'bg-[#FAF8F3] text-[#73796F] border-transparent hover:border-[#AED0A2]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full h-11 rounded-full bg-[#7A9A70] hover:bg-[#68855F] text-[#FAF8F3] font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
        >
          {isSaved ? <Check className="w-4 h-4" /> : null}
          <span>{isSaved ? 'Preferences Saved' : 'Save Changes'}</span>
        </button>
      </section>

      {/* Audio & Tactile Preferences */}
      <section className="bg-[#FFFFFF] rounded-[28px] border border-[rgba(122,154,112,0.15)] p-5 shadow-sanctuary space-y-3.5">
        <h2 className="text-sm font-semibold text-[#1B3022] flex items-center space-x-1.5">
          <Volume2 className="w-4 h-4 text-[#7A9A70]" />
          <span>Mindful Feedback</span>
        </h2>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-medium text-[#1B3022] block">Meditation Bell Chimes</span>
            <span className="text-[11px] text-[#73796F]">
              Play 432Hz harmonic tone on breath phase shifts
            </span>
          </div>
          <button
            onClick={() => onUpdateProfile({ soundEnabled: !profile.soundEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              profile.soundEnabled ? 'bg-[#7A9A70]' : 'bg-[#D0E9D4]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                profile.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-[rgba(122,154,112,0.1)]">
          <div>
            <span className="text-xs font-medium text-[#1B3022] block">Tactile Pulses</span>
            <span className="text-[11px] text-[#73796F]">
              Gentle haptic feedback during breath transitions
            </span>
          </div>
          <button
            onClick={() => onUpdateProfile({ hapticsEnabled: !profile.hapticsEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              profile.hapticsEnabled ? 'bg-[#7A9A70]' : 'bg-[#D0E9D4]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                profile.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Sanctuary Privacy & Data Reset */}
      <section className="bg-[#FFFFFF] rounded-[28px] border border-[rgba(122,154,112,0.15)] p-5 shadow-sanctuary space-y-3">
        <div className="flex items-center space-x-2 text-[#486640]">
          <Shield className="w-4 h-4" />
          <h2 className="text-xs font-semibold text-[#1B3022]">Local Sanctuary Storage</h2>
        </div>
        <p className="text-[11px] text-[#434840]">
          Your mood entries, journal reflections, and Solace conversation history are stored securely in your browser's persistent storage. No telemetry or analytics tracking.
        </p>

        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={() => onNavigate('onboarding')}
            className="flex-1 h-10 rounded-full bg-[#F4F1EA] text-[#434840] font-medium text-xs hover:bg-[#EBE7DF] transition-colors flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Onboarding</span>
          </button>

          <button
            onClick={onResetAll}
            className="h-10 px-4 rounded-full bg-[#FFDAD6] text-[#93000A] font-medium text-xs hover:bg-[#FFB4AB] transition-colors flex items-center space-x-1"
            title="Reset all sanctuary data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </section>
    </div>
  );
};
