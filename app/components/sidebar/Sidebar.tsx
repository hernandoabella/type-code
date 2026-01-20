"use client";

import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { 
  Zap, Target, Trophy, Activity, Flame, ShieldCheck, 
  ChevronRight, ChevronLeft, Settings, BrainCircuit, LogOut
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
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const Sidebar = ({ userStats, isBlindMode, isOpen, setIsOpen }: SidebarProps) => {
  return (
    <>
      {/* TRIGGER TOGGLE: Flota fuera de la sidebar para poder re-abrirla */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-[130] p-2 bg-[#080808] border border-white/10 rounded-full transition-all duration-500 hover:bg-white/5 hover:scale-110 shadow-2xl ${isOpen ? 'right-[305px]' : 'right-4'}`}
      >
        {isOpen ? <ChevronRight size={20} className="text-zinc-500" /> : <ChevronLeft size={20} className="text-white" />}
      </button>

      <motion.aside 
        initial={false}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="fixed right-0 top-0 h-full w-80 bg-[#080808] border-l border-white/5 z-[110] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* USER PROFILE */}
        <div className="p-8 pb-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/10">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#080808] rounded-full" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-white font-black text-sm tracking-tight uppercase leading-none">Synthesia_OS</h4>
              <span className="text-[10px] font-mono text-zinc-500 mt-1">@neural_coder</span>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Agent_Rank</span>
            <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-5 relative overflow-hidden group">
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase relative z-10">{userStats.rank}</h3>
              <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${userStats.completion}%` }}
                  className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                />
              </div>
              <BrainCircuit className="absolute -right-4 -bottom-4 text-white/[0.03] rotate-12" size={100} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-colors hover:bg-white/[0.05]">
              <Zap size={14} className="text-yellow-400 mb-2" />
              <span className="block text-lg font-black text-white font-mono">{userStats.points.toLocaleString()}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 transition-colors hover:bg-white/[0.05]">
              <Flame size={14} className="text-orange-500 mb-2" />
              <span className="block text-lg font-black text-white font-mono">{userStats.streak}d</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Performance_Logs</span>
            <div className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden">
              <DetailRow icon={<Target size={14} />} label="Precision" value={`${userStats.accuracy}%`} />
              <DetailRow icon={<ShieldCheck size={14} />} label="Blind_Mod" value={isBlindMode ? "Active" : "Locked"} highlight={isBlindMode} />
              <DetailRow icon={<Trophy size={14} />} label="Global_Net" value="#1,204" />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={12} className="text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Neural_Load</span>
            </div>
            <div className="flex items-end gap-1.5 h-12">
              {[40, 70, 45, 90, 65, 80, 50, 30, 60, 85].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05 }} className="flex-1 bg-zinc-800 rounded-t-[2px]" />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-black border-t border-white/5">
          <button className="flex items-center justify-between w-full p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-3 text-zinc-400"><Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" /> Settings</div>
            <ChevronRight size={14} />
          </button>
        </div>
      </motion.aside>
    </>
  );
};

const DetailRow = ({ icon, label, value, highlight = false }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`${highlight ? 'text-emerald-500' : 'text-zinc-500'}`}>{icon}</div>
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">{label}</span>
    </div>
    <span className={`text-[11px] font-mono font-black ${highlight ? 'text-emerald-500' : 'text-zinc-300'}`}>{value}</span>
  </div>
);