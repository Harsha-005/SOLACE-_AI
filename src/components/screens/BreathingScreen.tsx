import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Heart,
  ChevronRight,
  Wind,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, BreathingMode, ScreenType } from '../../types';
import { soundscape } from '../../utils/audio';
import { storage } from '../../utils/storage';

interface BreathingScreenProps {
  profile: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onUpdateStats: (updated: UserProfile) => void;
}

const MODES: BreathingMode[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: '4-4-4-4 rhythm for equilibrium and mental focus.',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    color: '#7A9A70',
  },
  {
    id: 'relax',
    name: '4-7-8 Deep Reset',
    description: 'Vagus nerve stimulation for profound calming.',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    color: '#605984',
  },
  {
    id: 'calm',
    name: 'Gentle Flow',
    description: 'Even 4-4 wave to center the heartbeat.',
    inhale: 4,
    hold1: 0,
    exhale: 4,
    hold2: 0,
    color: '#486640',
  },
];

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'ready';

export const BreathingScreen: React.FC<BreathingScreenProps> = ({ profile, onNavigate, onUpdateStats }) => {
  const [selectedMode, setSelectedMode] = useState<BreathingMode>(MODES[0]);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(3); // 1, 3, 5 mins
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('ready');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(profile.soundEnabled ?? true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTargetSeconds = targetDurationMinutes * 60;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Main breath clock ticker
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalElapsedSeconds((prev) => {
        const nextElapsed = prev + 1;
        if (nextElapsed >= totalTargetSeconds) {
          handleSessionComplete();
          return nextElapsed;
        }
        return nextElapsed;
      });

      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Transition to next phase
          advancePhase();
          return 1; // will be updated inside advancePhase
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, currentPhase, selectedMode]);

  const advancePhase = () => {
    let nextPhase: BreathPhase = 'inhale';
    let nextSeconds = selectedMode.inhale;

    if (currentPhase === 'inhale') {
      if (selectedMode.hold1 > 0) {
        nextPhase = 'hold1';
        nextSeconds = selectedMode.hold1;
      } else {
        nextPhase = 'exhale';
        nextSeconds = selectedMode.exhale;
      }
    } else if (currentPhase === 'hold1') {
      nextPhase = 'exhale';
      nextSeconds = selectedMode.exhale;
    } else if (currentPhase === 'exhale') {
      if (selectedMode.hold2 > 0) {
        nextPhase = 'hold2';
        nextSeconds = selectedMode.hold2;
      } else {
        nextPhase = 'inhale';
        nextSeconds = selectedMode.inhale;
        setCompletedCycles((c) => c + 1);
      }
    } else if (currentPhase === 'hold2') {
      nextPhase = 'inhale';
      nextSeconds = selectedMode.inhale;
      setCompletedCycles((c) => c + 1);
    }

    setCurrentPhase(nextPhase);
    setPhaseSecondsLeft(nextSeconds);

    if (soundEnabled) {
      if (nextPhase === 'inhale') soundscape.playPhaseChime(432, 2.0);
      else if (nextPhase === 'hold1' || nextPhase === 'hold2') soundscape.playPhaseChime(528, 1.8);
      else if (nextPhase === 'exhale') soundscape.playPhaseChime(360, 2.2);
    }
  };

  const handleStart = () => {
    setIsCompleted(false);
    setCurrentPhase('inhale');
    setPhaseSecondsLeft(selectedMode.inhale);
    setIsActive(true);
    if (soundEnabled) {
      soundscape.playPhaseChime(432, 2.0);
    }
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase('ready');
    setPhaseSecondsLeft(selectedMode.inhale);
    setCompletedCycles(0);
    setTotalElapsedSeconds(0);
    setIsCompleted(false);
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    setIsCompleted(true);
    soundscape.playCompletionChime();

    // Trigger joyful botanical confetti
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#7A9A70', '#C8BFF0', '#E1FAE4', '#FAF8F3'],
      });
    } catch {
      // Confetti fallback
    }

    // Persist stats
    const minutesAdded = Math.max(1, Math.round(totalElapsedSeconds / 60));
    const updated = storage.incrementBreathingStats(minutesAdded);
    onUpdateStats(updated);
  };

  // Compute animation scaling for the circle
  const getCircleScaleClass = () => {
    if (!isActive && currentPhase === 'ready') return 'scale-95 opacity-90';
    if (currentPhase === 'inhale') return 'scale-125 duration-[4000ms]';
    if (currentPhase === 'hold1') return 'scale-125 duration-1000';
    if (currentPhase === 'exhale') return 'scale-90 duration-[4000ms]';
    if (currentPhase === 'hold2') return 'scale-90 duration-1000';
    return 'scale-100';
  };

  const getPhasePrompt = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inhale gently through your nose...';
      case 'hold1':
        return 'Softly suspend the breath...';
      case 'exhale':
        return 'Release slowly through parted lips...';
      case 'hold2':
        return 'Rest in the quiet stillness...';
      case 'ready':
      default:
        return 'Arrive softly and press Begin';
    }
  };

  const progressPercent = Math.min(100, Math.round((totalElapsedSeconds / totalTargetSeconds) * 100));

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B3022] flex flex-col justify-between pb-36 pt-4 px-4 max-w-md mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A9A70] flex items-center space-x-1.5">
            <Wind className="w-3.5 h-3.5" />
            <span>Somatic Sanctuary</span>
          </span>
          <h1 className="text-2xl font-serif text-[#1B3022] font-medium">
            Guided Breath
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full border transition-colors ${
              soundEnabled
                ? 'bg-[#E1FAE4] border-[#AED0A2] text-[#486640]'
                : 'bg-[#F4F1EA] border-transparent text-[#73796F]'
            }`}
            title="Toggle phase chimes"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mode Selector Pill Strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {MODES.map((mode) => {
          const isSelected = selectedMode.id === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                if (!isActive) {
                  setSelectedMode(mode);
                  setPhaseSecondsLeft(mode.inhale);
                }
              }}
              disabled={isActive}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                isSelected
                  ? 'bg-[#7A9A70] text-[#FAF8F3] border-[#7A9A70] shadow-sm'
                  : 'bg-[#FFFFFF] text-[#434840] border-[rgba(122,154,112,0.18)] hover:border-[#AED0A2]'
              } ${isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {mode.name}
            </button>
          );
        })}
      </div>

      {/* Main Breathing Visualizer Canvas */}
      <div className="relative py-8 flex flex-col items-center justify-center">
        {/* Soft Ambient Radial Rings */}
        <div
          className={`absolute w-72 h-72 rounded-full transition-all ease-in-out pointer-events-none ${
            currentPhase === 'inhale'
              ? 'bg-[#E9FFEC] shadow-glow-sage opacity-80 scale-110 duration-[4000ms]'
              : currentPhase === 'hold1' || currentPhase === 'hold2'
              ? 'bg-[#EBE7FA] shadow-glow-lavender opacity-75 scale-110 duration-1000'
              : 'bg-[#F4F1EA] opacity-40 scale-95 duration-[4000ms]'
          }`}
        />

        <div
          className={`relative z-10 w-56 h-56 rounded-full bg-gradient-to-br from-[#FFFFFF] via-[#FAF8F3] to-[#E1FAE4] border-2 border-[#7A9A70]/30 shadow-sanctuary flex flex-col items-center justify-center transition-transform ease-in-out ${getCircleScaleClass()}`}
        >
          {/* Phase Badge */}
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7A9A70] mb-1">
            {currentPhase === 'ready' ? 'Ready' : currentPhase.replace(/\d/, '')}
          </span>

          {/* Large Countdown Digits */}
          <span className="text-5xl font-serif text-[#1B3022] font-semibold tracking-tighter">
            {isActive ? phaseSecondsLeft : selectedMode.inhale}
          </span>
          <span className="text-[11px] text-[#73796F] mt-0.5">seconds</span>
        </div>

        {/* Phase instructions */}
        <p className="mt-6 text-sm font-serif italic text-[#1B3022] text-center min-h-6">
          {getPhasePrompt()}
        </p>

        {/* Small stats ticker */}
        <div className="mt-2 flex items-center space-x-3 text-xs text-[#73796F]">
          <span>Cycles: <strong className="text-[#1B3022]">{completedCycles}</strong></span>
          <span>•</span>
          <span>Elapsed: <strong className="text-[#1B3022]">{Math.floor(totalElapsedSeconds / 60)}:{String(totalElapsedSeconds % 60).padStart(2, '0')}</strong></span>
        </div>
      </div>

      {/* Target Duration Selector & Overall Progress */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[rgba(122,154,112,0.15)] p-4 shadow-sanctuary space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1B3022]">Session Target</span>
          <div className="flex items-center space-x-1.5">
            {[1, 3, 5].map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (!isActive) setTargetDurationMinutes(m);
                }}
                disabled={isActive}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  targetDurationMinutes === m
                    ? 'bg-[#E1FAE4] text-[#486640] border border-[#AED0A2]'
                    : 'text-[#73796F] hover:text-[#1B3022]'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Continuous progress track */}
        <div className="w-full bg-[#F4F1EA] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#7A9A70] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Control Actions */}
      <div className="flex items-center justify-center space-x-4 pt-2">
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[rgba(122,154,112,0.2)] text-[#73796F] hover:text-[#1B3022] flex items-center justify-center shadow-sm hover:bg-[#F4F1EA] transition-all"
          title="Reset timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {!isActive ? (
          <button
            onClick={handleStart}
            className="px-8 h-14 rounded-full bg-[#7A9A70] hover:bg-[#68855F] text-[#FAF8F3] font-semibold text-sm flex items-center space-x-2 shadow-sanctuary hover:shadow-glow-sage active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{currentPhase === 'ready' ? 'Begin Session' : 'Resume'}</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-8 h-14 rounded-full bg-[#605984] hover:bg-[#48416A] text-[#FAF8F3] font-semibold text-sm flex items-center space-x-2 shadow-sanctuary hover:shadow-glow-lavender active:scale-95 transition-all"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Pause</span>
          </button>
        )}
      </div>

      {/* Completion Modal / Card */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-[#1B3022]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[rgba(122,154,112,0.2)] rounded-[32px] p-6 max-w-sm w-full shadow-sanctuary-hover space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#E1FAE4] text-[#486640] flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif text-[#1B3022] font-semibold">
                Session Completed
              </h3>
              <p className="text-xs text-[#434840]">
                You grounded your breath for {targetDurationMinutes} minute{targetDurationMinutes > 1 ? 's' : ''}.
                Notice the quiet warmth in your chest.
              </p>
            </div>

            <div className="bg-[#FAF8F3] rounded-2xl p-3 flex justify-around text-xs border border-[rgba(122,154,112,0.12)]">
              <div>
                <span className="block text-[10px] text-[#73796F]">Cycles</span>
                <span className="font-semibold text-[#1B3022] text-sm">{completedCycles}</span>
              </div>
              <div className="border-r border-[rgba(122,154,112,0.15)]" />
              <div>
                <span className="block text-[10px] text-[#73796F]">Streak</span>
                <span className="font-semibold text-[#1B3022] text-sm">{profile.streakDays} Days</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  onNavigate('chat');
                }}
                className="w-full h-12 rounded-full bg-[#7A9A70] hover:bg-[#68855F] text-[#FAF8F3] font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Reflect with Solace AI</span>
              </button>

              <button
                onClick={() => {
                  setIsCompleted(false);
                  handleReset();
                }}
                className="w-full h-11 rounded-full bg-[#F4F1EA] hover:bg-[#EBE7DF] text-[#1B3022] font-medium text-xs transition-colors"
              >
                Return to Breath
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
