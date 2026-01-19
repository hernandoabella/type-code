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
  // --- NUEVA PROP ---
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
  // --- ESTADOS ---
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCodeVisible, setIsCodeVisible] = useState(true);

  // --- REFERENCIAS PARA MÉTRICAS ---
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalKeystrokes = useRef(0);
  const errorCount = useRef(0);

  // --- LÓGICA DE RANGOS (REPORT CARD) ---
  const rank = useMemo(() => {
    if (!finished) return null;
    if (accuracy === 100) return { id: "S", label: "GOLD", color: "text-yellow-400", bg: "bg-yellow-400/10" };
    if (accuracy >= 95) return { id: "A", label: "SILVER", color: "text-zinc-300", bg: "bg-zinc-300/10" };
    if (accuracy >= 85) return { id: "B", label: "BRONZE", color: "text-orange-400", bg: "bg-orange-400/10" };
    return { id: "C", label: "NOVICE", color: "text-zinc-500", bg: "bg-zinc-500/10" };
  }, [finished, accuracy]);

  // --- MANEJO DE TECLAS ---
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autoWriting || finished) return;

    if (e.key === "Escape" && isZenMode) setIsZenMode(false);

    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const tabSpaces = "    ";
      const newValue = input.substring(0, selectionStart) + tabSpaces + input.substring(selectionEnd);
      handleInput(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + tabSpaces.length;
        }
      }, 0);
    }

    if (isHardcoreMode && e.key === "Backspace") {
      e.preventDefault();
      gsap.to(terminalRef.current, { x: -2, duration: 0.05, repeat: 1, yoyo: true });
    }
  }, [input, autoWriting, finished, isZenMode, isHardcoreMode, setIsZenMode]);

  // --- VISIBILIDAD (RECALL & BLIND) ---
  useEffect(() => {
    const layer = ".source-code-layer";
    if (isBlindMode) {
      setIsCodeVisible(false);
      gsap.to(layer, { opacity: 0, filter: "blur(20px)", duration: 0.5 });
      return;
    }

    if (!isRecallMode || input.length === 0) {
      setIsCodeVisible(true);
      gsap.to(layer, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.4, ease: "power2.in" });
      return;
    }

    if (isRecallMode && input.length >= 1 && !autoWriting) {
      gsap.to(layer, {
        opacity: 0,
        filter: "blur(15px)",
        y: -10,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => setIsCodeVisible(false)
      });
    }
  }, [isRecallMode, isBlindMode, input.length, autoWriting]);

  // --- HANDLER DE ENTRADA PRINCIPAL ---
  const handleInput = useCallback(
    (val: string) => {
      if (finished || !snippet || val.length > snippet.code.length) return;
      if (!startTime && val.length > 0) setStartTime(Date.now());
      
      if (val.length > input.length) {
        totalKeystrokes.current += 1;
        const lastIdx = val.length - 1;
        const isCharError = val[lastIdx] !== snippet.code[lastIdx];

        if (isCharError) {
          errorCount.current += 1;
          
          if (isHardcoreMode) {
            if (terminalRef.current) {
              gsap.to(terminalRef.current, { 
                backgroundColor: "rgba(239, 68, 68, 0.25)",
                x: 15,
                duration: 0.08,
                repeat: 3,
                yoyo: true,
                onComplete: resetCurrentSnippet 
              });
            }
            return;
          }

          if (terminalRef.current) {
            const intensity = isBlindMode ? 10 : 4;
            gsap.fromTo(terminalRef.current, 
              { x: -intensity }, 
              { x: intensity, duration: 0.04, repeat: isBlindMode ? 5 : 3, yoyo: true }
            );
          }
        }
        
        setAccuracy(Math.max(0, Math.round(((totalKeystrokes.current - errorCount.current) / totalKeystrokes.current) * 100)));
      }

      const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
      setIsError(currentIsError);
      setInput(val);

      if (val === snippet.code && !currentIsError) {
        setFinished(true);
        if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
        if (timerRef.current) clearInterval(timerRef.current);
        
        // PERFECT RUN BONUS EFFECT
        if (isPrecisionMode && accuracy === 100) {
          gsap.to(terminalRef.current, { 
            scale: 1.05, 
            borderColor: "#fbbf24", 
            boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)",
            duration: 0.6,
            ease: "elastic.out(1, 0.3)"
          });
        } else {
          gsap.to(terminalRef.current, { scale: 1.02, borderColor: "rgba(34, 197, 94, 0.5)", duration: 0.4 });
        }
      }
    },
    [finished, snippet, startTime, input, isHardcoreMode, isBlindMode, terminalRef, isPrecisionMode, accuracy]
  );

  // --- BOT ENGINE ---
  useEffect(() => {
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);

    if (autoWriting && !finished) {
      let currentIndex = input.length;
      autoWriteInterval.current = setInterval(() => {
        if (currentIndex < snippet.code.length) {
          currentIndex++;
          handleInput(snippet.code.slice(0, currentIndex));
        } else {
          clearInterval(autoWriteInterval.current!);
        }
      }, botSpeed);
    }
    return () => { if (autoWriteInterval.current) clearInterval(autoWriteInterval.current); };
  }, [autoWriting, finished, snippet.code, botSpeed, handleInput, input.length]);

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    setInput("");
    setFinished(false);
    setStartTime(null);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    errorCount.current = 0;
    totalKeystrokes.current = 0;
    setIsError(false);
    setIsCodeVisible(true);
    
    gsap.fromTo(terminalRef.current, { opacity: 0, y: 10, boxShadow: "none" }, { opacity: 1, y: 0, duration: 0.4, backgroundColor: "transparent", borderColor: "rgba(255, 255, 255, 0.1)" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [textareaRef, terminalRef]);

  // Timers
  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  useEffect(() => {
    if (startTime && input.length > 5 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round((input.length / 5) / minutes) || 0);
    }
  }, [input.length, startTime, finished]);

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
    input, isError, finished, timeElapsed, wpm, accuracy, rank,
    isFocusMode: (input.length > 0 || autoWriting || isZenMode) && !finished,
    isCodeVisible, MASTER_STYLE, handleInput, handleKeyDown,
    resetCurrentSnippet, formatTime, setStartTime,
  };
}