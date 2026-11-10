import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isFramed, setIsFramed] = useState(true);

  // Current simulated time
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#E5DFD5] flex flex-col items-center justify-start p-0 md:py-6 selection:bg-[#caecbd]">
      {/* Frame Mode Switcher for Desktop */}
      <div className="hidden md:flex items-center space-x-2 mb-3 bg-[#FFFFFF] border border-[rgba(122,154,112,0.2)] rounded-full px-3 py-1 shadow-sm text-xs text-[#1B3022]">
        <span className="text-[11px] font-semibold text-[#7A9A70] flex items-center space-x-1">
          <span>Android Preview:</span>
        </span>
        <button
          onClick={() => setIsFramed(true)}
          className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full transition-all ${
            isFramed
              ? 'bg-[#7A9A70] text-[#FAF8F3] font-semibold'
              : 'text-[#434840] hover:text-[#1B3022]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Device Shell</span>
        </button>
        <button
          onClick={() => setIsFramed(false)}
          className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full transition-all ${
            !isFramed
              ? 'bg-[#7A9A70] text-[#FAF8F3] font-semibold'
              : 'text-[#434840] hover:text-[#1B3022]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Width</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isFramed
            ? 'max-w-[430px] md:h-[890px] md:rounded-[44px] md:border-[10px] md:border-[#1E2520] md:shadow-[0_25px_60px_-15px_rgba(27,48,34,0.35)] overflow-hidden relative flex flex-col bg-[#FAF8F3]'
            : 'max-w-2xl bg-[#FAF8F3] md:rounded-3xl shadow-sm min-h-screen flex flex-col relative'
        }`}
      >
        {/* Android Status Bar in Framed Mode */}
        {isFramed && (
          <div className="h-9 px-6 bg-[#FAF8F3] flex items-center justify-between text-[11px] font-medium text-[#1B3022] z-50 select-none shrink-0 border-b border-[rgba(122,154,112,0.08)]">
            <span>{timeStr}</span>
            {/* Front camera notch/hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#1E2520] -ml-2" />
            <div className="flex items-center space-x-1.5 text-[#1B3022]">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        )}

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto relative no-scrollbar">
          {children}
        </div>

        {/* Android Gesture Bar */}
        {isFramed && (
          <div className="h-4 bg-[#FAF8F3] flex items-center justify-center shrink-0 pb-1 z-50">
            <div className="w-32 h-1 bg-[#1B3022]/40 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
