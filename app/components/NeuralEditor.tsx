"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import gsap from "gsap";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Rank {
  id: "S" | "A" | "B" | "C" | "D";
  label: string;
  color: string;
  bg: string;
  border: string;
}

export interface SessionStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  totalKeystrokes: number;
  errorCount: number;
  /** Characters per minute — more granular than WPM */
  cpm: number;
  /** Consistency: stddev of inter-keystroke intervals, lower = more consistent */
  consistency: number;
}

interface UseNeuralEditorProps {
  snippet: { code: string; lang: string } | null;
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
  /** Called when a snippet is successfully completed */
  onComplete?: (stats: SessionStats) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RANK_THRESHOLDS: Array<{ minAcc: number; rank: Rank }> = [
  {
    minAcc: 100,
    rank: {
      id: "S",
      label: "PERFECT",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/50",
    },
  },
  {
    minAcc: 95,
    rank: {
      id: "A",
      label: "ELITE",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/50",
    },
  },
  {
    minAcc: 85,
    rank: {
      id: "B",
      label: "SENIOR",
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/50",
    },
  },
  {
    minAcc: 70,
    rank: {
      id: "C",
      label: "JUNIOR",
      color: "text-zinc-400",
      bg: "bg-zinc-400/10",
      border: "border-zinc-400/50",
    },
  },
];

const getRank = (accuracy: number): Rank => {
  const match = RANK_THRESHOLDS.find((t) => accuracy >= t.minAcc);
  return (
    match?.rank ?? {
      id: "D",
      label: "RETRY",
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-400/50",
    }
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNeuralEditor({
  snippet,
  autoWriting,
  botSpeed: _botSpeed,
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
  onComplete,
}: UseNeuralEditorProps) {

  // ── Core state ──────────────────────────────────────────────────────────────
  const [input, setInput]               = useState("");
  const [isError, setIsError]           = useState(false);
  const [finished, setFinished]         = useState(false);
  const [startTime, setStartTime]       = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed]   = useState(0);
  const [wpm, setWpm]                   = useState(0);
  const [cpm, setCpm]                   = useState(0);
  const [accuracy, setAccuracy]         = useState(100);
  const [consistency, setConsistency]   = useState(100);

  // ── Refs (never trigger re-renders) ────────────────────────────────────────
  const totalKeystrokes   = useRef(0);
  const errorCount        = useRef(0);
  const timerRef          = useRef<NodeJS.Timeout | null>(null);
  const autoWriteRef      = useRef<NodeJS.Timeout | null>(null);
  /** Timestamps of every correct keystroke — used for consistency calc */
  const keystrokeTimestamps = useRef<number[]>([]);
  /** Last input length — avoids closure-stale deletion check */
  const prevLenRef = useRef(0);

  // ── Derived: rank ──────────────────────────────────────────────────────────
  const rank = useMemo<Rank | null>(
    () => (finished ? getRank(accuracy) : null),
    [finished, accuracy]
  );

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const formatTime = useCallback((ms: number): string => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
    const s = (totalSec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  /** Standard deviation of an array — used for consistency */
  const stdDev = (arr: number[]): number => {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  };

  // ── Visual helpers ──────────────────────────────────────────────────────────

  const shakeTerminal = useCallback(
    (intensity = 4, color = "rgba(239,68,68,0.8)") => {
      gsap.fromTo(
        terminalRef.current,
        { x: -intensity, borderColor: color },
        {
          x: intensity,
          borderColor: "rgba(255,255,255,0.06)",
          duration: 0.05,
          repeat: 3,
          yoyo: true,
          clearProps: "all",
        }
      );
    },
    [terminalRef]
  );

  const flashSuccess = useCallback(
    (rankId: string) => {
      const glowColors: Record<string, string> = {
        S: "rgba(250,204,21,0.35)",
        A: "rgba(96,165,250,0.3)",
        B: "rgba(74,222,128,0.25)",
        C: "rgba(161,161,170,0.2)",
        D: "rgba(239,68,68,0.2)",
      };
      const glow = glowColors[rankId] ?? glowColors.C;
      gsap.timeline()
        .to(terminalRef.current, {
          boxShadow: `0 0 80px -10px ${glow}`,
          scale: rankId === "S" ? 1.015 : 1.005,
          duration: 0.5,
          ease: "elastic.out(1,0.4)",
        })
        .to(terminalRef.current, {
          boxShadow: "none",
          scale: 1,
          duration: 0.8,
          ease: "power2.inOut",
        });
    },
    [terminalRef]
  );

  // ── Reset ────────────────────────────────────────────────────────────────────

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current)    clearInterval(timerRef.current);
    if (autoWriteRef.current) clearInterval(autoWriteRef.current);

    setInput("");
    setFinished(false);
    setStartTime(null);
    setTimeElapsed(0);
    setWpm(0);
    setCpm(0);
    setAccuracy(100);
    setConsistency(100);
    setIsError(false);

    totalKeystrokes.current       = 0;
    errorCount.current            = 0;
    prevLenRef.current            = 0;
    keystrokeTimestamps.current   = [];

    gsap.to(terminalRef.current, {
      x: 0,
      scale: 1,
      borderColor: "rgba(255,255,255,0.06)",
      boxShadow: "none",
      duration: 0.3,
      clearProps: "filter",
    });

    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [terminalRef, textareaRef]);

  // ── Core input handler ────────────────────────────────────────────────────────

  const handleInput = useCallback(
    (val: string) => {
      if (finished || !snippet || val.length > snippet.code.length) return;

      // Guard: cap at code length
      const safeVal = val.slice(0, snippet.code.length);

      // Start timer on first keystroke
      if (!startTime && safeVal.length > 0) setStartTime(Date.now());

      const isAddition = safeVal.length > prevLenRef.current;
      prevLenRef.current = safeVal.length;

      // ── Keystroke analysis (additions only) ───────────────────────────────
      if (isAddition) {
        const now = Date.now();
        const lastIdx = safeVal.length - 1;
        const isCharWrong = safeVal[lastIdx] !== snippet.code[lastIdx];

        totalKeystrokes.current += 1;

        // Track timing for consistency
        keystrokeTimestamps.current.push(now);

        if (isCharWrong) {
          errorCount.current += 1;
          shakeTerminal(isBlindMode ? 10 : 4);

          // HARDCORE MODE: instant reset on any error
          if (isHardcoreMode) {
            gsap.to(terminalRef.current, {
              backgroundColor: "rgba(239,68,68,0.12)",
              duration: 0.08,
              onComplete: resetCurrentSnippet,
            });
            return;
          }
        }

        // Accuracy: permanent — not recoverable by deletion
        const acc = Math.round(
          ((totalKeystrokes.current - errorCount.current) / totalKeystrokes.current) * 100
        );
        setAccuracy(Math.max(0, acc));

        // Consistency: based on inter-keystroke interval stddev
        if (keystrokeTimestamps.current.length > 3) {
          const intervals = keystrokeTimestamps.current
            .slice(1)
            .map((t, i) => t - keystrokeTimestamps.current[i]);
          const sd = stdDev(intervals);
          // Lower stddev = more consistent. Map to 0–100 score.
          const consistencyScore = Math.max(0, Math.round(100 - sd / 8));
          setConsistency(consistencyScore);
        }
      }

      // ── Error state (based on ALL chars so far) ───────────────────────────
      const hasAnyError = safeVal.split("").some((c, i) => c !== snippet.code[i]);
      setIsError(hasAnyError);
      setInput(safeVal);

      // ── Victory check ─────────────────────────────────────────────────────
      if (safeVal === snippet.code && !hasAnyError) {
        setFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const finalRank = getRank(
          Math.max(0, Math.round(
            ((totalKeystrokes.current - errorCount.current) / Math.max(1, totalKeystrokes.current)) * 100
          ))
        );

        flashSuccess(finalRank.id);

        // Precision mode S-rank: extra celebration
        if (isPrecisionMode && finalRank.id === "S") {
          gsap.to(terminalRef.current, {
            boxShadow: "0 0 120px rgba(250,204,21,0.4)",
            borderColor: "#facc15",
            duration: 0.6,
            ease: "elastic.out(1,0.3)",
            yoyo: true,
            repeat: 1,
          });
        }

        // Fire completion callback with full stats
        onComplete?.({
          wpm,
          accuracy: Math.max(0, Math.round(
            ((totalKeystrokes.current - errorCount.current) / Math.max(1, totalKeystrokes.current)) * 100
          )),
          timeElapsed: startTime ? Date.now() - startTime : 0,
          totalKeystrokes: totalKeystrokes.current,
          errorCount: errorCount.current,
          cpm,
          consistency,
        });
      }
    },
    [
      finished, snippet, startTime, isBlindMode, isHardcoreMode,
      isPrecisionMode, wpm, cpm, consistency, terminalRef,
      shakeTerminal, flashSuccess, resetCurrentSnippet, onComplete,
    ]
  );

  // ── Key handler ───────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (autoWriting || finished) return;

      // Escape → exit zen mode
      if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false);
        return;
      }

