"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import gsap from "gsap";

interface UseNeuralEditorProps {
  snippet: { code: string; lang: string };
  autoWriting: boolean;
  botSpeed: number;
  fontSize: string;
  selectedFont: { family: string };
  terminalRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  isZenMode: boolean; 
  setIsZenMode: (val: boolean) => void;
  isRecallMode: boolean;
  isBlindMode: boolean;
  isHardcoreMode: boolean;
  isPrecisionMode: boolean;
}

export function useNeuralEditor({
  snippet,
  autoWriting,
  botSpeed,
  fontSize,
  selectedFont,
  terminalRef,
  textareaRef,
  isZenMode,
  setIsZenMode,
  isRecallMode,
  isBlindMode,
  isHardcoreMode,
  isPrecisionMode,
}: UseNeuralEditorProps) {
  // --- ESTADOS PRINCIPALES ---
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // --- REFERENCIAS DE CONTROL ---
  const totalKeystrokes = useRef(0);
  const errorCount = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);

  // --- LÓGICA DE RANGOS (PRECISION MODE) ---
  const rank = useMemo(() => {
    if (!finished) return null;
    if (accuracy === 100) return { id: "S", label: "PERFECT", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/50" };
    if (accuracy >= 95) return { id: "A", label: "ELITE", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/50" };
    if (accuracy >= 85) return { id: "B", label: "SENIOR", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/50" };
    return { id: "C", label: "JUNIOR", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/50" };
  }, [finished, accuracy]);

  // --- HELPERS ---
  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    
    setInput("");
    setFinished(false);
    setStartTime(null);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setIsError(false);
    totalKeystrokes.current = 0;
    errorCount.current = 0;
    
    // Reset visual de la terminal
    gsap.to(terminalRef.current, { 
      x: 0, 
      scale: 1, 
      borderColor: "rgba(255, 255, 255, 0.1)", 
      boxShadow: "none", 
      duration: 0.3,
      backgroundColor: "transparent"
    });

    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [textareaRef, terminalRef]);

  // --- CORE INPUT HANDLER ---
  const handleInput = useCallback((val: string) => {
    if (finished || !snippet || val.length > snippet.code.length) return;
    
    // Iniciar timer en la primera pulsación
    if (!startTime && val.length > 0) setStartTime(Date.now());

    // PROCESAMIENTO DE PULSACIONES (Para Accuracy)
    if (val.length > input.length) {
      totalKeystrokes.current += 1;
      const lastIdx = val.length - 1;
      const isCharWrong = val[lastIdx] !== snippet.code[lastIdx];

      if (isCharWrong) {
        errorCount.current += 1;
        
        // Efecto visual de error (Shake + Color)
        const intensity = isBlindMode ? 12 : 4;
        gsap.fromTo(terminalRef.current, 
          { x: -intensity, borderColor: "rgba(239, 68, 68, 0.8)" }, 
          { x: intensity, borderColor: "rgba(255, 255, 255, 0.1)", duration: 0.05, repeat: isBlindMode ? 5 : 3, yoyo: true }
        );

        // HARDCORE MODE: Reset instantáneo al fallar
        if (isHardcoreMode) {
          gsap.to(terminalRef.current, { backgroundColor: "rgba(239, 68, 68, 0.15)", duration: 0.1 });
          resetCurrentSnippet();
          return;
        }
      }
      
      // Cálculo de precisión real (No se recupera borrando)
      const currentAcc = Math.round(((totalKeystrokes.current - errorCount.current) / totalKeystrokes.current) * 100);
      setAccuracy(currentAcc > 0 ? currentAcc : 0);
    }

    const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
    setIsError(currentIsError);
    setInput(val);

    // LÓGICA DE FINALIZACIÓN
    if (val === snippet.code && !currentIsError) {
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Bonus visual por carrera perfecta
      if (isPrecisionMode && accuracy === 100) {
        gsap.to(terminalRef.current, { 
          boxShadow: "0 0 50px rgba(250, 204, 21, 0.3)", 
          borderColor: "#facb15", 
          scale: 1.02,
          duration: 0.8,
          ease: "elastic.out(1, 0.3)" 
        });
      }
    }
  }, [finished, snippet, startTime, input, isHardcoreMode, isBlindMode, isPrecisionMode, accuracy, terminalRef, resetCurrentSnippet]);

  // --- MANEJO DE TECLAS ESPECIALES ---
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autoWriting || finished) return;

    // 1. Salir de Zen Mode
    if (e.key === "Escape" && isZenMode) setIsZenMode(false);

    // 2. Soporte para TAB (4 espacios)
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const spaces = "    ";
      const newValue = input.substring(0, selectionStart) + spaces + input.substring(selectionEnd);
      
      handleInput(newValue);

      // Reposicionar cursor
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + spaces.length;
        }
      }, 0);
    }

    // 3. HARDCORE MODE: Bloquear Backspace
    if (isHardcoreMode && e.key === "Backspace") {
      e.preventDefault();
      gsap.to(terminalRef.current, { x: -2, duration: 0.05, repeat: 1, yoyo: true });
    }
  }, [input, autoWriting, finished, isZenMode, isHardcoreMode, setIsZenMode, handleInput]);

  // --- EFECTOS DE TIEMPO Y WPM ---
  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  useEffect(() => {
    if (startTime && input.length > 5 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      const currentWpm = Math.round((input.length / 5) / minutes);
      setWpm(currentWpm > 0 ? currentWpm : 0);
    }
  }, [input.length, startTime, finished]);

  // --- VISIBILIDAD DE CAPAS (RECALL & BLIND) ---
  const isCodeVisible = useMemo(() => {
    if (isBlindMode) return false;
    if (isRecallMode && input.length > 0) return false;
    return true;
  }, [isBlindMode, isRecallMode, input.length]);

  // --- ESTILOS MAESTROS ---
  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: fontSize,
    lineHeight: "1.7",
    fontWeight: 700,
    tabSize: 4,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", 
  }), [selectedFont, fontSize]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return {
    input,
    isError,
    finished,
    timeElapsed,
    wpm,
    accuracy,
    rank,
    isFocusMode: (input.length > 0 || autoWriting || isZenMode) && !finished,
    isCodeVisible,
    MASTER_STYLE,
    handleInput,
    handleKeyDown,
    resetCurrentSnippet,
    formatTime,
    setStartTime,
  };
}