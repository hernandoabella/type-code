import { ACCENTS } from "@/app/config/constants";
import { useState, useRef, useEffect } from "react";

interface AccentsProps {
  currentAccent: any;
  setAccent: (accent: any) => void;
}

export const Accents = ({ currentAccent, setAccent }: AccentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-center w-12 h-12 rounded-xl hover:bg-white/5 transition-all group"
      >
        <div className={`w-5 h-5 rounded-full ${currentAccent.bg} shadow-lg group-hover:scale-110 transition-transform duration-300`} />
      </button>

      {/* Dropdown Menu */}
      <div className={`absolute top-[calc(100%+16px)] right-0 w-48 p-2 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 origin-top-right ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
      }`}>
        <div className="px-3 py-2 mb-1 border-b border-white/5">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Select Theme</span>
        </div>

        {ACCENTS.map((acc: any) => (
          <button 
            key={acc.name} 
            onClick={() => { setAccent(acc); setIsOpen(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest ${
              currentAccent.name === acc.name ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${acc.bg} ${currentAccent.name === acc.name ? 'ring-4 ring-white/10' : ''}`} />
            {acc.name}
          </button>
        ))}
      </div>
    </div>
  );
};