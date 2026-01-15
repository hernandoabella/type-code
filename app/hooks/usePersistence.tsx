"use client";

import { useEffect } from "react";
import { ACCENTS, FONTS, HIGHLIGHT_THEMES } from "@/app/config/constants";

interface PersistenceProps {
  setLevel: (v: number) => void;
  setIsGhostActive: (v: boolean) => void;
  setAutoWriting: (v: boolean) => void;
  setAutoPilot: (v: boolean) => void;
  setLangFilter: (v: string) => void;
  setSelectedAccent: (v: any) => void;
  setSelectedFont: (v: any) => void;
  setEditorTheme: (v: any) => void;
  setFontSize: (v: string) => void;
  // Estados actuales para el guardado
  states: {
    level: number;
    isGhostActive: boolean;
    autoWriting: boolean;
    autoPilot: boolean;
    langFilter: string;
    selectedAccent: any;
    selectedFont: any;
    editorTheme: any;
    fontSize: string;
  };
}

export function usePersistence({
  setLevel,
  setIsGhostActive,
  setAutoWriting,
  setAutoPilot,
  setLangFilter,
  setSelectedAccent,
  setSelectedFont,
  setEditorTheme,
  setFontSize,
  states
}: PersistenceProps) {
  
  // 1. EFECTO DE CARGA (Al montar el componente)
  useEffect(() => {
    const savedLevel = localStorage.getItem('current_level');
    const savedGhost = localStorage.getItem('ghost_active');
    const savedBot = localStorage.getItem('bot_active');
    const savedAuto = localStorage.getItem('auto_pilot');
    const savedLang = localStorage.getItem('lang_filter');
    const savedAccent = localStorage.getItem('selected_accent');
    const savedFont = localStorage.getItem('selected_font');
    const savedTheme = localStorage.getItem('editor_theme');
    const savedSize = localStorage.getItem('font_size');

    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedGhost !== null) setIsGhostActive(savedGhost === 'true');
    if (savedBot !== null) setAutoWriting(savedBot === 'true');
    if (savedAuto !== null) setAutoPilot(savedAuto === 'true');
    if (savedLang) setLangFilter(savedLang);
    if (savedSize) setFontSize(savedSize);
    
    if (savedAccent) {
      const found = ACCENTS.find(a => a.name === savedAccent);
      if (found) setSelectedAccent(found);
    }
    if (savedFont) {
      const found = FONTS.find(f => f.name === savedFont);
      if (found) setSelectedFont(found);
    }
    if (savedTheme) {
      const found = HIGHLIGHT_THEMES.find(t => t.name === savedTheme);
      if (found) setEditorTheme(found);
    }
  }, []);

  // 2. EFECTO DE GUARDADO (Cada vez que algo cambia)
  useEffect(() => {
    localStorage.setItem('current_level', states.level.toString());
    localStorage.setItem('ghost_active', states.isGhostActive.toString());
    localStorage.setItem('bot_active', states.autoWriting.toString());
    localStorage.setItem('auto_pilot', states.autoPilot.toString());
    localStorage.setItem('lang_filter', states.langFilter);
    localStorage.setItem('selected_accent', states.selectedAccent.name);
    localStorage.setItem('selected_font', states.selectedFont.name);
    localStorage.setItem('editor_theme', states.editorTheme.name);
    localStorage.setItem('font_size', states.fontSize);
  }, [states]);
}