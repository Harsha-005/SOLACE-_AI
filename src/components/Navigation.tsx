import React from 'react';
import { Home, Sparkles, Wind, User } from 'lucide-react';
import { ScreenType } from '../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: 'home' as ScreenType, label: 'Sanctuary', icon: Home },
    { id: 'chat' as ScreenType, label: 'Solace AI', icon: Sparkles },
    { id: 'breathing' as ScreenType, label: 'Breath', icon: Wind },
    { id: 'profile' as ScreenType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[rgba(250,248,243,0.92)] backdrop-blur-xl border-t border-[rgba(122,154,112,0.18)] pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 ${
                isActive ? 'text-[#1B3022]' : 'text-[#73796F] hover:text-[#486640]'
              }`}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-x-1.5 -inset-y-0.5 bg-[#E1FAE4] border border-[#AED0A2] rounded-full -z-10 shadow-sm transition-all" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#486640]' : ''}`} />
              <span className={`text-[11px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-semibold text-[#1B3022]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
