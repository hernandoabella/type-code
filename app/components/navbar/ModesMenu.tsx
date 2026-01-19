"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  VscChevronDown, VscEyeClosed, VscFlame, VscGist, VscGraph, 
  VscHistory, VscLock, VscMap, VscMortarBoard, VscRunAll, 
  VscTerminal, VscWatch, VscWorkspaceTrusted 
} from 'react-icons/vsc';

// Sub-componente interno para los títulos de sección
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-2 mt-4 first:mt-0 border-b border-white/5 mb-3">
    <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">{children}</span>
  </div>
);

// Sub-componente interno para cada botón de modo
const ModeButton = ({ label, active, onClick, icon: Icon, info, color, accentBg }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 p-5 rounded-2xl transition-all duration-300 group/item ${
      active ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5 opacity-70'
    }`}
  >
    <div className={`p-4 rounded-xl ${active ? 'bg-white/10' : 'bg-black/40'} transition-all`}>
      <Icon size={26} className={active ? color : 'text-zinc-500'} />
    </div>
    <div className="flex flex-col items-start text-left">
      <span className={`text-[13px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-zinc-400'}`}>
        {label}
      </span>
      <p className="text-[11px] leading-snug text-zinc-500 group-hover/item:text-zinc-300 mt-1 font-medium">
        {info}
      </p>
    </div>
    {active && <div className={`ml-auto w-2 h-2 rounded-full ${accentBg} shadow-[0_0_10px_currentColor]`} />}
  </button>
);

export const ModesMenu = ({ props }: { props: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera o presionar Escape
  useEffect(() => {
    const handleEvents = (e: any) => {
      if (e.key === 'Escape') setIsOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleEvents);
    document.addEventListener("keydown", handleEvents);
    return () => {
      document.removeEventListener("mousedown", handleEvents);
      document.removeEventListener("keydown", handleEvents);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-6 h-12 rounded-xl transition-all duration-300 ${
          isOpen ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        <VscMap size={20} className={isOpen ? props.accent.class : ''} />
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Modes</span>
        <VscChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* MEGA MENU DROPDOWN */}
      <div className={`absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-[900px] p-8 bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] transition-all duration-500 origin-top grid grid-cols-3 gap-10 ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-8 pointer-events-none'
      }`}>
        
        {/* COLUMN 1: Gameplay */}
        <div className="flex flex-col gap-3">
          <SectionTitle>Gameplay</SectionTitle>
          <ModeButton label="Shadow" active={props.isShadowMode} onClick={() => props.setIsShadowMode(!props.isShadowMode)} icon={VscMap} color="text-cyan-400" accentBg={props.accent.bg} info="Race against an AI bot mirroring your speed." />
          <ModeButton label="Time Attack" active={props.isTimeAttack} onClick={() => props.setIsTimeAttack(!props.isTimeAttack)} icon={VscWatch} color="text-blue-400" accentBg={props.accent.bg} info="Beat the countdown before the code expires." />
          <ModeButton label="Survival" icon={VscRunAll} color="text-orange-500" accentBg={props.accent.bg} info="Increasing difficulty. One life. Don't stop." />
          <ModeButton label="Hardcore" active={props.isHardcoreMode} onClick={() => props.setIsHardcoreMode(!props.isHardcoreMode)} icon={VscFlame} color="text-red-500" accentBg={props.accent.bg} info="Any mistake resets the entire sequence." />
        </div>

        {/* COLUMN 2: Learning */}
        <div className="flex flex-col gap-3">
          <SectionTitle>Learning</SectionTitle>
          <ModeButton label="Coach AI" icon={VscWorkspaceTrusted} color="text-indigo-400" accentBg={props.accent.bg} info="Real-time feedback on your typing patterns." />
          <ModeButton label="Interview" icon={VscLock} color="text-white" accentBg={props.accent.bg} info="Strict environment for job preparation." />
          <ModeButton label="Path Mode" icon={VscMortarBoard} color="text-emerald-400" accentBg={props.accent.bg} info="Level up from Junior to Senior Architect." />
          <ModeButton label="Combo" icon={VscHistory} color="text-yellow-400" accentBg={props.accent.bg} info="Chain perfect snippets for massive score." />
        </div>

        {/* COLUMN 3: Visuals */}
        <div className="flex flex-col gap-3">
          <SectionTitle>Visuals</SectionTitle>
          <ModeButton label="CRT Terminal" icon={VscTerminal} color="text-green-500" accentBg={props.accent.bg} info="Retro 80s aesthetic with screen flicker." />
          <ModeButton label="Ghost" active={props.isGhostActive} onClick={() => props.setIsGhostActive(!props.isGhostActive)} icon={VscGist} color="text-zinc-300" accentBg={props.accent.bg} info="Transparent background code guide." />
          <ModeButton label="Recall" active={props.isRecallMode} onClick={() => props.setIsRecallMode(!props.isRecallMode)} icon={VscEyeClosed} color="text-purple-500" accentBg={props.accent.bg} info="Code vanishes as you start typing." />
          <ModeButton label="Heatmap" icon={VscGraph} color="text-pink-500" accentBg={props.accent.bg} info="See your most frequent error zones." />
        </div>
      </div>
    </div>
  );
};

export default ModesMenu;