"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import gsap from "gsap";

interface UseNeuralEditorProps {
  snippet: {
    code: string;
    lang: string;
  };
  autoWriting: boolean;
  setAutoWriting: (val: boolean) => void;
  botSpeed: number;
  fontSize: string; // Cambiado a string para soportar "19px"
  selectedFont: { family: string }; // Necesario para el estilo maestro
  terminalRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function useNeuralEditor({
  snippet,
  autoWriting,
  setAutoWriting,
  botSpeed,
  fontSize,
  selectedFont,
  terminalRef,
  textareaRef,
}: UseNeuralEditorProps) {
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);

  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- NUEVO: Estilo Maestro derivado del fontSize ---
  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: fontSize,
    lineHeight: "1.7",
    fontWeight: 700,
    tabSize: 4,
    transition: "font-size 0.2s ease", // Suaviza el cambio de tamaño
  }), [selectedFont, fontSize]);

  const handleInput = useCallback(
    (val: string) => {
      if (finished || !snippet || val.length > snippet.code.length) return;

      if (!startTime && val.length > 0) setStartTime(Date.now());

      const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
      setIsError(currentIsError);

      if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
        if (terminalRef.current) {
          gsap.fromTo(terminalRef.current, { x: -3 }, { x: 3, duration: 0.04, repeat: 3, yoyo: true });
        }
      }

      setInput(val);

      if (val === snippet.code && !currentIsError) {
        setFinished(true);
        if (autoWriteInterval.current) {
          clearInterval(autoWriteInterval.current);
          autoWriteInterval.current = null;
        }
        if (timerRef.current) clearInterval(timerRef.current);
      }
    },
    [finished, snippet, startTime, input.length, terminalRef]
  );

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) {
      clearInterval(autoWriteInterval.current);
      autoWriteInterval.current = null;
    }
    
    setInput("");
    setFinished(false);
    setStartTime(null);
    setTimeElapsed(0);
    setWpm(0);
    setIsError(false);

    if (terminalRef.current) {
      gsap.fromTo(
        terminalRef.current,
        { scale: 0.98, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "expo.out" }
      );
    }

    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [terminalRef, textareaRef]);

  // Lógica del Bot (Auto-Writing)
  useEffect(() => {
    if (!autoWriting || finished) {
      if (autoWriteInterval.current) {
        clearInterval(autoWriteInterval.current);
        autoWriteInterval.current = null;
      }
      return;
    }

    const startDelay = setTimeout(() => {
      if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
      let currentIndex = input.length;
      
      autoWriteInterval.current = setInterval(() => {
        if (currentIndex < snippet.code.length) {
          currentIndex++;
          handleInput(snippet.code.slice(0, currentIndex));
        } else {
          if (autoWriteInterval.current) {
            clearInterval(autoWriteInterval.current);
            autoWriteInterval.current = null;
          }
        }
      }, botSpeed);
    }, 1);

    return () => {
      clearTimeout(startDelay);
      if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    };
  }, [autoWriting, finished, snippet.code, handleInput, botSpeed]);

  // Cronómetro y WPM
  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  useEffect(() => {
    if (startTime && input.length > 0 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round(input.length / 5 / minutes) || 0);
    }
  }, [input, startTime, finished]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const dec = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${dec}`;
  };

  return {
    input,
    isError,
    finished,
    timeElapsed,
    wpm,
    MASTER_STYLE, // <--- Retornamos el objeto de estilo completo
    handleInput,
    resetCurrentSnippet,
    formatTime,
    setStartTime,
  };
}