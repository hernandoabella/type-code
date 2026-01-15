"use client";

import { VscCircuitBoard, VscTypeHierarchy, VscColorMode, VscTextSize } from "react-icons/vsc";
import { CustomSelect } from "./CustomSelect";
import { ModeButton } from "./ModeButton";
import { ACCENTS, MODES_CONFIG, HIGHLIGHT_THEMES, FONTS } from "@/app/config/constants";

// Definimos las opciones de tamaño
const FONT_SIZES = ["14px", "16px", "18px", "19px", "20px", "22px", "24px"];

interface NavbarProps {
  accent: any;
  selectedAccent: any;
  setSelectedAccent: (accent: any) => void;
  langFilter: string;
  setLangFilter: (lang: string) => void;
  languages: string[];
  selectedFont: any;
  setSelectedFont: (font: any) => void;
  fontSize: string; // Nueva Prop
  setFontSize: (size: string) => void; // Nueva Prop
  editorTheme: any;
  setEditorTheme: (theme: any) => void;
  isGhostActive: boolean;
  setIsGhostActive: (val: boolean) => void;
  autoWriting: boolean;
  setAutoWriting: (val: boolean) => void;
  autoPilot: boolean;
  setAutoPilot: (val: boolean) => void;
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
}: NavbarProps) => {
  return (
    <nav className="flex h-16 items-center justify-between px-10 bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-xl font-black text-white tracking-tighter italic">
          Type<span className={accent.class}>Code</span>
        </span>
        <div className="h-6 w-px bg-white/10" />
        
        <div className="flex items-center gap-3">
          <CustomSelect
            label="Modes"
            value="Modes"
            options={MODES_CONFIG.map((m) => m.label)}
            activeModes={{ ghost: isGhostActive, bot: autoWriting, auto: autoPilot }}
            onChange={(opt: string) => {
              const mode = MODES_CONFIG.find((m) => m.label === opt);
              if (mode?.id === "ghost") setIsGhostActive(!isGhostActive);
              if (mode?.id === "bot") setAutoWriting(!autoWriting);
              if (mode?.id === "auto") setAutoPilot(!autoPilot);
            }}
            icon={VscCircuitBoard}
          />
          
          <CustomSelect
            label="Modules"
            value={langFilter}
            options={languages}
            onChange={setLangFilter}
            isLang={true}
          />
          
          <CustomSelect
            label="Fonts"
            value={selectedFont.name}
            options={FONTS}
            onChange={setSelectedFont}
            icon={VscTypeHierarchy}
          />

          {/* NUEVO SELECTOR DE TAMAÑO */}
          <CustomSelect
            label="Size"
            value={fontSize}
            options={FONT_SIZES}
            onChange={setFontSize}
            icon={VscTextSize}
          />
          
          <CustomSelect
            label="Themes"
            value={editorTheme.name}
            options={HIGHLIGHT_THEMES}
            onChange={setEditorTheme}
            icon={VscColorMode}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {MODES_CONFIG.map((mode) => {
          const isActive =
            mode.id === "ghost" ? isGhostActive : 
            mode.id === "bot" ? autoWriting : 
            mode.id === "auto" ? autoPilot : false;

          const toggle =
            mode.id === "ghost" ? () => setIsGhostActive(!isGhostActive) : 
            mode.id === "bot" ? () => setAutoWriting(!autoWriting) : 
            mode.id === "auto" ? () => setAutoPilot(!autoPilot) : () => {};

          return (
            <ModeButton
              key={mode.id}
              active={isActive}
              onClick={toggle}
              {...mode}
            />
          );
        })}

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full">
          {ACCENTS.map((a: any) => (
            <button
              key={a.name}
              onClick={() => setSelectedAccent(a)}
              className={`w-3.5 h-3.5 rounded-full transition-all ${a.bg} ${
                selectedAccent.name === a.name
                  ? "scale-125 shadow-[0_0_10px_currentColor]"
                  : "opacity-20 hover:opacity-50"
              }`}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};