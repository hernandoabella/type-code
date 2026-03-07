"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import gsap from "gsap";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type RankId = "S" | "A" | "B" | "C" | "D";

export interface Rank {
  id:     RankId;
  label:  string;
  color:  string;   // hex
  glow:   string;   // rgba
}

export interface SessionStats {
  wpm:             number;
  cpm:             number;
  accuracy:        number;
  consistency:     number;  // 0–100, higher = more consistent keystroke rhythm
  timeElapsed:     number;  // ms
  totalKeystrokes: number;
  errorCount:      number;
  combo:           number;  // max combo reached
  rank:            Rank;
}

export interface UseNeuralEditorOptions {
  snippet:        { code: string; lang: string } | null;

  // Modes
  autoWriting:    boolean;
  isZenMode:      boolean;
  setIsZenMode:   (v: boolean) => void;
  isRecallMode:   boolean;
  isBlindMode:    boolean;
  isHardcoreMode: boolean;  // backspace blocked, reset on error
  isPrecisionMode:boolean;  // S-rank triggers extra celebration

  // Appearance
  fontSize:       string;
  selectedFont:   { family: string };

  // Refs
  terminalRef:    React.RefObject<HTMLDivElement | null>;
  textareaRef:    React.RefObject<HTMLTextAreaElement | null>;

  // Game
  soundEnabled?:  boolean;
  onComplete?:    (stats: SessionStats) => void;
  onXP?:          (amount: number) => void;
  onCombo?:       (combo: number) => void;
  onError?:       () => void;
}

export interface UseNeuralEditorReturn {
  // Typing state
  input:           string;
  isError:         boolean;
  finished:        boolean;
  startTime:       number | null;
  timeElapsed:     number;
  // Metrics
  wpm:             number;
  cpm:             number;
  accuracy:        number;
  consistency:     number;
  combo:           number;
  maxCombo:        number;
  rank:            Rank | null;
  progress:        number;
  // UI
  isFocusMode:     boolean;
  isCodeVisible:   boolean;
  MASTER_STYLE:    React.CSSProperties;
  // Actions
  handleInput:     (val: string) => void;
  handleKeyDown:   (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  resetSnippet:    () => void;
  formatTime:      (ms: number) => string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const RANKS: Array<{ min: number } & Rank> = [
  { min: 100, id: "S", label: "PERFECT", color: "#facc15", glow: "rgba(250,204,21,0.55)"  },
  { min:  95, id: "A", label: "ELITE",   color: "#60a5fa", glow: "rgba(96,165,250,0.5)"   },
  { min:  85, id: "B", label: "SENIOR",  color: "#4ade80", glow: "rgba(74,222,128,0.45)"  },
  { min:  70, id: "C", label: "MID",     color: "#a78bfa", glow: "rgba(167,139,250,0.45)" },
  { min:   0, id: "D", label: "NOOB",    color: "#f87171", glow: "rgba(248,113,113,0.45)" },
];

const getRank = (acc: number): Rank =>
  RANKS.find(r => acc >= r.min) ?? RANKS[RANKS.length - 1];

const XP_PER_CHAR   = 2;
const COMBO_DECAY   = 3000; // ms of inactivity before combo resets
const HP_PER_ERROR  = 8;

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO ENGINE  (Web Audio API, no deps)
// ═══════════════════════════════════════════════════════════════════════════════

function makeAudio() {
  if (typeof window === "undefined") return null;
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const beep = (
      freq: number, dur: number, vol = 0.05,
      type: OscillatorType = "sine", delay = 0,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    };

    return {
      key:     (combo: number) =>
        beep(700 + combo * 14, 0.03, 0.018 + Math.min(combo * 0.003, 0.025)),
      err:     () => {
        beep(130, 0.14, 0.08, "sawtooth");
        beep(100, 0.10, 0.05, "sawtooth", 0.05);
      },
      combo5:  () => [523, 659, 784].forEach((f, i) =>
        beep(f, 0.10, 0.07, "sine", i * 0.06)),
      combo10: () => [523, 659, 784, 1047].forEach((f, i) =>
        beep(f, 0.12, 0.09, "sine", i * 0.05)),
      levelup: () => [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) =>
        beep(f, 0.14, 0.09, "sine", i * 0.07)),
      win:     () => [523, 659, 784, 1047, 1319].forEach((f, i) =>
        beep(f, 0.18, 0.09, "sine", i * 0.08)),
    };
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const fmtTime = (ms: number): string => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
};

const stdDev = (arr: number[]): number => {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length);
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useNeuralEditor(opts: UseNeuralEditorOptions): UseNeuralEditorReturn {
  const {
    snippet, autoWriting, isZenMode, setIsZenMode,
    isRecallMode, isBlindMode, isHardcoreMode, isPrecisionMode,
    fontSize, selectedFont, terminalRef, textareaRef,
    soundEnabled = false, onComplete, onXP, onCombo, onError,
  } = opts;

  // ── State ──────────────────────────────────────────────────────────────────
  const [input,       setInput]       = useState("");
  const [isError,     setIsError]     = useState(false);
  const [finished,    setFinished]    = useState(false);
  const [startTime,   setStartTime]   = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm,         setWpm]         = useState(0);
  const [cpm,         setCpm]         = useState(0);
  const [accuracy,    setAccuracy]    = useState(100);
  const [consistency, setConsistency] = useState(100);
  const [combo,       setCombo]       = useState(0);
  const [maxCombo,    setMaxCombo]    = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const audioRef         = useRef<ReturnType<typeof makeAudio>>(null);
  const totalKeys        = useRef(0);
  const errCount         = useRef(0);
  const prevLen          = useRef(0);
  const timerRef         = useRef<NodeJS.Timeout | null>(null);
  const comboTimerRef    = useRef<NodeJS.Timeout | null>(null);
  const ksTimestamps     = useRef<number[]>([]); // keystroke timestamps

