"use client";

import { useState, useRef, useEffect } from "react";
import { VscChevronDown, VscCode } from "react-icons/vsc";
import { LANG_ICONS, SNIPPETS } from "@/app/config/constants";
import { IconType } from "react-icons";

interface CustomSelectProps {
  label: string;
  value: any;
  options: any[];
  onChange: (option: any) => void;
  icon?: IconType;
  isLang?: boolean;
  activeModes?: Record<string, boolean>;
}

export const CustomSelect = ({ 
  label, 
  value, 
  options, 
  onChange, 
  icon: Icon, 
  isLang = false, 
  activeModes = {} 
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLabel = (val: any) => (typeof val === 'string' ? val : val.name);

  return (
    <div className="relative" ref={containerRef}>
      {/* Selector Principal */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="group flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-full px-4 py-1.5 cursor-pointer hover:bg-white/[0.06] transition-all active:scale-95"
      >
        {isLang ? (
          LANG_ICONS[value] || <VscCode size={12}/>
        ) : (
          Icon && <Icon size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
        )}
        
        <span className="text-[9px] font-black uppercase tracking-widest min-w-[60px] opacity-60 text-white font-sans">
            {isLang && value === "all" ? label : getLabel(value)}
        </span>
        
        <VscChevronDown 
          size={10} 
          className={`transition-transform duration-300 opacity-40 ${isOpen ? "rotate-180 opacity-100" : ""}`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full min-w-[220px] bg-[#0f0f0f] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-[60] backdrop-blur-xl max-h-60 overflow-y-auto font-sans animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt) => {
            const labelStr = getLabel(opt);
            const categoryMatch = SNIPPETS.find(s => s.lang === labelStr)?.category;
            const isModeActive = activeModes[labelStr.toLowerCase()];
            const isSelected = isLang ? value === labelStr : value.name === labelStr;

            return (
              <div 
                key={labelStr} 
                onClick={() => { onChange(opt); setIsOpen(false); }} 
                className={`px-5 py-2.5 text-[10px] font-bold uppercase cursor-pointer flex items-center justify-between group/item transition-colors ${
                  isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isLang && (LANG_ICONS[labelStr] || <VscCode size={12}/>)}
                  <span className={`${isModeActive || isSelected ? 'text-white' : 'text-zinc-500'} group-hover/item:text-white transition-colors`}>
                    {labelStr}
                  </span>
                </div>

                {/* Badge de Categoría (Para lenguajes) */}
                {isLang && categoryMatch && (
                  <span className="text-[8px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-600 border border-white/5 group-hover/item:border-white/10 group-hover/item:text-zinc-300 transition-all">
                    {categoryMatch}
                  </span>
                )}

                {/* Badge de Estado (Para modos) */}
                {!isLang && isModeActive !== undefined && (
                   <span className={`text-[7px] px-2 py-0.5 rounded-full border transition-all ${
                     isModeActive 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-transparent border-white/5 text-white/20'
                   }`}>
                        {isModeActive ? "ACTIVE" : "OFF"}
                   </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};