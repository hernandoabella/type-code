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
  setIsZenMode: (v: boolean) => void; 
  setIsRecallMode: (v: boolean) => void; // Nueva prop
  setIsBlindMode: (v: boolean) => void;  // Nueva prop
  
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
    isZenMode: boolean;
    isRecallMode: boolean; // Nueva prop
    isBlindMode: boolean;  // Nueva prop
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
  setIsZenMode,
  setIsRecallMode,
  setIsBlindMode,
  states
}: PersistenceProps) {
  
  // 1. CARGA INICIAL
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
    const savedZen = localStorage.getItem('zen_mode');
    const savedRecall = localStorage.getItem('recall_active');
    const savedBlind = localStorage.getItem('blind_mode');

    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedGhost !== null) setIsGhostActive(savedGhost === 'true');
    if (savedBot !== null) setAutoWriting(savedBot === 'true');
    if (savedAuto !== null) setAutoPilot(savedAuto === 'true');
    if (savedLang) setLangFilter(savedLang);
    if (savedSize) setFontSize(savedSize);
    if (savedZen !== null) setIsZenMode(savedZen === 'true');
    if (savedRecall !== null) setIsRecallMode(savedRecall === 'true');
    if (savedBlind !== null) setIsBlindMode(savedBlind === 'true');
    
    // Rehidratación de objetos
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

  // 2. GUARDADO AUTOMÁTICO
  useEffect(() => {
    if (!states.selectedAccent?.name || !states.selectedFont?.name || !states.editorTheme?.name) return;

    const storageMap = {
      'current_level': states.level.toString(),
      'ghost_active': states.isGhostActive.toString(),
      'bot_active': states.autoWriting.toString(),
      'auto_pilot': states.autoPilot.toString(),
      'lang_filter': states.langFilter,
      'selected_accent': states.selectedAccent.name,
      'selected_font': states.selectedFont.name,
      'editor_theme': states.editorTheme.name,
      'font_size': states.fontSize,
      'zen_mode': states.isZenMode.toString(),
      'recall_active': states.isRecallMode.toString(),
      'blind_mode': states.isBlindMode.toString()
    };

    Object.entries(storageMap).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
  }, [states]);
}