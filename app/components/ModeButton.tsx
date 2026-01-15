"use client";

import { IconType } from "react-icons";

interface ModeButtonProps {
  active: boolean;
  onClick: () => void;
  iconOn: IconType;
  iconOff: IconType;
  label: string;
  activeClass: string;
}

export const ModeButton = ({ 
  active, 
  onClick, 
  iconOn: IconOn, 
  iconOff: IconOff, 
  label, 
  activeClass 
}: ModeButtonProps) => {
  const Icon = active ? IconOn : IconOff;

  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase transition-all duration-300 ${
        active 
          ? `${activeClass} shadow-[0_0_15px_-5px_currentColor]` 
          : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20"
      }`}
    >
      <Icon 
        size={14} 
        className={`transition-transform duration-500 ${active ? "animate-pulse scale-110" : "opacity-50"}`} 
      />
      <span className="tracking-widest">
        {label}: <span className={active ? "opacity-100" : "opacity-50"}>{active ? "On" : "Off"}</span>
      </span>
    </button>
  );
};