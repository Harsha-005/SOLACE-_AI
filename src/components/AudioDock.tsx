import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Sparkles, Wind, ChevronUp, ChevronDown } from 'lucide-react';
import { soundscape } from '../utils/audio';
import { UserProfile } from '../types';

interface AudioDockProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const AudioDock: React.FC<AudioDockProps> = ({ profile, onUpdateProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSound, setCurrentSound] = useState(profile.ambientSound || 'none');
  const [volume, setVolume] = useState(profile.ambientVolume || 0.4);

  useEffect(() => {
    soundscape.setVolume(volume);
  }, [volume]);

  const handleSelectSound = (sound: 'none' | 'rain' | 'stream' | 'crickets' | 'drone') => {
    if (currentSound === sound) {
      soundscape.playAmbient('none');
      setCurrentSound('none');
      onUpdateProfile({ ambientSound: 'none' });
    } else {
      soundscape.playAmbient(sound);
      setCurrentSound(sound);
      onUpdateProfile({ ambientSound: sound });
    }
  };

  const soundOptions = [
    { id: 'rain' as const, label: 'Rain', icon: CloudRain, desc: 'Soft eucalyptus drizzle' },
    { id: 'stream' as const, label: 'Stream', icon: Waves, desc: 'Quiet mountain brook' },
    { id: 'drone' as const, label: 'Drone', icon: Wind, desc: '432Hz deep meditative hum' },
    { id: 'crickets' as const, label: 'Night', icon: Sparkles, desc: 'Twilight meadow song' },
  ];

  return (
    <div className="fixed bottom-20 left-0 right-0 z-30 px-4 max-w-md mx-auto pointer-events-none">
      <div className="pointer-events-auto transition-all duration-300">
        {/* Compact Bar */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[rgba(250,248,243,0.92)] backdrop-blur-xl border border-[rgba(122,154,112,0.18)] rounded-full px-4 py-2.5 shadow-sanctuary flex items-center justify-between cursor-pointer hover:border-[#7A9A70] transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              currentSound !== 'none' ? 'bg-[#7A9A70] text-[#FAF8F3] shadow-glow-sage' : 'bg-[#F4F1EA] text-[#486640]'
            }`}>
              {currentSound !== 'none' ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A9A70] block leading-none">
                Ambient Sanctuary
              </span>
              <span className="text-xs font-medium text-[#1B3022] capitalize">
                {currentSound === 'none' ? 'Restful silence' : `${currentSound} soundscape`}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentSound !== 'none' && (
              <span className="text-[10px] bg-[#E9FFEC] text-[#486640] px-2 py-0.5 rounded-full font-medium border border-[#AED0A2]">
                Playing
              </span>
            )}
            <button
              type="button"
              className="text-[#486640] p-1 rounded-full hover:bg-[#F4F1EA]"
              aria-label="Toggle ambient controls"
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Soundscape Drawer */}
        {isOpen && (
          <div className="mt-2 bg-[#FFFFFF] border border-[rgba(122,154,112,0.2)] rounded-3xl p-4 shadow-sanctuary-hover space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1B3022]">Generative Soundscapes</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectSound('none');
                }}
                className="text-[11px] text-[#7A9A70] hover:text-[#486640] font-medium"
              >
                Mute All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {soundOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = currentSound === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectSound(opt.id)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#E9FFEC] border-[#7A9A70] text-[#1B3022] shadow-sm'
                        : 'bg-[#FAF8F3] border-transparent hover:border-[rgba(122,154,112,0.2)] text-[#1B3022]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#7A9A70] text-white' : 'bg-[#F4F1EA] text-[#486640]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-[10px] text-[#434840] line-clamp-1">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Volume slider */}
            <div className="pt-1 border-t border-[rgba(122,154,112,0.12)] flex items-center space-x-3">
              <Volume2 className="w-4 h-4 text-[#7A9A70] shrink-0" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  onUpdateProfile({ ambientVolume: val });
                }}
                className="w-full h-1.5 bg-[#F4F1EA] accent-[#7A9A70] rounded-full appearance-none cursor-pointer"
              />
              <span className="text-[11px] font-mono text-[#7A9A70] w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
