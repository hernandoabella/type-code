"use client";

import { VscChevronLeft, VscChevronRight } from "react-icons/vsc";

interface StatsDockProps {
  wpm: number;
  accent: {
    class: string;
    bg: string;
  };
  timeElapsed: number;
  formatTime: (ms: number) => string;
  prevSnippet: () => void;
  nextSnippet: () => void;
}

export const StatsDock = ({
  wpm,
  accent,
  timeElapsed,
  formatTime,
  prevSnippet,
  nextSnippet,
}: StatsDockProps) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl">
      {/* Métrica: WPM */}
      <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
        <div className="flex items-baseline gap-2 justify-center font-mono">
          <span className="text-4xl font-black text-white">{wpm}</span>
          <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
        </div>
      </div>

      {/* Métrica: Tiempo */}
      <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[120px]">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Total_Time</span>
        <div className="flex items-baseline gap-2 justify-center font-mono text-white">
          <span className="text-4xl font-black">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex items-center gap-3 pr-2">
        <button 
          onClick={prevSnippet} 
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"
        >
          <VscChevronLeft size={20} />
        </button>
        <button 
          onClick={nextSnippet} 
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"
        >
          <VscChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};