      // Tab → 4 spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const { selectionStart, selectionEnd } = e.currentTarget;
        const spaces = "    ";
        const next =
          input.substring(0, selectionStart) + spaces + input.substring(selectionEnd);
        handleInput(next);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
              textareaRef.current.selectionEnd = selectionStart + spaces.length;
          }
        }, 0);
        return;
      }

      // Hardcore: block backspace entirely
      if (isHardcoreMode && e.key === "Backspace") {
        e.preventDefault();
        gsap.to(terminalRef.current, {
          x: -3,
          duration: 0.04,
          repeat: 2,
          yoyo: true,
          clearProps: "x",
        });
        return;
      }
    },
    [
      input, autoWriting, finished, isZenMode, isHardcoreMode,
      setIsZenMode, handleInput, textareaRef, terminalRef,
    ]
  );

  // ── Timer ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(
        () => setTimeElapsed(Date.now() - startTime),
        100
      );
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, finished]);

  // ── WPM + CPM ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!startTime || input.length < 5 || finished) return;
    const minutes = (Date.now() - startTime) / 60000;
    const rawWpm  = Math.round(input.length / 5 / minutes);
    const rawCpm  = Math.round(input.length / minutes);
    setWpm(rawWpm  > 0 ? rawWpm  : 0);
    setCpm(rawCpm  > 0 ? rawCpm  : 0);
  }, [input.length, startTime, finished]);

  // ── Code visibility logic ─────────────────────────────────────────────────────

  const isCodeVisible = useMemo(() => {
    if (isBlindMode) return false;
    if (isRecallMode && input.length > 0) return false;
    return true;
  }, [isBlindMode, isRecallMode, input.length]);

  // ── Master style (memoized) ───────────────────────────────────────────────────

  const MASTER_STYLE = useMemo(
    () => ({
      fontFamily: selectedFont.family,
      fontSize,
      lineHeight: "1.7",
      fontWeight: 700,
      tabSize: 4,
    }),
    [selectedFont.family, fontSize]
  );

  // ── Progress ──────────────────────────────────────────────────────────────────

  const progress = useMemo(
    () => (snippet ? Math.min(100, (input.length / snippet.code.length) * 100) : 0),
    [input.length, snippet]
  );

  // ── isFocusMode ───────────────────────────────────────────────────────────────

  const isFocusMode = useMemo(
    () => (input.length > 0 || autoWriting || isZenMode) && !finished,
    [input.length, autoWriting, isZenMode, finished]
  );

  // ─── Return ───────────────────────────────────────────────────────────────────

  return {
    // State
    input,
    isError,
    finished,
    timeElapsed,
    wpm,
    cpm,
    accuracy,
    consistency,
    rank,
    progress,
    isFocusMode,
    isCodeVisible,
    MASTER_STYLE,
    // Actions
    handleInput,
    handleKeyDown,
    resetCurrentSnippet,
    formatTime,
    setStartTime,
  };
}