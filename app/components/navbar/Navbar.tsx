"use client";

import { useRef, useEffect } from "react";
import { VscTarget, VscRefresh } from "react-icons/vsc";
import Logo from "./Logo";
import Selectors from "./Selectors";
import FontSize from "./FontSize";
import ModesMenu from "./ModesMenu";
import { Accents } from "./Accents";

export const Navbar = (props: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && props.isZenMode) {
        props.setIsZenMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props.isZenMode, props]);

  return (
    <nav 
      ref={containerRef}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 
        ${props.isZenMode ? "opacity-0 -translate-y-10 pointer-events-none" : "opacity-100 translate-y-0"}`}
    >
      <div className="flex h-16 items-center gap-2 px-5 bg-[#080808]/90 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        
        <Logo accent={props.accent} />
        <div className="h-8 w-px bg-white/10 mx-2" />

        <Selectors 
          langFilter={props.langFilter}
          languages={props.languages}
          setLangFilter={props.setLangFilter}
          selectedFont={props.selectedFont}
          setSelectedFont={props.setSelectedFont}
          editorTheme={props.editorTheme}
          setEditorTheme={props.setEditorTheme}
        />

        <FontSize 
          fontSize={props.fontSize} 
          setFontSize={props.setFontSize} 
          accent={props.accent}
        />

        <div className="h-8 w-px bg-white/10 mx-2" />
        <ModesMenu props={props} />

        <Accents 
          currentAccent={props.accent} 
          setAccent={props.setSelectedAccent} 
        />

        <div className="h-8 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-1">
          {/* BOTÓN MASTERY RESET: Reinicia el snippet y limpia errores */}
          <button 
            onClick={() => {
              if (window.confirm("¿Reiniciar progreso de la secuencia actual?")) {
                props.resetCurrentSnippet();
              }
            }} 
            className="group relative p-3 rounded-xl hover:bg-red-500/5 transition-all"
            title="Reset Sequence Progress"
          >
            <VscRefresh 
              size={20} 
              className="text-zinc-500 group-hover:text-red-400 group-hover:rotate-[-180deg] transition-all duration-500" 
            />
          </button>

          <button 
            onClick={() => props.setIsZenMode(true)} 
            className="group relative p-3 rounded-xl hover:bg-white/5 transition-all"
            title="Enter Zen Mode (Press ESC to exit)"
          >
            <VscTarget size={22} className="text-zinc-500 group-hover:text-white group-hover:rotate-90 group-hover:scale-110 transition-all duration-500" />
            <div className={`absolute inset-0 ${props.accent.bg} blur-xl opacity-0 group-hover:opacity-20 transition-opacity`} />
          </button>
        </div>
      </div>
    </nav>
  );
};