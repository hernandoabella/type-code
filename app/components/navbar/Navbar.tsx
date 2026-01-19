"use client";

import { useRef, useEffect } from "react";
import { VscTarget } from "react-icons/vsc";

// Importación de tus mini-componentes
import Logo from "./Logo";
import Selectors from "./Selectors";
import ModesMenu from "./ModesMenu";
import { Accents } from "./Accents";

export const Navbar = (props: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Lógica global para salir de Zen Mode con ESC
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
      <div className="flex h-16 items-center gap-3 px-5 bg-[#080808]/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] shadow-2xl">
        
        {/* 1. Logo con color dinámico */}
        <Logo accent={props.accent.bg} />

        <div className="h-8 w-px bg-white/10 mx-2" />

        {/* 2. Selectores de Fuente, Lenguaje y Tema */}
        <Selectors 
          langFilter={props.langFilter}
          languages={props.languages}
          setLangFilter={props.setLangFilter}
          selectedFont={props.selectedFont}
          setSelectedFont={props.setSelectedFont}
          editorTheme={props.editorTheme}
          setEditorTheme={props.setEditorTheme}
        />

        <div className="h-8 w-px bg-white/10 mx-2" />

        {/* 3. Mega Menú de Modos (Gameplay, Learning, Visuals) */}
        <ModesMenu props={props} />

        {/* 4. Selector de Acentos */}
        <Accents 
          currentAccent={props.accent} 
          setAccent={props.setSelectedAccent} 
        />

        <div className="h-8 w-px bg-white/10 mx-1" />

        {/* 5. Zen Mode Button */}
        <button 
          onClick={() => props.setIsZenMode(true)} 
          className="p-4 text-zinc-500 hover:text-white transition-all group relative"
          title="Press ESC to exit"
        >
          <VscTarget size={22} className="group-hover:scale-110 group-hover:rotate-90 transition-transform duration-500" />
          <div className={`absolute inset-0 ${props.accent.bg} blur-lg opacity-0 group-hover:opacity-20 transition-opacity`} />
        </button>

      </div>
    </nav>
  );
};