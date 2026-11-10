import { MoodEntry, ChatMessage, UserProfile, MoodEmotion } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'solace_profile',
  MOODS: 'solace_mood_history',
  CHAT: 'solace_chat_history',
  AFFIRMATION: 'solace_daily_affirmation',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Seeker',
  intention: 'Cultivate inner calm and clarity',
  soundEnabled: true,
  ambientSound: 'none',
  ambientVolume: 0.4,
  hapticsEnabled: true,
  onboardingCompleted: false,
  streakDays: 3,
  totalBreathingMinutes: 14,
  completedSessionsCount: 5,
};

export const INITIAL_MOODS: MoodEntry[] = [
  {
    id: 'm-seed-1',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    emotion: 'reflective',
    label: 'Reflective',
    emoji: '🪷',
    intensity: 4,
    note: 'Paused by the garden window during the twilight rain.',
    tags: ['Evening', 'Quiet', 'Nature'],
  },
  {
    id: 'm-seed-2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    emotion: 'calm',
    label: 'Calm',
    emoji: '🍃',
    intensity: 5,
    note: 'Completed 5 minutes of box breathing before morning meetings.',
    tags: ['Morning', 'Focus'],
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'c-welcome-1',
    role: 'assistant',
    content: "Welcome to Solace Sanctuary. I am here to hold a quiet space for your thoughts, whatever weight or lightness you carry today. How is your heart resting right now?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export const storage = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  },

  getMoodHistory(): MoodEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOODS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(INITIAL_MOODS));
        return INITIAL_MOODS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MOODS;
    }
  },

  addMoodEntry(entry: Omit<MoodEntry, 'id' | 'timestamp'>): MoodEntry {
    const history = this.getMoodHistory();
    const newEntry: MoodEntry = {
      ...entry,
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...history];
    try {
      localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save mood:', e);
    }
    return newEntry;
  },

  deleteMoodEntry(id: string): void {
    const history = this.getMoodHistory();
    const updated = history.filter(m => m.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete mood:', e);
    }
  },

  getChatHistory(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (!data) {
        return INITIAL_CHAT_MESSAGES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  },

  saveChatHistory(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat:', e);
    }
  },

  clearChatHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(INITIAL_CHAT_MESSAGES));
    } catch (e) {
      console.warn('Failed to clear chat:', e);
    }
  },

  getDailyAffirmation(): { affirmation: string; date: string } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AFFIRMATION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveDailyAffirmation(affirmation: string): void {
    try {
      const today = new Date().toDateString();
      localStorage.setItem(STORAGE_KEYS.AFFIRMATION, JSON.stringify({ affirmation, date: today }));
    } catch (e) {
      console.warn('Failed to save affirmation:', e);
    }
  },

  incrementBreathingStats(minutes: number): UserProfile {
    const profile = this.getProfile();
    const updated: UserProfile = {
      ...profile,
      totalBreathingMinutes: profile.totalBreathingMinutes + minutes,
      completedSessionsCount: profile.completedSessionsCount + 1,
      streakDays: profile.streakDays + (Math.random() > 0.5 ? 0 : 0), // preserve accurate streak
    };
    this.saveProfile(updated);
    return updated;
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.MOODS);
      localStorage.removeItem(STORAGE_KEYS.CHAT);
      localStorage.removeItem(STORAGE_KEYS.AFFIRMATION);
    } catch (e) {
      console.warn('Failed to reset storage:', e);
    }
  },
};

export const EMOTIONS_CONFIG: Record<
  MoodEmotion,
  { label: string; emoji: string; color: string; bg: string; border: string; description: string }
> = {
  calm: {
    label: 'Calm',
    emoji: '🍃',
    color: '#486640',
    bg: '#E9FFEC',
    border: '#7A9A70',
    description: 'Serene, centered, and tranquil in mind',
  },
  peaceful: {
    label: 'Peaceful',
    emoji: '🕊️',
    color: '#344D2D',
    bg: '#E1FAE4',
    border: '#AED0A2',
    description: 'At ease with the present moment',
  },
  joyful: {
    label: 'Joyful',
    emoji: '✨',
    color: '#8A6D1C',
    bg: '#FFF8E7',
    border: '#E8C547',
    description: 'Light, uplifted, and energized',
  },
  reflective: {
    label: 'Reflective',
    emoji: '🪷',
    color: '#605984',
    bg: '#EBE7FA',
    border: '#C8BFF0',
    description: 'Contemplative and inwardly focused',
  },
  anxious: {
    label: 'Anxious',
    emoji: '🌊',
    color: '#845A6D',
    bg: '#FDF0F4',
    border: '#E5989B',
    description: 'Restless thoughts, shallow breathing',
  },
  overwhelmed: {
    label: 'Overwhelmed',
    emoji: '🌪️',
    color: '#7D4E57',
    bg: '#FAEDEE',
    border: '#B5838D',
    description: 'Carrying too much cognitive sensory load',
  },
  tired: {
    label: 'Tired',
    emoji: '🌙',
    color: '#5C5468',
    bg: '#F2EEF5',
    border: '#9A8C98',
    description: 'Depleted energy needing gentle recovery',
  },
  sad: {
    label: 'Heavy',
    emoji: '🌧️',
    color: '#4A5B6C',
    bg: '#EEF3F8',
    border: '#A3B8CC',
    description: 'Holding grief, sadness, or quiet longing',
  },
};