  // ── Init audio ────────────────────────────────────────────────────────────
  useEffect(() => { audioRef.current = makeAudio(); }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const rank = useMemo<Rank | null>(
    () => (finished ? getRank(accuracy) : null),
    [finished, accuracy],
  );

  const progress = useMemo(
    () => (snippet ? Math.min(100, (input.length / snippet.code.length) * 100) : 0),
    [input.length, snippet],
  );

  const isFocusMode = useMemo(
    () => (input.length > 0 || autoWriting || isZenMode) && !finished,
    [input.length, autoWriting, isZenMode, finished],
  );

  const isCodeVisible = useMemo(() => {
    if (isBlindMode) return false;
    if (isRecallMode && input.length > 0) return false;
    return true;
  }, [isBlindMode, isRecallMode, input.length]);

  const MASTER_STYLE = useMemo<React.CSSProperties>(
    () => ({
      fontFamily: selectedFont.family,
      fontSize,
      lineHeight: "1.75",
      fontWeight: 700,
      tabSize:    4,
    }),
    [selectedFont.family, fontSize],
  );

  // ── Visual feedback ───────────────────────────────────────────────────────

  const shakeTerminal = useCallback(() => {
    gsap.fromTo(
      terminalRef.current,
      { x: -5, filter: "brightness(1.25) hue-rotate(-18deg) saturate(1.4)" },
      { x:  0, filter: "brightness(1) hue-rotate(0deg) saturate(1)",
        duration: 0.13, ease: "rough", clearProps: "all" },
    );
  }, [terminalRef]);

  const celebrateWin = useCallback((r: Rank) => {
    gsap.timeline()
      .to(terminalRef.current, {
        boxShadow: `0 0 100px -12px ${r.glow}`,
        scale: r.id === "S" ? 1.012 : 1.004,
        duration: 0.5, ease: "elastic.out(1,0.4)",
      })
      .to(terminalRef.current, {
        boxShadow: "none", scale: 1,
        duration: 0.9, ease: "power2.inOut",
      });

    if (isPrecisionMode && r.id === "S") {
      gsap.to(terminalRef.current, {
        borderColor: "#facc15",
        boxShadow: "0 0 130px rgba(250,204,21,0.45)",
        duration: 0.5, ease: "elastic.out(1,0.3)", yoyo: true, repeat: 1,
      });
    }
  }, [terminalRef, isPrecisionMode]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetSnippet = useCallback(() => {
    if (timerRef.current)    clearInterval(timerRef.current);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);

    setInput(""); setFinished(false); setStartTime(null); setTimeElapsed(0);
    setWpm(0); setCpm(0); setAccuracy(100); setConsistency(100);
    setIsError(false); setCombo(0);

    totalKeys.current      = 0;
    errCount.current       = 0;
    prevLen.current        = 0;
    ksTimestamps.current   = [];

    gsap.to(terminalRef.current, {
      x: 0, scale: 1, boxShadow: "none",
      duration: 0.3, clearProps: "filter,borderColor",
    });
    gsap.fromTo(terminalRef.current,
      { scale: 0.984, opacity: 0.6 },
      { scale: 1, opacity: 1, duration: 0.45, ease: "expo.out" },
    );

    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [terminalRef, textareaRef]);

  // ── Core input handler ────────────────────────────────────────────────────
  const handleInput = useCallback((val: string) => {
    if (finished || !snippet || val.length > snippet.code.length) return;

    const safe = val.slice(0, snippet.code.length);

    // Start timer on first char
    if (!startTime && safe.length > 0) setStartTime(Date.now());

    const isAddition = safe.length > prevLen.current;
    prevLen.current = safe.length;

    if (isAddition && safe.length > 0) {
      const now      = Date.now();
      const lastIdx  = safe.length - 1;
      const wrong    = safe[lastIdx] !== snippet.code[lastIdx];

      totalKeys.current++;
      ksTimestamps.current.push(now);

      if (wrong) {
        // ── Error path ───────────────────────────────────────────────────
        errCount.current++;
        setIsError(true);
        setCombo(0);
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        onError?.();
        if (soundEnabled) audioRef.current?.err();
        shakeTerminal();

        if (isHardcoreMode) {
          gsap.to(terminalRef.current, {
            backgroundColor: "rgba(239,68,68,0.10)",
            duration: 0.07,
            onComplete: resetSnippet,
          });
          return;
        }
      } else {
        // ── Correct path ─────────────────────────────────────────────────
        window.dispatchEvent(new Event("ns-key"));

        // XP
        const xpGain = XP_PER_CHAR * (1 + Math.floor(combo / 10));
        onXP?.(xpGain);

        // Combo
        setCombo(c => {
          const next = c + 1;
          setMaxCombo(m => Math.max(m, next));
          onCombo?.(next);
          if (soundEnabled) {
            if (next === 5)  audioRef.current?.combo5();
            else if (next === 10) audioRef.current?.combo10();
            else audioRef.current?.key(next);
          }
          return next;
        });

        // Combo decay timer
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => setCombo(0), COMBO_DECAY);

        // Accuracy (cumulative — not reset on delete)
        const acc = Math.round(
          ((totalKeys.current - errCount.current) / totalKeys.current) * 100,
        );
        setAccuracy(Math.max(0, acc));

        // Consistency (stddev of inter-keystroke intervals)
        if (ksTimestamps.current.length > 4) {
          const intervals = ksTimestamps.current
            .slice(1)
            .map((t, i) => t - ksTimestamps.current[i]);
          const sd    = stdDev(intervals);
          const score = Math.max(0, Math.round(100 - sd / 8));
          setConsistency(score);
        }

        // Error state based on all chars so far
        setIsError(safe.split("").some((c, i) => c !== snippet.code[i]));
      }
    } else {
      // Deletion — recheck full error state
      setIsError(safe.split("").some((c, i) => c !== snippet.code[i]));
    }

    setInput(safe);

    // ── Victory ───────────────────────────────────────────────────────────
    if (safe === snippet.code) {
      setFinished(true);
      if (timerRef.current)    clearInterval(timerRef.current);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);

      const finalAcc = Math.max(0, Math.round(
        ((totalKeys.current - errCount.current) / Math.max(1, totalKeys.current)) * 100,
      ));
      const finalRank = getRank(finalAcc);

      if (soundEnabled) audioRef.current?.win();
      celebrateWin(finalRank);

      onComplete?.({
        wpm, cpm, accuracy: finalAcc, consistency,
        timeElapsed: startTime ? Date.now() - startTime : 0,
        totalKeystrokes: totalKeys.current,
        errorCount: errCount.current,
        combo: maxCombo,
        rank: finalRank,
      });
    }
  }, [
    finished, snippet, startTime, combo, maxCombo, wpm, cpm, consistency,
    soundEnabled, isHardcoreMode, terminalRef, shakeTerminal, celebrateWin,
    resetSnippet, onXP, onCombo, onError, onComplete,
  ]);

