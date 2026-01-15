"use client";

import { VscDashboard, VscWatch, VscCheckAll } from "react-icons/vsc";

interface StatsOverlayProps {
  wpm: number;
  timeElapsed: number;
  formatTime: (ms: number) => string;
  finished: boolean;
  accuracy: number; // Porcentaje de precisión
  progress: number; // Porcentaje de completado
  accentClass: string;
}

/**
 * StatsOverlay Component
 * Muestra las métricas de rendimiento en tiempo real sobre el terminal.
 */
export const StatsOverlay = ({
  wpm,
  timeElapsed,
  formatTime,
  finished,
  accuracy,
  progress,
  accentClass,
}: StatsOverlayProps) => {
  return (
    <div className="flex items-center gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Métrica: WPM */}
      <div className="group flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          <VscDashboard className="text-zinc-500 group-hover:text-emerald-400 transition-colors" size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Speed</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-white tabular-nums tracking-tighter">
            {wpm}
          </span>
          <span className={`text-xs font-bold uppercase tracking-widest ${accentClass}`}>WPM</span>
        </div>
      </div>

      {/* Métrica: Tiempo */}
      <div className="group flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          <VscWatch className="text-zinc-500 group-hover:text-blue-400 transition-colors" size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Timer</span>
        </div>
        <div className="text-4xl font-black text-white/90 tabular-nums tracking-tighter">
          {formatTime(timeElapsed)}
        </div>
      </div>

      {/* Métrica: Precisión / Progreso */}
      <div className="group flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1">
          <VscCheckAll className="text-zinc-500 group-hover:text-purple-400 transition-colors" size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {finished ? "Completed" : "Progress"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black text-white/90 tabular-nums tracking-tighter">
            {finished ? accuracy : progress}%
          </div>
          
          {/* Barra de progreso circular pequeña o lineal */}
          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 border border-white/5">
             <div 
               className={`h-full transition-all duration-500 ease-out ${finished ? 'bg-emerald-400' : 'bg-white/20'}`}
               style={{ width: `${progress}%` }}
             />
          </div>
        </div>
      </div>

      {/* Mensaje de Finalización */}
      {finished && (
        <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-bounce">
          <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            Snippet Mastered!
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsOverlay;