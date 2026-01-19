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
  // --- NUEVA PROP ---
  isBlindMode: boolean;
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
}: UseNeuralEditorProps) {
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [isCodeVisible, setIsCodeVisible] = useState(true);

  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- ESCAPE LOGIC ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) setIsZenMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode, setIsZenMode]);

  // --- VISIBILITY LOGIC (RECALL & BLIND) ---
  useEffect(() => {
    // Si Blind Mode está activo, el código fuente siempre es invisible
    if (isBlindMode) {
      setIsCodeVisible(false);
      gsap.to(".source-code-layer", { opacity: 0, duration: 0.2 });
      return;
    }

    // Lógica normal de Recall
    if (!isRecallMode || input.length === 0) {
      setIsCodeVisible(true);
      gsap.to(".source-code-layer", {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.4,
        ease: "power2.in"
      });
      return;
    }

    if (isRecallMode && input.length >= 1 && !autoWriting) {
      gsap.to(".source-code-layer", {
        opacity: 0,
        filter: "blur(15px)",
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => setIsCodeVisible(false)
      });
    }
  }, [isRecallMode, isBlindMode, input.length, autoWriting]);

  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: fontSize,
    lineHeight: "1.7",
    fontWeight: 700,
    tabSize: 4,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", 
  }), [selectedFont, fontSize]);

  const isFocusMode = useMemo(() => {
    return (input.length > 0 || autoWriting || isZenMode) && !finished;
  }, [input.length, autoWriting, isZenMode, finished]);

  const handleInput = useCallback(
    (val: string) => {
      if (finished || !snippet || val.length > snippet.code.length) return;
      if (!startTime && val.length > 0) setStartTime(Date.now());
      
      const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
      setIsError(currentIsError);

      // --- FEEDBACK DE ERROR (SHAKE) ---
      if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
        if (terminalRef.current) {
          // Si es Blind Mode, la sacudida es el doble de intensa y rápida
          const intensity = isBlindMode ? 8 : 4;
          gsap.fromTo(terminalRef.current, 
            { x: -intensity }, 
            { x: intensity, duration: 0.04, repeat: isBlindMode ? 5 : 3, yoyo: true, ease: "power1.inOut" }
          );
        }
      }

      setInput(val);
      if (val === snippet.code && !currentIsError) {
        setFinished(true);
        if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    },
    [finished, snippet, startTime, input.length, terminalRef, isBlindMode]
  );

  // --- BOT FLOW ---
  useEffect(() => {
    if (autoWriteInterval.current) {
      clearInterval(autoWriteInterval.current);
      autoWriteInterval.current = null;
    }

    if (autoWriting && !finished) {
      let currentIndex = input.length;

      autoWriteInterval.current = setInterval(() => {
        if (currentIndex < snippet.code.length) {
          currentIndex++;
          const nextChar = snippet.code.slice(0, currentIndex);
          handleInput(nextChar);
        } else {
          if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
        }
      }, botSpeed);
    }

    return () => {
      if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    };
  }, [autoWriting, finished, snippet.code, botSpeed, handleInput]);

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    setInput("");
    setFinished(false);
    setStartTime(null);
    setTimeElapsed(0);
    setWpm(0);
    setIsError(false);
    setIsCodeVisible(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [textareaRef]);

  // Timer & WPM logic...
  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  useEffect(() => {
    if (startTime && input.length > 5 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      const currentWpm = Math.round((input.length / 5) / minutes);
      setWpm(currentWpm > 0 ? currentWpm : 0);
    }
  }, [input.length, startTime, finished]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    input,
    isError,
    finished,
    timeElapsed,
    wpm,
    isFocusMode,
    isCodeVisible,
    MASTER_STYLE,
    handleInput,
    resetCurrentSnippet,
    formatTime,
    setStartTime,
  };
}