"use client";

import { 
  VscCircuitBoard, 
  VscTypeHierarchy, 
  VscColorMode, 
  VscTextSize,
  VscEye,      
  VscEyeClosed, 
  VscTarget,
  VscLock,    // Icono para Blind Mode ON
   // Icono para Blind Mode OFF
} from "react-icons/vsc";
import { CustomSelect } from "./CustomSelect";
import { ModeButton } from "./ModeButton";
import { ACCENTS, MODES_CONFIG, HIGHLIGHT_THEMES, FONTS } from "@/app/config/constants";

interface NavbarProps {
  accent: any;
  selectedAccent: any;
  setSelectedAccent: (accent: any) => void;
  langFilter: string;
  setLangFilter: (lang: string) => void;
  languages: string[];
  selectedFont: any;
  setSelectedFont: (font: any) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  editorTheme: any;
  setEditorTheme: (theme: any) => void;
  isGhostActive: boolean;
  setIsGhostActive: (val: boolean) => void;
  autoWriting: boolean;
  setAutoWriting: (val: boolean) => void;
  autoPilot: boolean;
  setAutoPilot: (val: boolean) => void;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;
  isRecallMode: boolean;
  setIsRecallMode: (val: boolean) => void;
  // --- NUEVO PROP ---
  isBlindMode: boolean;
  setIsBlindMode: (val: boolean) => void;
}

export const Navbar = ({
  accent,
  selectedAccent,
  setSelectedAccent,
  langFilter,
  setLangFilter,
  languages,
  selectedFont,
  setSelectedFont,
  fontSize,
  setFontSize,
  editorTheme,
  setEditorTheme,
  isGhostActive,
  setIsGhostActive,
  autoWriting,
  setAutoWriting,
  autoPilot,
  setAutoPilot,
  isZenMode,
  setIsZenMode,
  isRecallMode,
  setIsRecallMode,
  isBlindMode,
  setIsBlindMode,
}: NavbarProps) => {

  return (
    <nav className={`relative w-full z-[100] transition-all duration-1000 ${isZenMode ? "opacity-0 -translate-y-20 pointer-events-none" : "opacity-100 translate-y-0"}`}>
      
      {/* BARRA PRINCIPAL (TOP) */}
      <div className="flex h-16 items-center justify-between px-8 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl relative z-50">
        
        {/* IZQUIERDA: Brand */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black text-white tracking-tighter">
              Type<span className={`${accent.class} drop-shadow-[0_0_8px_currentColor]`}>Code</span>
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <CustomSelect label="Language" value={langFilter} options={languages} onChange={setLangFilter} isLang={true} />
        </div>

        {/* CENTRO: Editor Tools */}
        <div className="flex items-center gap-3 px-4 py-1.5 bg-white/[0.02] border border-white/5 rounded-2xl">
          <CustomSelect label="Typeface" value={selectedFont.name} options={FONTS} onChange={setSelectedFont} icon={VscTypeHierarchy} />
          <div className="w-px h-4 bg-white/10" />
          <CustomSelect label="Size" value={fontSize} options={["14px", "16px", "18px", "19px", "20px", "22px", "24px"]} onChange={setFontSize} icon={VscTextSize} />
          <div className="w-px h-4 bg-white/10" />
          <CustomSelect label="Theme" value={editorTheme.name} options={HIGHLIGHT_THEMES} onChange={setEditorTheme} icon={VscColorMode} />
        </div>

        {/* DERECHA: Zen Toggle */}
        <div className="flex items-center px-4">
          <button 
            onClick={() => setIsZenMode(true)}
            className="group relative flex items-center gap-3 py-2 px-4 rounded-xl hover:bg-white/[0.03] transition-all duration-300"
            title="Press ESC to exit Zen Mode"
          >
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">
                Focus
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-20 transition-all duration-500 blur-sm" />
              <VscTarget 
                size={20} 
                className="relative text-white/40 group-hover:text-white group-hover:rotate-90 transition-all duration-500 ease-out" 
              />
            </div>
          </button>
        </div>
      </div>

      {/* BARRA INFERIOR: Modos y Acentos */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700 z-40">
        
        {/* PANEL DE MODOS */}
        <div className="flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl">
          
          {/* MODO RECALL (Especial - Morado) */}
          <ModeButton
            label="Recall"
            active={isRecallMode}
            onClick={() => setIsRecallMode(!isRecallMode)}
            iconOn={VscEye}
            iconOff={VscEyeClosed}
            activeClass="bg-purple-500/20 border-purple-500/50 text-purple-400"
          />

          {/* MODO BLIND (Nuevo - Naranja) */}
          <ModeButton
            label="Blind"
            active={isBlindMode}
            onClick={() => setIsBlindMode(!isBlindMode)}
            iconOn={VscLock}
            iconOff={VscLock}
            activeClass="bg-orange-500/20 border-orange-500/50 text-orange-400"
          />

          {/* RESTO DE MODOS (Ghost, Bot, etc) */}
          {MODES_CONFIG.map((mode) => {
            const isActive = mode.id === "ghost" ? isGhostActive : mode.id === "bot" ? autoWriting : autoPilot;
            const toggle = mode.id === "ghost" ? () => setIsGhostActive(!isGhostActive) : mode.id === "bot" ? () => setAutoWriting(!autoWriting) : () => setAutoPilot(!autoPilot);

            return (
              <ModeButton
                key={mode.id}
                active={isActive}
                onClick={toggle}
                label={mode.label}
                iconOn={mode.iconOn}
                iconOff={mode.iconOff}
                activeClass={mode.activeClass}
              />
            );
          })}
        </div>

        {/* PANEL DE ACENTOS */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl">
          {ACCENTS.map((a: any) => (
            <button
              key={a.name}
              onClick={() => setSelectedAccent(a)}
              className="group relative flex items-center justify-center"
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${a.bg} ${
                selectedAccent.name === a.name 
                  ? "scale-125 ring-2 ring-white/40 shadow-[0_0_12px_rgba(255,255,255,0.3)]" 
                  : "scale-100 opacity-30 group-hover:opacity-100"
              }`} />
              {selectedAccent.name === a.name && (
                <span className={`absolute -bottom-1 w-1 h-1 rounded-full ${a.bg} blur-[1px]`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};