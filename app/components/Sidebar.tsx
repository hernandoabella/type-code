"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  Trophy, 
  Activity, 
  BrainCircuit, 
  Flame,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Cpu
} from "lucide-react";

interface SidebarProps {
  userStats: {
    points: number;
    rank: string;
    accuracy: number;
    streak: number;
    completion: number;
  };
  isBlindMode: boolean;
}

export const Sidebar = ({ userStats, isBlindMode }: SidebarProps) => {
  return (
    <div className="h-full w-full flex flex-col bg-[#080808] border-l border-white/5 p-6 overflow-y-auto custom-scrollbar">
      
      {/* HEADER: NEURAL INTERFACE */}
      <div className="flex items-center gap-3 mb-10 pt-4">
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
          <Cpu size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Neural_Interface</span>
          <span className="text-[9px] font-mono text-zinc-600">v.4.0.2-stable</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* CARD: USER RANK - MÁS LIMPIO Y INTEGRADO */}
        <div className="relative overflow-hidden">
          <div className="space-y-1 mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Agent_Status
            </span>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">
              {userStats.rank}
            </h3>
          </div>

          <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-3xl p-5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-zinc-500 italic">Sync_Ratio</span>
              <span className="text-white font-mono">{userStats.completion}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${userStats.completion}%` }}
                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              />
            </div>
          </div>
        </div>

        {/* QUICK STATS: BENTO STYLE */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 transition-hover hover:bg-white/[0.05]">
            <Zap size={14} className="text-yellow-400 mb-2" />
            <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest">Points</span>
            <span className="text-lg font-black text-white font-mono">{userStats.points.toLocaleString()}</span>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 transition-hover hover:bg-white/[0.05]">
            <Flame size={14} className="text-orange-500 mb-2" />
            <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest">Streak</span>
            <span className="text-lg font-black text-white font-mono">{userStats.streak}d</span>
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="space-y-4">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">System_Performance</span>
          
          <div className="space-y-1">
            <DetailRow 
              icon={<Target size={14} />} 
              label="Precision" 
              value={`${userStats.accuracy}%`} 
            />
            <DetailRow 
              icon={<ShieldCheck size={14} />} 
              label="Blind_Mod" 
              value={isBlindMode ? "Active" : "Locked"} 
              highlight={isBlindMode}
            />
            <DetailRow 
              icon={<Trophy size={14} />} 
              label="Global_Net" 
              value="#1,204" 
            />
          </div>

          {/* ACTIVITY MINI-CHART: MÁS ESTILIZADO */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-zinc-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Neural_Load</span>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-12">
              {[40, 70, 45, 90, 65, 80, 50, 30, 60, 85].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.03, ease: "circOut" }}
                  className="flex-1 bg-zinc-800 rounded-t-[2px] relative group/bar transition-colors hover:bg-white/40"
                />
              ))}
            </div>
          </div>
        </div>

        {/* REWARDS AREA: CTA TERMINAL */}
        <div className="mt-auto pt-10">
          <button className="group relative w-full p-[1px] rounded-2xl overflow-hidden transition-transform active:scale-95">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-white/20 to-zinc-800 animate-[shimmer_2s_infinite]" />
            <div className="relative bg-black rounded-2xl py-4 flex items-center justify-center gap-2 group-hover:bg-zinc-900 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Claim_Rewards
              </span>
              <ChevronRight size={14} className="text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-4 opacity-20">
            <Terminal size={14} />
            <div className="w-1 h-1 rounded-full bg-zinc-500" />
            <span className="text-[8px] font-mono tracking-tighter text-zinc-400 uppercase">System_Encrypted</span>
          </div>
        </div>

      </div>
    </div>
  );
};

/* --- MINI SUB-COMPONENTS --- */

const DetailRow = ({ icon, label, value, highlight = false }: any) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
    <div className="flex items-center gap-3">
      <div className={`transition-colors ${highlight ? 'text-red-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{label}</span>
    </div>
    <span className={`text-[11px] font-mono font-black ${highlight ? 'text-red-500' : 'text-zinc-300'}`}>
      {value}
    </span>
  </div>
);