import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Compass, Shield, HeartHandshake } from 'lucide-react';
import { UserProfile } from '../../types';

interface OnboardingScreenProps {
  onComplete: (profileData: Partial<UserProfile>) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [selectedIntention, setSelectedIntention] = useState('Grounding in the Present');

  const intentions = [
    {
      id: 'grounding',
      title: 'Grounding in the Present',
      desc: 'Quiet sensory anchors to slow racing thoughts.',
      icon: '🍃',
    },
    {
      id: 'stress',
      title: 'Stress & Tension Relief',
      desc: 'Gentle nervous system reset through mindful breath.',
      icon: '🌊',
    },
    {
      id: 'sleep',
      title: 'Restorative Sleep & Ease',
      desc: 'Twilight calm to soften the weight of the day.',
      icon: '🌙',
    },
    {
      id: 'clarity',
      title: 'Emotional Clarity',
      desc: 'Compassionate AI companion dialogues and journaling.',
      icon: '🪷',
    },
  ];

  const handleFinish = () => {
    onComplete({
      name: name.trim() || 'Mindful Seeker',
      intention: selectedIntention,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B3022] flex flex-col justify-between px-6 py-8 max-w-md mx-auto">
      {/* Top Header & Botanical Emblem */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 bg-[#E1FAE4] border border-[#AED0A2] px-3 py-1 rounded-full text-xs font-semibold text-[#486640]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SOLACE AI SANCTUARY</span>
          </div>
          <span className="text-xs font-mono text-[#7A9A70]">Step {step} of 2</span>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            {/* Meditative Botanical Art SVG */}
            <div className="relative w-full h-44 rounded-3xl bg-gradient-to-b from-[#E9FFEC] to-[#FAF8F3] border border-[rgba(122,154,112,0.18)] p-4 flex items-center justify-center overflow-hidden shadow-sanctuary">
              {/* Soft ambient halos */}
              <div className="absolute w-36 h-36 bg-[#C8BFF0]/25 rounded-full blur-2xl top-2 left-6" />
              <div className="absolute w-40 h-40 bg-[#7A9A70]/20 rounded-full blur-2xl bottom-1 right-6" />

              <svg viewBox="0 0 200 160" className="w-48 h-40 relative z-10 drop-shadow-sm" fill="none">
                {/* River stone pebble bases */}
                <ellipse cx="100" cy="138" rx="72" ry="16" fill="#D0E9D4" opacity="0.6" />
                <ellipse cx="100" cy="128" rx="55" ry="12" fill="#E1FAE4" />
                <ellipse cx="100" cy="120" rx="38" ry="9" fill="#AED0A2" opacity="0.7" />

                {/* Botanical stem & lotus petals */}
                <path d="M100 120 C100 95, 96 70, 96 50" stroke="#486640" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M100 90 C118 84, 128 70, 130 52 C114 56, 104 74, 100 90 Z" fill="#7A9A70" opacity="0.9" />
                <path d="M96 78 C80 72, 70 58, 68 40 C84 44, 94 62, 96 78 Z" fill="#8EAA83" opacity="0.9" />
                <path d="M100 68 C100 48, 108 32, 100 20 C92 32, 100 48, 100 68 Z" fill="#C8BFF0" opacity="0.85" />

                {/* Floating calm energy particles */}
                <circle cx="62" cy="74" r="3.5" fill="#C8BFF0" opacity="0.8" />
                <circle cx="140" cy="62" r="3" fill="#7A9A70" opacity="0.8" />
                <circle cx="100" cy="14" r="2.5" fill="#486640" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-serif text-[#1B3022] leading-tight font-medium">
                Find your inner <br />
                <span className="italic text-[#486640]">whisper-quiet</span> sanctuary.
              </h1>
              <p className="text-sm text-[#434840] leading-relaxed">
                Step into a clinical mindfulness retreat engineered for emotional equilibrium.
                Companion dialogue with Gemini, somatic breathing, and quiet refuge.
              </p>
            </div>

            {/* Quality pillars */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-[#FFFFFF] border border-[rgba(122,154,112,0.12)] shadow-sm">
                <div className="p-2 rounded-xl bg-[#E1FAE4] text-[#486640]">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold block text-[#1B3022]">Context-Aware AI Companion</span>
                  <span className="text-[#434840]">Reflects with you based on your real logged feelings.</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-[#FFFFFF] border border-[rgba(122,154,112,0.12)] shadow-sm">
                <div className="p-2 rounded-xl bg-[#EBE7FA] text-[#605984]">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold block text-[#1B3022]">Private & Persistent Sanctuary</span>
                  <span className="text-[#434840]">Your mood journal and reflections stay with you.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-serif text-[#1B3022] font-medium">
                Set your intention
              </h2>
              <p className="text-xs text-[#434840] mt-1">
                Solace adapts its daily reflections and breathwork to your primary anchor.
              </p>
            </div>

            {/* Intentions Grid */}
            <div className="space-y-2.5">
              {intentions.map((item) => {
                const isSelected = selectedIntention === item.title;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIntention(item.title)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#E9FFEC] border-[#7A9A70] shadow-sm ring-1 ring-[#7A9A70]'
                        : 'bg-[#FFFFFF] border-[rgba(122,154,112,0.15)] hover:border-[#AED0A2]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl p-1.5 rounded-xl bg-[#FAF8F3]">{item.icon}</span>
                      <div>
                        <div className="text-xs font-semibold text-[#1B3022]">{item.title}</div>
                        <div className="text-[11px] text-[#434840]">{item.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#7A9A70] text-[#FAF8F3] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Preferred Name */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#1B3022] mb-1.5">
                How may Solace address you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena, Seeker, Friend"
                className="w-full bg-[#F4F1EA] border border-transparent focus:border-[#7A9A70] focus:bg-[#FFFFFF] rounded-2xl px-4 py-3 text-sm text-[#1B3022] outline-none transition-all placeholder:text-[#434840]/60"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="pt-6 pb-2">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            className="w-full h-13 rounded-full bg-[#7A9A70] hover:bg-[#68855F] active:scale-[0.98] text-[#FAF8F3] font-semibold text-sm flex items-center justify-center space-x-2 shadow-sanctuary transition-all"
          >
            <span>Begin Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setStep(1)}
              className="h-13 px-5 rounded-full bg-[#F4F1EA] text-[#434840] font-medium text-xs hover:bg-[#EBE7DF]"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 h-13 rounded-full bg-[#7A9A70] hover:bg-[#68855F] active:scale-[0.98] text-[#FAF8F3] font-semibold text-sm flex items-center justify-center space-x-2 shadow-sanctuary transition-all"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Enter Sanctuary</span>
            </button>
          </div>
        )}
        <p className="text-[11px] text-center text-[#73796F] mt-3">
          Whisper-quiet mindful sanctuary • Private & local storage
        </p>
      </div>
    </div>
  );
};
