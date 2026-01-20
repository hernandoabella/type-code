import { ACCENTS } from "@/app/config/constants";
import { useState, useRef, useEffect } from "react";

// Definimos una interfaz clara para evitar el 'any'
interface AccentType {
  name: string;
  class: string;
  bg: string;
  shadow: string;
}

interface AccentsProps {
  currentAccent: AccentType;
  setAccent: (accent: AccentType) => void;
}

export const Accents = ({ currentAccent, setAccent }: AccentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEvents = (e: any) => {
      if (e.key === "Escape") setIsOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
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
      {/* Botón Principal - El círculo que brilla */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative flex items-center justify-center w-12 h-12 rounded-xl hover:bg-white/5 transition-all group"
        title="Change UI Accent"
      >
        {/* Glow dinámico detrás del círculo */}
        <div className={`absolute inset-0 ${currentAccent.bg} blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
        
        <div className={`
          w-5 h-5 rounded-full ${currentAccent.bg} ${currentAccent.shadow}
          transition-all duration-500 transform group-hover:scale-110
        `} />
      </button>

      {/* Menú Desplegable */}
      <div className={`
        absolute top-[calc(100%+16px)] right-0 w-52 p-2 
        bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 
        rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
        transition-all duration-300 origin-top-right
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}
      `}>
        <div className="px-4 py-3 mb-2 border-b border-white/5">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Theme</span>
        </div>

        <div className="flex flex-col gap-1">
          {ACCENTS.map((acc) => (
            <button 
              key={acc.name} 
              onClick={() => { 
                setAccent(acc); 
                setIsOpen(false); 
              }}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl transition-all group/item
                ${currentAccent.name === acc.name ? 'bg-white/10' : 'hover:bg-white/5'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${acc.bg} ${acc.shadow} transition-transform group-hover/item:scale-125`} />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${currentAccent.name === acc.name ? 'text-white' : 'text-zinc-400'}`}>
                  {acc.name}
                </span>
              </div>
              
              {/* Checkmark pequeño si está activo */}
              {currentAccent.name === acc.name && (
                <div className={`w-1 h-1 rounded-full ${acc.bg} animate-pulse`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};