export type ScreenType = 'onboarding' | 'home' | 'chat' | 'breathing' | 'profile';

export type MoodEmotion = 'calm' | 'peaceful' | 'joyful' | 'reflective' | 'anxious' | 'overwhelmed' | 'tired' | 'sad';

export interface MoodEntry {
  id: string;
  timestamp: string; // ISO string
  emotion: MoodEmotion;
  label: string;
  emoji: string;
  intensity: number; // 1 to 5
  note?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface BreathingMode {
  id: 'box' | 'relax' | 'calm';
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  color: string;
}

export interface UserProfile {
  name: string;
  intention: string;
  soundEnabled: boolean;
  ambientSound: 'none' | 'rain' | 'stream' | 'crickets' | 'drone';
  ambientVolume: number;
  hapticsEnabled: boolean;
  onboardingCompleted: boolean;
  streakDays: number;
  totalBreathingMinutes: number;
  completedSessionsCount: number;
}