  // ── Key handler ───────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (autoWriting || finished) return;

      if (e.key === "Escape" && isZenMode) { setIsZenMode(false); return; }

      if (e.key === "Tab") {
        e.preventDefault();
        const { selectionStart, selectionEnd } = e.currentTarget;
        const tab = "    ";
        handleInput(
          input.substring(0, selectionStart) + tab + input.substring(selectionEnd),
        );
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = selectionStart + tab.length;
          }
        }, 0);
        return;
      }

      if (isHardcoreMode && e.key === "Backspace") {
        e.preventDefault();
        gsap.to(terminalRef.current, {
          x: -3, duration: 0.04, repeat: 2, yoyo: true, clearProps: "x",
        });
      }
    },
    [
      input, autoWriting, finished, isZenMode, isHardcoreMode,
      setIsZenMode, handleInput, textareaRef, terminalRef,
    ],
  );

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(
        () => setTimeElapsed(Date.now() - startTime), 100,
      );
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  // ── WPM + CPM ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!startTime || input.length < 5 || finished) return;
    const mins = (Date.now() - startTime) / 60000;
    setWpm(v => { const r = Math.round(input.length / 5 / mins); return r > 0 ? r : v; });
    setCpm(v => { const r = Math.round(input.length / mins);      return r > 0 ? r : v; });
  }, [input.length, startTime, finished]);

  // ── Return ────────────────────────────────────────────────────────────────
  return {
    input, isError, finished, startTime, timeElapsed,
    wpm, cpm, accuracy, consistency, combo, maxCombo,
    rank, progress, isFocusMode, isCodeVisible, MASTER_STYLE,
    handleInput, handleKeyDown, resetSnippet,
    formatTime: fmtTime,
  };
}