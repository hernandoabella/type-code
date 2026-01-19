"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import gsap from "gsap";

interface UseNeuralEditorProps {
  snippet: { id: string; code: string; lang: string };
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
  // --- NUEVA PROP ---
  isHardcoreMode: boolean;
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
}: UseNeuralEditorProps) {
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCodeVisible, setIsCodeVisible] = useState(true);

  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalKeystrokes = useRef(0);
  const errorCount = useRef(0);

  // --- AUTO-FOCUS ---
  useEffect(() => {
    const focusTimeout = setTimeout(() => textareaRef.current?.focus(), 500);
    return () => clearTimeout(focusTimeout);
  }, [snippet.id, textareaRef]);

  // --- MANEJO DE TECLAS (TAB + BACKSPACE + ESCAPE) ---
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autoWriting || finished) return;

    // 1. ESCAPE (Zen Mode)
    if (e.key === "Escape" && isZenMode) setIsZenMode(false);

    // 2. ALT + R (Reset)
    if (e.altKey && e.key === "r") resetCurrentSnippet();

    // 3. TAB (Insertar espacios)
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const tabSpaces = "    ";
      const newValue = input.substring(0, selectionStart) + tabSpaces + input.substring(selectionEnd);
      handleInput(newValue);
      
      // Reposicionar cursor tras el render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + tabSpaces.length;
        }
      }, 0);
    }

    // 4. HARDCORE MODE: Bloquear Backspace
    if (isHardcoreMode && e.key === "Backspace") {
      e.preventDefault();
      gsap.to(terminalRef.current, { x: -2, duration: 0.05, repeat: 1, yoyo: true });
    }
  }, [input, autoWriting, finished, isZenMode, isHardcoreMode, setIsZenMode]);

  // --- LÓGICA DE VISIBILIDAD GSAP ---
  useEffect(() => {
    const layer = ".source-code-layer";
    if (isBlindMode) {
      setIsCodeVisible(false);
      gsap.to(layer, { opacity: 0, filter: "blur(20px)", duration: 0.5 });
      return;
    }
    if (isRecallMode && input.length >= 1 && !autoWriting) {
      gsap.to(layer, { opacity: 0, filter: "blur(12px)", y: -10, duration: 0.8, onComplete: () => setIsCodeVisible(false) });
    } else {
      setIsCodeVisible(true);
      gsap.to(layer, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.4 });
    }
  }, [isRecallMode, isBlindMode, input.length, autoWriting]);

  // --- HANDLER DE ENTRADA PRINCIPAL ---
  const handleInput = useCallback(
    (val: string) => {
      if (finished || !snippet || val.length > snippet.code.length) return;
      if (!startTime && val.length > 0) setStartTime(Date.now());
      
      // Lógica de validación
      if (val.length > input.length) {
        totalKeystrokes.current += 1;
        const lastCharIdx = val.length - 1;
        const isCharError = val[lastCharIdx] !== snippet.code[lastCharIdx];

        if (isCharError) {
          errorCount.current += 1;
          
          // --- EFECTO HARDCORE: RESET AL FALLAR ---
          if (isHardcoreMode) {
            gsap.to(terminalRef.current, { 
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              x: 15,
              duration: 0.08,
              repeat: 3,
              yoyo: true,
              onComplete: resetCurrentSnippet 
            });
            return; // Bloqueamos el setInput
          }

          // Feedback visual normal
          if (terminalRef.current) {
            const intensity = isBlindMode ? 10 : 4;
            gsap.fromTo(terminalRef.current, { x: -intensity }, { x: intensity, duration: 0.05, repeat: 3, yoyo: true });
          }
        }
        
        // Calcular precisión real
        setAccuracy(Math.max(0, Math.round(((totalKeystrokes.current - errorCount.current) / totalKeystrokes.current) * 100)));
      }

      const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
      setIsError(currentIsError);
      setInput(val);
      
      if (val === snippet.code && !currentIsError) {
        setFinished(true);
        if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
        if (timerRef.current) clearInterval(timerRef.current);
        gsap.to(terminalRef.current, { scale: 1.02, borderColor: "rgba(34, 197, 94, 0.5)", duration: 0.4 });
      }
    },
    [finished, snippet, startTime, input, isHardcoreMode, isBlindMode, terminalRef]
  );

  // --- BOT ENGINE ---
  useEffect(() => {
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    if (autoWriting && !finished && snippet) {
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
    gsap.fromTo(terminalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [textareaRef, terminalRef]);

  // Timer & WPM
  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  useEffect(() => {
    if (startTime && input.length > 2 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round((input.length / 5) / minutes) || 0);
    }
  }, [input.length, startTime, finished]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize,
    lineHeight: "1.7",
    fontWeight: 700,
    tabSize: 4,
    transition: "font-size 0.3s ease", 
  }), [selectedFont, fontSize]);

  return {
    input, isError, finished, timeElapsed, wpm, accuracy,
    isFocusMode: (input.length > 0 || autoWriting || isZenMode) && !finished,
    isCodeVisible, MASTER_STYLE, handleInput, handleKeyDown, // Exportamos handleKeyDown
    resetCurrentSnippet, formatTime, setStartTime,
  };
}