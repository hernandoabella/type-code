"use client";

import {
  useRef, useState, useEffect, useMemo, useCallback, JSX,
} from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { VscChevronLeft, VscChevronRight, VscRefresh, VscCheck } from "react-icons/vsc";
import gsap from "gsap";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SnippetLang     = "javascript" | "typescript" | "python";
export type SnippetLevel    = "beginner" | "intermediate" | "advanced";
export type SnippetCategory = "Hooks"|"Forms"|"Async"|"Types"|"Logic"|"Data"|"Performance";

export interface Snippet {
  id: string; title: string; category: SnippetCategory; lang: SnippetLang;
  level: SnippetLevel; tags: string[]; icon: JSX.Element; description: string;
  realLifeUsage: string; output?: string; bestPractice?: boolean; code: string;
}

import { HIGHLIGHT_THEMES, ACCENTS, FONTS, LANG_ICONS, SNIPPETS } from "./config/constants";
import { Navbar } from "./components/navbar/Navbar";

// ─── Game constants ───────────────────────────────────────────────────────────
const XP_PER_CHAR   = 2;
const XP_PER_LEVEL  = 200;
const MAX_HP        = 100;
const HP_PER_ERROR  = 8;
const COMBO_DECAY   = 3000; // ms before combo resets if idle
const RANKS = [
  { min: 100, id:"S", label:"PERFECT",  color:"#facc15", glow:"rgba(250,204,21,0.6)"  },
  { min:  95, id:"A", label:"ELITE",    color:"#60a5fa", glow:"rgba(96,165,250,0.6)"  },
  { min:  85, id:"B", label:"SENIOR",   color:"#4ade80", glow:"rgba(74,222,128,0.55)" },
  { min:  70, id:"C", label:"MID",      color:"#a78bfa", glow:"rgba(167,139,250,0.5)" },
  { min:   0, id:"D", label:"NOOB",     color:"#f87171", glow:"rgba(248,113,113,0.5)" },
] as const;
const getRank = (acc: number) => RANKS.find(r => acc >= r.min) ?? RANKS[RANKS.length-1];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GAME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Orbitron:wght@400;700;900&display=swap');

  /* ── Split-flap unlock ── */
  @keyframes sf-in {
    0%   { transform:rotateX(0deg);   opacity:0.52; filter:brightness(0.72); }
    40%  { transform:rotateX(-90deg); opacity:0;    filter:brightness(0.1); }
    60%  { transform:rotateX(90deg);  opacity:0;    filter:brightness(0.1); }
    100% { transform:rotateX(0deg);   opacity:1;    filter:brightness(1.12); }
  }
  /* ── Error shake ── */
  @keyframes sf-err {
    0%   { transform:rotateX(0deg) rotateZ(0deg);   }
    30%  { transform:rotateX(-55deg) rotateZ(-3deg); }
    70%  { transform:rotateX(55deg) rotateZ(3deg);   }
    100% { transform:rotateX(0deg) rotateZ(0deg);    }
  }
  /* ── Cursor breathe ── */
  @keyframes cur-breathe {
    0%,100% { opacity:1;    box-shadow:0 0 8px 2px var(--cg),0 0 22px 5px var(--cg); }
    50%      { opacity:0.35; box-shadow:0 0 3px 1px var(--cg); }
  }
  /* ── Trail particle ── */
  @keyframes trail-up {
    from { opacity:0.7; transform:translateY(0) scale(1); }
    to   { opacity:0;   transform:translateY(-10px) scale(0.3); }
  }
  /* ── XP float ── */
  @keyframes xp-float {
    0%   { opacity:1;   transform:translateY(0px)  scale(1); }
    60%  { opacity:1;   transform:translateY(-28px) scale(1.1); }
    100% { opacity:0;   transform:translateY(-50px) scale(0.8); }
  }
  /* ── Combo pop ── */
  @keyframes combo-pop {
    0%   { transform:scale(0.5); opacity:0; }
    50%  { transform:scale(1.3); opacity:1; }
    100% { transform:scale(1);   opacity:1; }
  }
  /* ── Screen flash ── */
  @keyframes screen-flash {
    0%,100% { opacity:0; }
    50%      { opacity:1; }
  }
  /* ── Level up burst ── */
  @keyframes levelup-in {
    0%   { transform:scale(0.3) rotate(-5deg); opacity:0; filter:blur(20px); }
    60%  { transform:scale(1.08) rotate(1deg); opacity:1; filter:blur(0px); }
    100% { transform:scale(1) rotate(0deg);    opacity:1; }
  }
  @keyframes levelup-out {
    0%   { transform:scale(1);    opacity:1; }
    100% { transform:scale(1.2);  opacity:0; filter:blur(8px); }
  }
  /* ── HP bar drain ── */
  @keyframes hp-drain {
    0%   { filter:brightness(1.5); }
    100% { filter:brightness(1); }
  }
  /* ── Pixel burst ── */
  @keyframes pixel-burst {
    0%   { transform:translate(0,0) scale(1); opacity:1; }
    100% { transform:translate(var(--px),var(--py)) scale(0); opacity:0; }
  }
  /* ── Scanline ── */
  @keyframes scanline-move {
    0%   { transform:translateY(-100%); }
    100% { transform:translateY(100vh); }
  }
  /* ── Hex grid pulse ── */
  @keyframes hex-pulse {
    0%,100% { opacity:0.018; }
    50%      { opacity:0.045; }
  }
  /* ── Notification slide ── */
  @keyframes notif-in {
    from { transform:translateX(60px); opacity:0; }
    to   { transform:translateX(0);    opacity:1; }
  }
  @keyframes notif-out {
    from { transform:translateX(0);    opacity:1; }
    to   { transform:translateX(60px); opacity:0; }
  }

  /* ── Synced screen entrance ── */
  @keyframes synced-bg {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes synced-title {
    0%   { opacity:0; transform:scale(0.6) translateY(30px); filter:blur(30px); }
    60%  { opacity:1; transform:scale(1.04) translateY(-4px); filter:blur(0px); }
    100% { opacity:1; transform:scale(1) translateY(0px); filter:blur(0px); }
  }
  @keyframes synced-rank {
    0%   { opacity:0; transform:translateY(20px) scale(0.8); }
    100% { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes synced-stat {
    0%   { opacity:0; transform:translateY(16px); }
    100% { opacity:1; transform:translateY(0); }
  }
  @keyframes synced-line {
    0%   { width:0; opacity:0; }
    100% { width:8rem; opacity:1; }
  }
  .synced-bg    { animation:synced-bg    0.5s ease-out forwards; }
  .synced-title { animation:synced-title 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .synced-rank  { animation:synced-rank  0.5s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
  .synced-stat  { animation:synced-stat  0.4s ease-out both; }
  .synced-line  { animation:synced-line  0.6s ease-out 0.4s both; }
  /* ── Countdown ring ── */
  @keyframes countdown-ring {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: 283; }
  }
  .countdown-ring { animation: countdown-ring linear forwards; }
  .sf-untyped { opacity:0.52; filter:brightness(0.72); }
  .sf-play    { animation:sf-in 0.2s cubic-bezier(0.22,1,0.36,1) forwards; transform-style:preserve-3d; }
  .sf-err     { animation:sf-err 0.16s ease-in-out; background:rgba(239,68,68,0.18); color:#f87171!important; border-radius:2px; padding:0 1px; }
  .cur-bar {
    position: absolute;
    left: -3px;
    top: 50%;
    transform: translateY(-50%);
    width: 2.5px;
    height: 1.1em;
    border-radius: 2px;
    pointer-events: none;
    box-shadow: 0 0 8px 2px var(--cg), 0 0 22px 5px var(--cg);
  }
  /* Next-char highlight: subtle underline on the character the cursor is about to type */
  .sf-next {
    opacity: 1 !important;
    filter: brightness(1.1) !important;
    border-bottom: 2px solid var(--next-color);
    padding-bottom: 1px;
  }
  .cur-trail  { position:absolute; border-radius:2px; pointer-events:none; animation:trail-up 0.28s ease-out forwards; }
  .xp-float   { position:fixed; pointer-events:none; font-family:'Orbitron',monospace; font-weight:900; font-size:13px; z-index:999; animation:xp-float 0.8s ease-out forwards; }
  .pixel-spark{ position:absolute; width:3px; height:3px; border-radius:1px; pointer-events:none; animation:pixel-burst 0.5s ease-out forwards; }
  .notif      { animation:notif-in 0.3s ease-out; }
  .notif-exit { animation:notif-out 0.3s ease-in forwards; }
  .hex-bg     { animation:hex-pulse 2s ease-in-out infinite; }
  .scanline   { animation:scanline-move 8s linear infinite; }
  .combo-num  { animation:combo-pop 0.2s cubic-bezier(0.22,1,0.36,1); }
  .levelup-in { animation:levelup-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
  .levelup-out{ animation:levelup-out 0.5s ease-in forwards; }
`;

// ─── Audio ────────────────────────────────────────────────────────────────────
const makeAudio = () => {
  if (typeof window === "undefined") return null;
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    const beep = (f: number, d: number, v = 0.05, t: OscillatorType = "sine", delay = 0) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = t; o.frequency.value = f;
      const start = ctx.currentTime + delay;
      g.gain.setValueAtTime(v, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + d);
      o.start(start); o.stop(start + d);
    };
    return {
      key:     (combo: number) => beep(700 + combo * 15, 0.03, 0.02 + Math.min(combo*0.003,0.025)),
      err:     () => { beep(120, 0.15, 0.09, "sawtooth"); beep(100, 0.1, 0.06, "sawtooth", 0.05); },
      combo5:  () => { [523,659,784].forEach((f,i) => beep(f, 0.1, 0.07, "sine", i*0.06)); },
      combo10: () => { [523,659,784,1047].forEach((f,i) => beep(f, 0.12, 0.09, "sine", i*0.05)); },
      levelup: () => { [262,330,392,523,659,784,1047].forEach((f,i) => beep(f, 0.15, 0.1, "sine", i*0.07)); },
      win:     () => { [523,659,784,1047,1319].forEach((f,i) => beep(f, 0.2, 0.1, "sine", i*0.08)); },
    };
  } catch { return null; }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtTime = (ms: number) => {
  const s = Math.floor(ms/1000);
  return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
};
const calcAcc = (input: string, code: string) => {
  if (!input.length) return 100;
  return Math.round(input.split("").filter((c,i) => c===code[i]).length / input.length * 100);
};

// ─── Floating Notification ───────────────────────────────────────────────────
interface Notif { id: number; text: string; color: string; }
function NotifStack({ notifs }: { notifs: Notif[] }) {
  return (
    <div className="fixed top-24 right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      {notifs.map(n => (
        <div
          key={n.id}
          className="notif px-4 py-2 rounded-xl border backdrop-blur-md text-xs font-black uppercase tracking-widest"
          style={{
            background: `${n.color}18`,
            borderColor: `${n.color}40`,
            color: n.color,
            fontFamily: "'Orbitron', monospace",
            textShadow: `0 0 12px ${n.color}`,
          }}
        >
          {n.text}
        </div>
      ))}
    </div>
  );
}

// ─── XP Bar ───────────────────────────────────────────────────────────────────
function XPBar({ xp, level, color }: { xp: number; level: number; color: string }) {
  const pct = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ fontFamily:"'Orbitron',monospace" }}>LVL</span>
      <span className="text-lg font-black tabular-nums" style={{ color, fontFamily:"'Orbitron',monospace", textShadow:`0 0 10px ${color}` }}>
        {level}
      </span>
      <div className="relative w-28 h-[5px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width:`${pct}%`, background:color, boxShadow:`0 0 8px ${color}` }}
        />
      </div>
      <span className="text-[8px] opacity-30 tabular-nums font-mono">{Math.round(pct)}%</span>
    </div>
  );
}

// ─── HP Bar ───────────────────────────────────────────────────────────────────
function HPBar({ hp }: { hp: number }) {
  const color = hp > 60 ? "#4ade80" : hp > 30 ? "#facc15" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ fontFamily:"'Orbitron',monospace" }}>HP</span>
      <div className="relative w-20 h-[5px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width:`${hp}%`, background:color, boxShadow:`0 0 6px ${color}` }}
        />
      </div>
      <span className="text-[9px] font-black tabular-nums" style={{ color, fontFamily:"'Orbitron',monospace" }}>{hp}</span>
    </div>
  );
}

// ─── Combo Counter ────────────────────────────────────────────────────────────
function ComboDisplay({ combo, color }: { combo: number; color: string }) {
  if (combo < 2) return null;
  const size = combo >= 20 ? "text-5xl" : combo >= 10 ? "text-4xl" : "text-2xl";
  return (
    <div className="flex flex-col items-center">
      <span
        key={combo}
        className={`combo-num font-black tabular-nums ${size}`}
        style={{ color, fontFamily:"'Orbitron',monospace", textShadow:`0 0 20px ${color}, 0 0 40px ${color}` }}
      >
        {combo}x
      </span>
      <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40" style={{ fontFamily:"'Orbitron',monospace" }}>COMBO</span>
    </div>
  );
}

// ─── Pixel Burst (fires on char unlock) ───────────────────────────────────────
function spawnPixelBurst(container: HTMLElement, color: string) {
  const count = 6;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "pixel-spark";
    const angle = (i / count) * Math.PI * 2;
    const dist  = 12 + Math.random() * 18;
    el.style.cssText = `
      background: ${color};
      box-shadow: 0 0 4px ${color};
      --px: ${Math.cos(angle) * dist}px;
      --py: ${Math.sin(angle) * dist}px;
      top: 50%; left: 0;
      animation-duration: ${0.3 + Math.random() * 0.25}s;
      animation-delay: ${Math.random() * 0.05}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }
}

// ─── NeuralCursor ─────────────────────────────────────────────────────────────
function NeuralCursor({ bg, glow }: { bg: string; glow: string }) {
  const poolRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const spawn = () => {
      if (!poolRef.current) return;
      const s = document.createElement("span");
      s.className = "cur-trail";
      s.style.cssText = `
        background:${glow}; width:${0.8+Math.random()*1.2}px;
        height:${0.3+Math.random()*0.6}em; top:${0.1+Math.random()*0.4}em;
        left:${-1+(Math.random()-0.5)*5}px; animation-duration:${0.2+Math.random()*0.14}s;
      `;
      poolRef.current.appendChild(s);
      setTimeout(() => s.remove(), 420);
    };
    window.addEventListener("ns-key", spawn);
    return () => window.removeEventListener("ns-key", spawn);
  }, [glow]);
  return (
    <>
      <span ref={poolRef} style={{ position:"absolute", inset:0, overflow:"visible", pointerEvents:"none" }} />
      <span className={`cur-bar ${bg}`} style={{ "--cg":glow } as any} />
    </>
  );
}

// ─── SplitFlapUnlock ──────────────────────────────────────────────────────────
function SplitFlapUnlock({ char, accentColor }: { char: string; accentColor: string }) {
  const ref    = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  useEffect(() => {
    if (!played.current && ref.current) {
      played.current = true;
      ref.current.classList.remove("sf-play");
      void ref.current.offsetWidth;
      ref.current.classList.add("sf-play");
      // Pixel burst on the char position
      spawnPixelBurst(ref.current, accentColor);
    }
  }, []);
  if (char === "\n") return <br />;
  return (
    <span ref={ref} className="sf-play relative" style={{ display:"inline", whiteSpace:"pre", color:"transparent" }}>
      {char}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, color, finished }: { value:number; color:string; finished:boolean }) {
  return (
    <div className="relative h-[2px] w-full bg-white/[0.05] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-100"
        style={{ width:`${Math.min(value,100)}%`, background:color, boxShadow:`0 0 6px ${color}` }}
      />
      {finished && <div className="absolute inset-0 animate-pulse" style={{ background:color, opacity:0.4 }} />}
    </div>
  );
}

// ─── Level Up Overlay ─────────────────────────────────────────────────────────
function LevelUpOverlay({ level, color, onDone }: { level:number; color:string; onDone:()=>void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.classList.remove("levelup-in");
      ref.current?.classList.add("levelup-out");
      setTimeout(onDone, 400);
    }, 1000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-none"
      style={{ background:`radial-gradient(ellipse 55% 45% at 50% 50%, ${color}18 0%, rgba(3,3,5,0.82) 70%)`, backdropFilter:"blur(6px)" }}
    >
      <div
        ref={ref}
        className="levelup-in flex flex-col items-center gap-2 px-16 py-10 rounded-3xl border"
        style={{
          background:`linear-gradient(160deg, #0e0e16, #08080d)`,
          borderColor:`${color}25`,
          boxShadow:`0 0 60px -15px ${color}60, inset 0 1px 0 ${color}15`,
        }}
      >
        <div className="text-[10px] font-black uppercase tracking-[0.5em] opacity-50" style={{ fontFamily:"'Orbitron',monospace", color }}>
          ◆ LEVEL UP ◆
        </div>
        <div
          className="text-[6rem] font-black leading-none tabular-nums"
          style={{ fontFamily:"'Orbitron',monospace", color, textShadow:`0 0 30px ${color}, 0 0 60px ${color}60` }}
        >
          {level}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-30" style={{ fontFamily:"'Orbitron',monospace" }}>
          keep going
        </div>
      </div>
    </div>
  );
}

// ─── Completion Screen ────────────────────────────────────────────────────────
// Renders as fixed fullscreen overlay — centered on the entire viewport
const COUNTDOWN_SECS = 5;

function CompletionScreen({ wpm, accuracy, time, combo, rank, onNext }: {
  wpm:number; accuracy:number; time:number; combo:number;
  rank: typeof RANKS[number]; onNext: () => void;
}) {
  const [count, setCount] = useState(COUNTDOWN_SECS);
  const [ringKey, setRingKey] = useState(0); // force re-mount to restart animation

  useEffect(() => {
    // Start counting down after stats have had time to appear
    const startDelay = setTimeout(() => {
      setRingKey(k => k + 1); // restart ring animation
      const interval = setInterval(() => {
        setCount(c => {
          if (c <= 1) {
            clearInterval(interval);
            setTimeout(onNext, 300);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, 1200);
    return () => clearTimeout(startDelay);
  }, [onNext]);

  const stats = [
    { l:"WPM",   v: String(wpm),    color: wpm > 80 ? "#4ade80" : "#e2e8f0", delay:"0.7s" },
    { l:"ACC",   v: `${accuracy}%`, color: accuracy >= 98 ? rank.color : accuracy >= 90 ? "#facc15" : "#f87171", delay:"0.8s" },
    { l:"TIME",  v: fmtTime(time),  color: "#e2e8f0", delay:"0.9s" },
    { l:"COMBO", v: `${combo}x`,    color: "#a78bfa", delay:"1.0s" },
  ];

  // SVG ring params
  const R   = 45;
  const C   = 2 * Math.PI * R; // ≈ 283
  const dur = `${COUNTDOWN_SECS - 1}s`; // ring drains over the full countdown

  return (
    <div
      className="synced-bg fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{ background:"rgba(3,3,5,0.92)", backdropFilter:"blur(24px)" }}
    >
      {/* Radial color bloom behind everything */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:`radial-gradient(ellipse 60% 50% at 50% 50%, ${rank.color}12 0%, transparent 70%)`,
        }}
      />

      {/* SYNCED — the hero text */}
      <div className="synced-title relative flex flex-col items-center">
        {/* Ghost echo letters for depth */}
        <span
          className="absolute select-none pointer-events-none"
          style={{
            fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(5rem,14vw,12rem)",
            fontWeight:900,
            color:"transparent",
            WebkitTextStroke:`1px ${rank.color}15`,
            letterSpacing:"0.18em",
            transform:"scale(1.08)",
            filter:"blur(2px)",
          }}
        >
          SYNCED
        </span>
        <span
          style={{
            fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(5rem,14vw,12rem)",
            fontWeight:900,
            color:"#fff",
            letterSpacing:"0.18em",
            lineHeight:1,
            textShadow:`0 0 40px ${rank.color}90, 0 0 80px ${rank.color}40, 0 0 120px ${rank.color}20`,
          }}
        >
          SYNCED
        </span>
      </div>

      {/* Rank badge */}
      <div
        className="synced-rank mt-8 flex items-center gap-4 px-8 py-4 rounded-2xl border"
        style={{
          borderColor:`${rank.color}35`,
          background:`${rank.color}0e`,
          boxShadow:`0 0 40px -10px ${rank.glow}`,
        }}
      >
        <span
          className="text-5xl font-black"
          style={{
            fontFamily:"'Orbitron',monospace",
            color:rank.color,
            textShadow:`0 0 20px ${rank.color}`,
          }}
        >
          {rank.id}
        </span>
        <div className="flex flex-col">
          <span
            className="text-xs font-black uppercase tracking-[0.3em]"
            style={{ fontFamily:"'Orbitron',monospace", color:rank.color, opacity:0.7 }}
          >
            {rank.label}
          </span>
          <span className="text-[10px] opacity-25 font-mono mt-0.5">rank achieved</span>
        </div>
      </div>

      {/* Divider line */}
      <div
        className="synced-line mt-10 h-px rounded-full"
        style={{ background:`linear-gradient(90deg, transparent, ${rank.color}50, transparent)` }}
      />

      {/* Stats */}
      <div className="flex items-end gap-12 mt-10">
        {stats.map(({ l, v, color, delay }) => (
          <div
            key={l}
            className="synced-stat flex flex-col items-center gap-2"
            style={{ animationDelay: delay }}
          >
            <span
              className="text-[9px] font-black uppercase tracking-[0.25em]"
              style={{ fontFamily:"'Orbitron',monospace", color:"#ffffff30" }}
            >
              {l}
            </span>
            <span
              style={{
                fontFamily:"'Orbitron',monospace",
                fontSize:"clamp(1.5rem,3vw,2.5rem)",
                fontWeight:900,
                color,
                lineHeight:1,
                textShadow:`0 0 16px ${color}80`,
              }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* ── Countdown to next challenge ── */}
      <div className="synced-stat mt-10 flex flex-col items-center gap-3" style={{ animationDelay:"1.2s" }}>
        {/* SVG ring countdown */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Track */}
            <circle cx="50" cy="50" r={R} fill="none" stroke={`${rank.color}18`} strokeWidth="4" />
            {/* Draining arc */}
            <circle
              key={ringKey}
              className="countdown-ring"
              cx="50" cy="50" r={R}
              fill="none"
              stroke={rank.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={0}
              style={{
                animationDuration: dur,
                animationDelay: "1.2s",
                filter:`drop-shadow(0 0 6px ${rank.color})`,
              }}
            />
          </svg>
          {/* Number */}
          <span
            className="relative tabular-nums font-black"
            style={{
              fontFamily:"'Orbitron',monospace",
              fontSize:"2rem",
              color: count <= 2 ? "#f87171" : rank.color,
              textShadow:`0 0 16px ${count <= 2 ? "#f87171" : rank.color}`,
              transition:"color 0.3s, text-shadow 0.3s",
            }}
          >
            {count}
          </span>
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-[0.3em]"
          style={{ fontFamily:"'Orbitron',monospace", color:"#ffffff30" }}
        >
          next challenge
        </span>
      </div>

      {/* Subtle corner brackets */}
      {[
        "top-8 left-8 border-t-2 border-l-2 rounded-tl-xl",
        "top-8 right-8 border-t-2 border-r-2 rounded-tr-xl",
        "bottom-8 left-8 border-b-2 border-l-2 rounded-bl-xl",
        "bottom-8 right-8 border-b-2 border-r-2 rounded-br-xl",
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-10 h-10 pointer-events-none ${cls}`}
          style={{ borderColor:`${rank.color}30` }}
        />
      ))}
    </div>
  );
}

// ─── Hex Grid Background ──────────────────────────────────────────────────────
function HexGrid({ color }: { color: string }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 hex-bg"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33z' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.5'/%3E%3Cpath d='M28 100L0 84V51l28-17 28 17v33z' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: "56px 100px",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function NeuralSyncMaster() {
  // ── UI ──────────────────────────────────────────────────────────────────────
  const [mounted,        setMounted]        = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [selectedFont,   setSelectedFont]   = useState(FONTS[0]);
  const [editorTheme,    setEditorTheme]    = useState(HIGHLIGHT_THEMES[0]);
  const [fontSize,       setFontSize]       = useState("16px");
  const [langFilter,     setLangFilter]     = useState("all");
  const [level,          setLevel]          = useState(0);
  const [isZenMode,      setIsZenMode]      = useState(false);
  const [isGhostActive,  setIsGhostActive]  = useState(false);
  const [isRecallMode,   setIsRecallMode]   = useState(false);
  const [autoPilot,      setAutoPilot]      = useState(false);
  const [autoWriting,    setAutoWriting]    = useState(false);
  const [soundEnabled,   setSoundEnabled]   = useState(true);

  // ── Typing ──────────────────────────────────────────────────────────────────
  const [input,          setInput]          = useState("");
  const [isError,        setIsError]        = useState(false);
  const [finished,       setFinished]       = useState(false);
  const [startTime,      setStartTime]      = useState<number | null>(null);
  const [timeElapsed,    setTimeElapsed]    = useState(0);
  const [wpm,            setWpm]            = useState(0);
  const [accuracy,       setAccuracy]       = useState(100);

  // ── Game state ──────────────────────────────────────────────────────────────
  const [xp,             setXp]             = useState(0);
  const [playerLevel,    setPlayerLevel]    = useState(1);
  const [hp,             setHp]             = useState(MAX_HP);
  const [combo,          setCombo]          = useState(0);
  const [maxCombo,       setMaxCombo]       = useState(0);
  const [streak,         setStreak]         = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showLevelUp,    setShowLevelUp]    = useState(false);
  const [levelUpNum,     setLevelUpNum]     = useState(1);
  const [notifs,         setNotifs]         = useState<Notif[]>([]);
  const notifIdRef                          = useRef(0);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const terminalRef    = useRef<HTMLDivElement>(null);
  const autoWriteRef   = useRef<NodeJS.Timeout | null>(null);
  const timerRef       = useRef<NodeJS.Timeout | null>(null);
  const comboTimerRef  = useRef<NodeJS.Timeout | null>(null);
  const audioRef       = useRef<ReturnType<typeof makeAudio>>(null);
  const prevLenRef     = useRef(0);
  const errCountRef    = useRef(0);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const filteredPool = useMemo(
    () => SNIPPETS.filter(s => langFilter==="all" || s.lang===langFilter),
    [langFilter]
  );
  const languages = useMemo(
    () => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))],
    []
  );
  const snippet = filteredPool[level] || filteredPool[0];

  const accentColor = isError ? "#f87171" : (selectedAccent as any).hex ?? "#63cab7";
  const accentBg    = isError ? "bg-red-500"  : selectedAccent.bg;
  const accentClass = isError ? "text-red-400": selectedAccent.class;
  const accentGlow  = isError ? "rgba(248,113,113,0.65)" : "rgba(99,202,183,0.6)";
  const accentShadow= isError ? "rgba(239,68,68,0.5)" : (selectedAccent as any).shadow ?? "rgba(99,202,183,0.5)";

  const accent = { class:accentClass, bg:accentBg, glow:accentGlow, shadow:accentShadow, color:accentColor };

  const progress = snippet ? (input.length / snippet.code.length) * 100 : 0;
  const isFocusMode = useMemo(
    () => (input.length > 0 || autoWriting) && !finished,
    [input.length, autoWriting, finished]
  );
  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize:   fontSize || "16px",
    lineHeight: "1.75",
    fontWeight: 700,
    tabSize:    4,
  }), [selectedFont.family, fontSize]);

  const charStates = useMemo(() => {
    if (!snippet) return [];
    return snippet.code.split("").map((char, i) => ({
      char,
      state: (
        i === input.length     ? "cursor"  :
        i === input.length + 1 ? "next"    :
        i >  input.length      ? "untyped" :
        input[i] !== snippet.code[i] ? "wrong" : "unlock"
      ) as "cursor"|"next"|"untyped"|"wrong"|"unlock",
    }));
  }, [snippet, input]);

  const rank = useMemo(() => getRank(accuracy), [accuracy]);

  // ── Notification helper ───────────────────────────────────────────────────
  const pushNotif = useCallback((text: string, color: string) => {
    const id = notifIdRef.current++;
    setNotifs(n => [...n.slice(-4), { id, text, color }]);
    setTimeout(() => setNotifs(n => n.filter(x => x.id !== id)), 2200);
  }, []);

  // ── XP gain helper ────────────────────────────────────────────────────────
  const gainXP = useCallback((amount: number) => {
    setXp(prev => {
      const next = prev + amount;
      const prevLvl = Math.floor(prev / XP_PER_LEVEL) + 1;
      const nextLvl = Math.floor(next / XP_PER_LEVEL) + 1;
      if (nextLvl > prevLvl) {
        setPlayerLevel(nextLvl);
        setLevelUpNum(nextLvl);
        setShowLevelUp(true);
        if (soundEnabled) audioRef.current?.levelup();
      }
      return next;
    });
  }, [soundEnabled]);

  // ── CSS inject ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("ns-css")) return;
    const el = document.createElement("style");
    el.id = "ns-css"; el.textContent = GAME_CSS;
    document.head.appendChild(el);
  }, []);

  useEffect(() => { audioRef.current = makeAudio(); }, []);

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const ls = localStorage;
    if (ls.getItem("ns_level"))   setLevel(+ls.getItem("ns_level")!);
    if (ls.getItem("ns_streak"))  setStreak(+ls.getItem("ns_streak")!);
    if (ls.getItem("ns_total"))   setTotalCompleted(+ls.getItem("ns_total")!);
    if (ls.getItem("ns_xp"))      setXp(+ls.getItem("ns_xp")!);
    if (ls.getItem("ns_plvl"))    setPlayerLevel(+ls.getItem("ns_plvl")!);
    if (ls.getItem("ns_sound"))   setSoundEnabled(ls.getItem("ns_sound") !== "false");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const ls = localStorage;
    ls.setItem("ns_level",  level.toString());
    ls.setItem("ns_streak", streak.toString());
    ls.setItem("ns_total",  totalCompleted.toString());
    ls.setItem("ns_xp",     xp.toString());
    ls.setItem("ns_plvl",   playerLevel.toString());
    ls.setItem("ns_sound",  soundEnabled.toString());
  }, [level, streak, totalCompleted, xp, playerLevel, soundEnabled, mounted]);

  // ── ESC ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key==="Escape" && isZenMode) setIsZenMode(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isZenMode]);

  // ── Input handler ─────────────────────────────────────────────────────────
  const handleInput = useCallback((val: string) => {
    if (finished || !snippet || val.length > snippet.code.length) return;
    if (!startTime && val.length > 0) setStartTime(Date.now());

    const isDel   = val.length < prevLenRef.current;
    const lastIdx = val.length - 1;
    prevLenRef.current = val.length;

    if (!isDel && val.length > 0) {
      const wrong = val[lastIdx] !== snippet.code[lastIdx];

      if (wrong) {
        errCountRef.current++;
        setIsError(true);
        setCombo(0);
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        // HP drain
        setHp(h => {
          const next = Math.max(0, h - HP_PER_ERROR);
          if (next <= 20 && h > 20) pushNotif("⚠ LOW HP!", "#f87171");
          return next;
        });
        if (soundEnabled) audioRef.current?.err();
        // Screen flash red
        gsap.fromTo(terminalRef.current,
          { x:-6, filter:"brightness(1.3) hue-rotate(-20deg) saturate(1.5)" },
          { x:0,  filter:"brightness(1) hue-rotate(0deg) saturate(1)", duration:0.14, ease:"rough", clearProps:"all" }
        );
      } else {
        if (soundEnabled) audioRef.current?.key(combo);
        window.dispatchEvent(new Event("ns-key"));
        // XP gain
        const xpGain = XP_PER_CHAR * (1 + Math.floor(combo / 10));
        gainXP(xpGain);

        // Combo logic
        setCombo(c => {
          const next = c + 1;
          setMaxCombo(m => Math.max(m, next));
          if (next === 5)  { pushNotif("🔥 COMBO x5!", "#f97316");  if (soundEnabled) audioRef.current?.combo5(); }
          if (next === 10) { pushNotif("⚡ COMBO x10!", "#facc15"); if (soundEnabled) audioRef.current?.combo10(); }
          if (next === 20) { pushNotif("💥 COMBO x20!", "#a78bfa"); }
          if (next === 50) { pushNotif("🌟 GODLIKE x50!", "#ec4899"); }
          return next;
        });

        // Reset combo decay timer
        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = setTimeout(() => setCombo(0), COMBO_DECAY);

        const anyErr = val.split("").some((c,i) => c !== snippet.code[i]);
        setIsError(anyErr);
      }
    } else {
      const anyErr = val.split("").some((c,i) => c !== snippet.code[i]);
      setIsError(anyErr);
    }

    setInput(val);
    setAccuracy(calcAcc(val, snippet.code));

    // Victory
    if (val === snippet.code) {
      setFinished(true);
      if (autoWriteRef.current) { clearInterval(autoWriteRef.current); autoWriteRef.current = null; }
      if (timerRef.current) clearInterval(timerRef.current);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      setStreak(s => s + 1);
      setTotalCompleted(t => t + 1);
      const finalRank = getRank(calcAcc(val, snippet.code));
      pushNotif(`${finalRank.id} RANK — ${finalRank.label}!`, finalRank.color);
      // Bonus XP on completion
      gainXP(snippet.code.length * 3 + combo * 5);
      if (soundEnabled) audioRef.current?.win();
      gsap.timeline()
        .to(terminalRef.current, { boxShadow:`0 0 120px -10px ${accentShadow}`, duration:0.5, ease:"power2.out" })
        .to(terminalRef.current, { boxShadow:"none", duration:1.2, ease:"power2.in" });
    }
  }, [finished, snippet, startTime, soundEnabled, combo, accentShadow, gainXP, pushNotif]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetSnippet = useCallback(() => {
    if (timerRef.current)    clearInterval(timerRef.current);
    if (autoWriteRef.current){ clearInterval(autoWriteRef.current); autoWriteRef.current = null; }
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    setInput(""); setFinished(false); setStartTime(null); setTimeElapsed(0);
    setWpm(0); setAccuracy(100); setIsError(false); setAutoWriting(false);
    setCombo(0); setHp(MAX_HP);
    prevLenRef.current = 0; errCountRef.current = 0;
    gsap.fromTo(terminalRef.current, { scale:0.984, opacity:0.5 }, { scale:1, opacity:1, duration:0.5, ease:"expo.out" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  // ── Bot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoWriteRef.current) { clearInterval(autoWriteRef.current); autoWriteRef.current = null; }
    if (autoWriting && !finished && snippet) {
      let idx = input.length;
      autoWriteRef.current = setInterval(() => {
        if (idx < snippet.code.length) { idx++; handleInput(snippet.code.slice(0, idx)); }
        else if (autoWriteRef.current) clearInterval(autoWriteRef.current);
      }, 45);
    }
    return () => { if (autoWriteRef.current) clearInterval(autoWriteRef.current); };
  }, [autoWriting, finished, snippet?.code, handleInput, input.length]);

  useEffect(() => { if (!mounted) return; resetSnippet(); }, [level, langFilter, mounted]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  // ── WPM ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (startTime && input.length > 0 && !finished) {
      const mins = (Date.now() - startTime) / 60000;
      setWpm(Math.round(input.length / 5 / mins) || 0);
    }
  }, [input.length, startTime, finished]);

  // ── Navigate ──────────────────────────────────────────────────────────────
  const navigate = useCallback((dir: 1|-1) => {
    gsap.to(".content-fade", {
      opacity:0, y:dir===1?-10:10, duration:0.2,
      onComplete:() => {
        setLevel(l => (l+dir+filteredPool.length)%filteredPool.length);
        gsap.to(".content-fade", { opacity:1, y:0, duration:0.3, ease:"expo.out" });
      },
    });
  }, [filteredPool.length]);

  // ── Key handler ───────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autoWriting || finished) return;
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const tab = "    ";
      handleInput(input.substring(0, selectionStart) + tab + input.substring(selectionEnd));
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
          textareaRef.current.selectionEnd = selectionStart + tab.length;
        }
      }, 0);
    }
  }, [autoWriting, finished, input, handleInput]);

  if (!mounted) return null;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-screen bg-[#030305] text-zinc-300 flex items-start justify-center p-6 lg:p-10 py-20 lg:py-28 overflow-x-hidden"
      style={{ fontFamily:"'JetBrains Mono', monospace" }}
    >
      {/* ── Hex grid background ── */}
      <HexGrid color={accentColor} />

      {/* ── Film grain ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.018]" style={{
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat:"repeat",
      }} />



      {/* ── Level up overlay ── */}
      {showLevelUp && (
        <LevelUpOverlay
          level={levelUpNum}
          color={accentColor}
          onDone={() => setShowLevelUp(false)}
        />
      )}

      {/* ── Completion screen — fullscreen fixed ── */}
      {finished && (
        <CompletionScreen
          wpm={wpm} accuracy={accuracy} time={timeElapsed}
          combo={maxCombo} rank={rank}
          onNext={() => navigate(1)}
        />
      )}

      {/* ── Notifications ── */}
      <NotifStack notifs={notifs} />

      {/* ══════════════════════════════════════════════════
          GAME HUD — BOTTOM BAR
      ══════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-stretch bg-black/95 backdrop-blur-3xl border border-white/[0.07] rounded-[1.75rem] shadow-2xl overflow-hidden"
        style={{ boxShadow:`0 0 40px -10px ${accentColor}30` }}>

        {/* Progress bar — top */}
        <div className="absolute top-0 left-0 right-0">
          <ProgressBar value={progress} color={accentColor} finished={finished} />
        </div>

        {/* WPM */}
        <div className="flex flex-col items-center justify-center border-r border-white/[0.06] px-6 py-4 min-w-[80px]">
          <span className="text-[7px] font-black uppercase tracking-[0.25em] opacity-25 mb-0.5" style={{ fontFamily:"'Orbitron',monospace" }}>WPM</span>
          <span
            className="text-[1.8rem] font-black tabular-nums leading-none"
            style={{ fontFamily:"'Orbitron',monospace", color: wpm>80?accentColor:"#fff", textShadow:wpm>80?`0 0 12px ${accentColor}`:"none" }}
          >{wpm}</span>
        </div>

        {/* ACC */}
        <div className="flex flex-col items-center justify-center border-r border-white/[0.06] px-6 py-4 min-w-[80px]">
          <span className="text-[7px] font-black uppercase tracking-[0.25em] opacity-25 mb-0.5" style={{ fontFamily:"'Orbitron',monospace" }}>ACC</span>
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-[1.8rem] font-black tabular-nums" style={{
              fontFamily:"'Orbitron',monospace",
              color: accuracy>=98?accentColor:accuracy>=90?"#facc15":"#f87171",
            }}>{accuracy}</span>
            <span className="text-[10px] opacity-40 font-bold">%</span>
          </div>
        </div>

        {/* TIME */}
        <div className="flex flex-col items-center justify-center border-r border-white/[0.06] px-6 py-4 min-w-[100px]">
          <span className="text-[7px] font-black uppercase tracking-[0.25em] opacity-25 mb-0.5" style={{ fontFamily:"'Orbitron',monospace" }}>TIME</span>
          <span className="text-[1.8rem] font-black tabular-nums leading-none text-white" style={{ fontFamily:"'Orbitron',monospace" }}>
            {fmtTime(timeElapsed)}
          </span>
        </div>

        {/* HP */}
        <div className="flex flex-col items-center justify-center border-r border-white/[0.06] px-5 py-4">
          <HPBar hp={hp} />
        </div>

        {/* XP / Level */}
        <div className="flex flex-col items-center justify-center border-r border-white/[0.06] px-5 py-4">
          <XPBar xp={xp} level={playerLevel} color={accentColor} />
        </div>

        {/* COMBO */}
        {combo >= 2 && (
          <div className="flex flex-col items-center justify-center border-r border-white/[0.06] px-5 py-4 min-w-[72px]">
            <ComboDisplay combo={combo} color="#a78bfa" />
          </div>
        )}

        {/* STREAK */}
        {streak >= 2 && (
          <div className="flex flex-col items-center justify-center border-r border-white/[0.06] px-5 py-4 min-w-[60px]">
            <span className="text-[7px] opacity-20 mb-0.5">🔥</span>
            <span className="text-[1.6rem] font-black tabular-nums leading-none" style={{ fontFamily:"'Orbitron',monospace", color:accentColor }}>
              {streak}
            </span>
          </div>
        )}

        {/* NAV */}
        <div className="flex items-center gap-2 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-xl transition-all active:scale-90">
            <VscChevronLeft size={15} />
          </button>
          <span className="text-[9px] font-black opacity-25 tabular-nums w-10 text-center" style={{ fontFamily:"'Orbitron',monospace" }}>
            {level+1}/{filteredPool.length}
          </span>
          <button onClick={() => navigate(1)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-xl transition-all active:scale-90">
            <VscChevronRight size={15} />
          </button>
        </div>

        {/* SOUND */}
        <button
          onClick={() => setSoundEnabled(v => !v)}
          className={`mx-3 my-auto px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${soundEnabled ? "border-current opacity-90" : "bg-white/5 border-white/[0.08] opacity-30 hover:opacity-60"}`}
          style={soundEnabled ? { borderColor:`${accentColor}60`, color:accentColor } : {}}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <div className="max-w-[1500px] w-full flex flex-col gap-14 h-full relative z-10">

        <Navbar
          accent={{ class:accentClass, bg:accentBg, shadow:accentShadow } as any}
          selectedAccent={selectedAccent}   setSelectedAccent={setSelectedAccent}
          langFilter={langFilter}           setLangFilter={setLangFilter}
          languages={languages}
          selectedFont={selectedFont}       setSelectedFont={setSelectedFont}
          fontSize={fontSize}               setFontSize={setFontSize}
          editorTheme={editorTheme}         setEditorTheme={setEditorTheme}
          isGhostActive={isGhostActive}     setIsGhostActive={setIsGhostActive}
          autoWriting={autoWriting}         setAutoWriting={setAutoWriting}
          autoPilot={autoPilot}             setAutoPilot={setAutoPilot}
          isZenMode={isZenMode}             setIsZenMode={setIsZenMode}
          isRecallMode={isRecallMode}       setIsRecallMode={setIsRecallMode}
          isBlindMode={false}               setIsBlindMode={() => {}}
        />

        {snippet && (
          <div className="content-fade grid grid-cols-1 items-start relative h-full mt-6">

            {/* ── Sidebar ── */}
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col gap-5 absolute left-0 top-0 z-0 ${
              isFocusMode || isZenMode ? "opacity-0 -translate-x-32 pointer-events-none" : "opacity-100 translate-x-0 w-[380px]"
            }`}>
              <div className="space-y-5 pr-8">
                {/* Header */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">{LANG_ICONS[snippet.lang]}</div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                  <span
                    className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border"
                    style={{ borderColor:`${snippet.level==="beginner"?"#4ade80":snippet.level==="intermediate"?"#facc15":"#f87171"}40`, color:snippet.level==="beginner"?"#4ade80":snippet.level==="intermediate"?"#facc15":"#f87171" }}
                  >
                    {snippet.level}
                  </span>
                  {/* XP reward preview */}
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-white/10 opacity-50">
                    +{snippet.code.length * 3} XP
                  </span>
                </div>

                <h1
                  className="text-3xl font-black text-white tracking-tighter leading-none uppercase"
                  style={{ fontFamily:"'Orbitron',monospace", textShadow:`0 0 20px ${accentColor}40` }}
                >
                  {snippet.title}
                </h1>

                <p className="italic text-zinc-400 text-sm border-l-2 pl-4 leading-relaxed" style={{ borderColor:`${accentColor}40` }}>
                  {snippet.description}
                </p>

                {snippet.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {snippet.tags.map(t => (
                      <span key={t} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 border border-white/10 opacity-60">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-zinc-500 text-xs leading-relaxed">{snippet.realLifeUsage}</p>

                {/* Stats mini */}
                <div className="flex gap-4 text-[9px] font-black uppercase opacity-25">
                  <span>{snippet.code.length} chars</span>
                  <span>·</span>
                  <span>{snippet.code.split("\n").length} lines</span>
                </div>
              </div>
            </div>

            {/* ── Editor ── */}
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] w-full ${
              isFocusMode || isZenMode ? "pl-0 max-w-[1100px] mx-auto" : "pl-[400px]"
            } space-y-6 relative z-10`}>

              <div className="relative">
                {/* Glow halo */}
                <div
                  className="absolute -inset-px rounded-[2.5rem] blur-2xl opacity-[0.08] transition-all duration-700"
                  style={{ background:accentColor }}
                />

                {/* Reset button */}
                <button
                  onClick={resetSnippet}
                  className={`absolute top-6 right-6 z-50 p-3 rounded-xl backdrop-blur-lg border border-white/10 hover:bg-white/10 active:scale-90 flex items-center gap-2 group/rst transition-all ${
                    isFocusMode || isZenMode ? "opacity-100 translate-y-0 bg-black/70" : "opacity-0 translate-y-3 pointer-events-none"
                  }`}
                >
                  <VscRefresh size={14} className="group-hover/rst:rotate-180 transition-transform duration-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest" style={{ fontFamily:"'Orbitron',monospace" }}>Reset</span>
                </button>

                {/* ── TERMINAL ── */}
                <div
                  ref={terminalRef}
                  className="relative bg-[#06060a] rounded-[2.5rem] border cursor-none overflow-hidden"
                  style={{ borderColor:`${accentColor}18`, perspective:"1200px" }}
                  onClick={() => textareaRef.current?.focus()}
                >
                  {/* Corner decorations */}
                  <div className="absolute top-5 left-5 w-6 h-6 border-l-2 border-t-2 rounded-tl-lg opacity-20" style={{ borderColor:accentColor }} />
                  <div className="absolute top-5 right-5 w-6 h-6 border-r-2 border-t-2 rounded-tr-lg opacity-20" style={{ borderColor:accentColor }} />
                  <div className="absolute bottom-5 left-5 w-6 h-6 border-l-2 border-b-2 rounded-bl-lg opacity-20" style={{ borderColor:accentColor }} />
                  <div className="absolute bottom-5 right-5 w-6 h-6 border-r-2 border-b-2 rounded-br-lg opacity-20" style={{ borderColor:accentColor }} />

                  {/* Scanlines */}
                  <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.02]" style={{
                    backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.08) 3px,rgba(255,255,255,0.08) 4px)",
                  }} />

                  <div className="p-12 lg:p-14">
                    {/* LAYER 0 — spacer */}
                    <div className="select-none pointer-events-none" style={{ ...MASTER_STYLE, visibility:"hidden" }} aria-hidden>
                      <SyntaxHighlighter language={snippet.lang} style={editorTheme.style}
                        customStyle={{ margin:0, padding:0, background:"transparent", overflow:"visible" }}
                        codeTagProps={{ style:MASTER_STYLE }}>
                        {snippet.code}
                      </SyntaxHighlighter>
                    </div>

                    {/* LAYER A — syntax colors for typed region */}
                    <div className="absolute inset-0 p-12 lg:p-14 select-none pointer-events-none z-[2]" aria-hidden>
                      <SyntaxHighlighter language={snippet.lang} style={editorTheme.style}
                        customStyle={{ margin:0, padding:0, background:"transparent", overflow:"visible" }}
                        codeTagProps={{ style:{ ...MASTER_STYLE, color:"inherit" } }}>
                        {input || " "}
                      </SyntaxHighlighter>
                    </div>

                    {/* LAYER B — split-flap mask */}
                    <div
                      className="absolute inset-0 p-12 lg:p-14 select-none pointer-events-none z-[3]"
                      style={{ ...MASTER_STYLE, whiteSpace:"pre-wrap" }}
                      aria-hidden
                    >
                      {charStates.map(({ char, state }, i) => {
                        if (char === "\n") {
                          return (
                            <span key={i}>
                              {state === "cursor" && (
                                <span className="relative inline-block" style={{ width:"0.6em" }}>
                                  <NeuralCursor bg={accentBg} glow={accentGlow} />
                                  <span style={{ color:"#ffffff", textShadow:`0 0 14px ${accentColor}` }}>↵</span>
                                </span>
                              )}
                              {"\n"}
                            </span>
                          );
                        }
                        if (state === "cursor") {
                          return (
                            <span key={i} className="relative" style={{ display:"inline", whiteSpace:"pre" }}>
                              <NeuralCursor bg={accentBg} glow={accentGlow} />
                              {/* The char AT the cursor — bright white + accent glow + underline */}
                              <span style={{
                                display:"inline", whiteSpace:"pre",
                                color: "#ffffff",
                                textShadow: `0 0 14px ${accentColor}, 0 0 6px ${accentColor}`,
                                borderBottom: `2px solid ${accentColor}`,
                                paddingBottom: "1px",
                              }}>
                                {char}
                              </span>
                            </span>
                          );
                        }
                        if (state === "next") {
                          // Just slightly less dim than normal untyped — no extra highlight
                          return (
                            <span key={i} className="sf-untyped" style={{ display:"inline", whiteSpace:"pre" }}>
                              {char}
                            </span>
                          );
                        }
                        if (state === "unlock") {
                          return <SplitFlapUnlock key={i} char={char} accentColor={accentColor} />;
                        }
                        if (state === "wrong") {
                          return (
                            <span key={i} className="sf-err" style={{ display:"inline", whiteSpace:"pre" }}>
                              {char}
                            </span>
                          );
                        }
                        // untyped
                        return (
                          <span key={i} className="sf-untyped" style={{ display:"inline", whiteSpace:"pre" }}>
                            {isGhostActive
                              ? <span style={{ color:`rgba(200,200,200,${Math.max(0.18, 0.62-(i-input.length)*0.012)})` }}>{char}</span>
                              : char
                            }
                          </span>
                        );
                      })}
                    </div>

                    {/* LAYER Z — hidden textarea */}
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={e => handleInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      spellCheck={false}
                      autoFocus
                      className={`absolute inset-0 w-full h-full opacity-0 z-30 resize-none bg-transparent ${finished?"cursor-default":"cursor-none"}`}
                      disabled={autoWriting || finished}
                      aria-label="Type the code snippet here"
                    />
                  </div>
                </div>
              </div>

              {/* ── Output row ── */}
              <div className={`transition-all duration-700 flex items-center gap-4 ${
                finished ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
              }`}>
                <div className="flex-1 bg-[#08080d] border border-white/[0.07] rounded-2xl p-6">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-2" style={{ fontFamily:"'Orbitron',monospace" }}>
                    OUTPUT_STREAM
                  </p>
                  <pre className="font-mono text-sm text-zinc-400 italic">{snippet.output}</pre>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={resetSnippet}
                    className="group flex flex-col items-center gap-1 p-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-all active:scale-95"
                  >
                    <VscRefresh size={18} className="group-hover:rotate-180 transition-transform duration-500 text-white" />
                    <span className="text-[7px] font-black uppercase opacity-40" style={{ fontFamily:"'Orbitron',monospace" }}>RETRY</span>
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    className="group flex flex-col items-center gap-1 p-5 border rounded-2xl hover:opacity-80 transition-all active:scale-95"
                    style={{ borderColor:`${accentColor}40`, background:`${accentColor}10`, color:accentColor }}
                  >
                    <VscChevronRight size={18} />
                    <span className="text-[7px] font-black uppercase" style={{ fontFamily:"'Orbitron',monospace" }}>NEXT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}