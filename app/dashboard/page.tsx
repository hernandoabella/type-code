"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { usePlayer } from "@/hooks/usePlayer";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  id: string;
  snippet_id: string;
  wpm: number;
  accuracy: number;
  time_elapsed: number;
  combo: number;
  rank: string;
  completed_at: string;
}

interface LeaderboardEntry {
  id: string;
  username: string | null;
  avatar_url: string | null;
  xp: number;
  player_level: number;
  total_completed: number;
  best_wpm: number;
  max_combo: number;
  streak: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const xpForLevel = (lvl: number) => Math.floor(200 * Math.pow(1.55, lvl - 1));

const RANK_META: Record<string, { color: string; glow: string; label: string; dim: string }> = {
  S: { color: "#facc15", glow: "rgba(250,204,21,0.4)",  label: "PERFECT", dim: "rgba(250,204,21,0.08)"  },
  A: { color: "#60a5fa", glow: "rgba(96,165,250,0.4)",  label: "ELITE",   dim: "rgba(96,165,250,0.08)"  },
  B: { color: "#4ade80", glow: "rgba(74,222,128,0.4)",  label: "SENIOR",  dim: "rgba(74,222,128,0.08)"  },
  C: { color: "#a78bfa", glow: "rgba(167,139,250,0.4)", label: "MID",     dim: "rgba(167,139,250,0.08)" },
  D: { color: "#f87171", glow: "rgba(248,113,113,0.4)", label: "NOOB",    dim: "rgba(248,113,113,0.08)" },
};

const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
};
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const DASH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Orbitron:wght@400;700;900&display=swap');

  @keyframes dash-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dash-hex-pulse {
    0%, 100% { opacity: 0.012; }
    50%       { opacity: 0.032; }
  }
  @keyframes dash-scan {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }
  @keyframes dash-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes dash-ring-spin {
    from { stroke-dashoffset: 220; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes dash-shimmer {
    from { background-position: -200% center; }
    to   { background-position: 200% center; }
  }
  @keyframes dash-bar-fill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  .d-fade  { animation: dash-fade-up 0.5s ease-out both; }
  .d-hex   { animation: dash-hex-pulse 3s ease-in-out infinite; }
  .d-scan  { animation: dash-scan 9s linear infinite; }
  .d-blink { animation: dash-blink 1.1s step-end infinite; }
  .d-fill  { animation: dash-bar-fill 0.9s cubic-bezier(0.22,1,0.36,1) both; transform-origin: left; }
  .d-shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
    background-size: 200% auto;
    animation: dash-shimmer 2.8s linear infinite;
  }

  .stat-card { transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s; cursor: default; }
  .stat-card:hover { transform: translateY(-2px); }
  .tab-btn   { transition: all 0.2s ease; }
  .row-hover { transition: background 0.15s, border-color 0.15s; }
  .row-hover:hover { background: rgba(255,255,255,0.03) !important; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
`;

// ─── Animated counter ──────────────────────────────────────────────────────
function Odometer({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [disp, setDisp] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = disp;
    const dur = 900;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setDisp(Math.round(from + (value - from) * ease));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{disp.toLocaleString()}{suffix}</>;
}

// ─── Mini sparkline ───────────────────────────────────────────────────────
function Spark({ data, color, w = 80, h = 28 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (data.length < 2) return <div style={{ width: w, height: h }} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 2) - 1}`
  ).join(" ");
  const area = `${pts} ${w},${h} 0,${h}`;
  const uid = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible flex-shrink-0">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${uid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
}

// ─── Radial gauge ────────────────────────────────────────────────────────
function RadialGauge({ value, max, color, label, size = 76 }: {
  value: number; max: number; color: string; label: string; size?: number;
}) {
  const pct = Math.min(value / max, 1);
  const r = size / 2 - 7;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
            strokeDashoffset={0}
            style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black tabular-nums" style={{ fontFamily: "'Orbitron',monospace", color }}>
            {Math.round(pct * 100)}
          </span>
        </div>
      </div>
      <span className="text-[6px] font-black uppercase tracking-[0.2em] opacity-25" style={{ fontFamily: "'Orbitron',monospace" }}>{label}</span>
    </div>
  );
}

// ─── WPM Bar Chart ────────────────────────────────────────────────────────
function WPMChart({ sessions, accent }: { sessions: Session[]; accent: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const last25 = useMemo(() => [...sessions].slice(0, 25).reverse(), [sessions]);

  if (!last25.length) return (
    <div className="flex items-center justify-center h-28 opacity-10">
      <span className="text-[8px] font-mono tracking-[0.3em]">NO DATA YET</span>
    </div>
  );

  const maxV = Math.max(...last25.map(s => s.wpm), 1);
  const avg  = Math.round(last25.reduce((a, s) => a + s.wpm, 0) / last25.length);
  const recentAvg = last25.length > 5 ? last25.slice(-5).reduce((a,s)=>a+s.wpm,0)/5 : avg;
  const oldAvg    = last25.length > 5 ? last25.slice(0, 5).reduce((a,s)=>a+s.wpm,0)/5 : avg;
  const trend     = Math.round(recentAvg - oldAvg);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-[6px] font-black uppercase tracking-[0.35em] opacity-20 mb-1" style={{ fontFamily: "'Orbitron',monospace" }}>AVG WPM</p>
            <p className="text-4xl font-black tabular-nums leading-none" style={{ fontFamily: "'Orbitron',monospace", color: accent, textShadow: `0 0 18px ${accent}80` }}>
              {avg}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 pb-1 text-[9px] font-black ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`} style={{ fontFamily: "'Orbitron',monospace" }}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} vs prev
          </div>
        </div>
        <span className="text-[7px] opacity-15 font-mono">last {last25.length} sessions</span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-[3px] h-24">
        {last25.map((s, i) => {
          const pct = (s.wpm / maxV) * 100;
          const rm = RANK_META[s.rank] ?? RANK_META.D;
          const isH = hovered === i;
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center relative cursor-default"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              {isH && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <div className="px-3 py-2 rounded-xl text-[7px] font-black whitespace-nowrap flex flex-col gap-0.5"
                    style={{ background: "#0c0c14", border: `1px solid ${rm.color}30`, boxShadow: `0 4px 20px ${rm.color}20` }}>
                    <span style={{ color: rm.color, fontFamily: "'Orbitron',monospace" }}>{s.rank} · {s.wpm} WPM</span>
                    <span className="opacity-40 font-mono">{s.accuracy}% · {fmtRelative(s.completed_at)}</span>
                  </div>
                </div>
              )}
              <div className="w-full rounded-t-[3px] transition-all duration-100"
                style={{
                  height: `${Math.max(pct, 3)}%`,
                  background: isH ? rm.color : `${rm.color}70`,
                  boxShadow: isH ? `0 0 10px ${rm.color}` : "none",
                }} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[6px] font-mono opacity-15">
        <span>oldest</span><span>latest →</span>
      </div>
    </div>
  );
}

// ─── Accuracy timeline bars ───────────────────────────────────────────────
function AccuracyTimeline({ sessions }: { sessions: Session[] }) {
  const last30 = useMemo(() => [...sessions].slice(0, 30).reverse(), [sessions]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-[3px]">
        {last30.map((s, i) => {
          const a = s.accuracy;
          const c = a >= 98 ? "#4ade80" : a >= 90 ? "#facc15" : a >= 75 ? "#f97316" : "#f87171";
          const opacity = 0.3 + (a / 100) * 0.7;
          return (
            <div key={s.id} title={`${a}% · ${fmtRelative(s.completed_at)}`}
              className="flex-1 rounded-sm transition-all hover:scale-y-110 cursor-default"
              style={{ height: "11px", background: c, opacity, transformOrigin: "bottom" }} />
          );
        })}
      </div>
      <div className="flex justify-between text-[6px] font-mono opacity-15">
        <span>30 back</span><span>latest</span>
      </div>
    </div>
  );
}

// ─── Rank donut ───────────────────────────────────────────────────────────
function RankDonut({ sessions }: { sessions: Session[] }) {
  const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  sessions.forEach(s => { if (s.rank in counts) counts[s.rank]++; });
  const total = sessions.length || 1;
  const entries = Object.entries(counts);

  const r = 32, circ = 2 * Math.PI * r, gap = 3;
  let cumPct = 0;
  const segments = entries
    .filter(([, c]) => c > 0)
    .map(([rank, count]) => {
      const pct = count / total;
      const dashLen = circ * pct - gap;
      const offset = circ * (1 - cumPct);
      cumPct += pct;
      return { rank, count, pct, dashLen, offset };
    });

  const topRank = entries.reduce((a, b) => (b[1] > a[1] ? b : a), ["D", 0])[0];

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: 82, height: 82 }}>
        <svg width="82" height="82" viewBox="0 0 82 82" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="41" cy="41" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          {segments.map(({ rank, dashLen, offset }) => {
            const rm = RANK_META[rank];
            return (
              <circle key={rank} cx="41" cy="41" r={r} fill="none"
                stroke={rm.color} strokeWidth="8" strokeLinecap="butt"
                strokeDasharray={`${Math.max(dashLen, 0)} ${circ}`}
                strokeDashoffset={-offset + circ}
                style={{ filter: `drop-shadow(0 0 3px ${rm.color}80)` }} />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black" style={{ fontFamily: "'Orbitron',monospace", color: RANK_META[topRank].color }}>{topRank}</span>
          <span className="text-[5px] opacity-25 uppercase tracking-wider" style={{ fontFamily: "'Orbitron',monospace" }}>top</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {entries.map(([rank, count]) => {
          const rm = RANK_META[rank];
          const pct = Math.round((count / total) * 100);
          return (
            <div key={rank} className="flex items-center gap-2">
              <span className="text-[8px] font-black w-3" style={{ color: rm.color, fontFamily: "'Orbitron',monospace" }}>{rank}</span>
              <div className="flex-1 h-[3px] rounded-full bg-white/[0.04]">
                <div className="d-fill h-full rounded-full" style={{ width: `${pct}%`, background: rm.color, boxShadow: count > 0 ? `0 0 5px ${rm.color}` : "none" }} />
              </div>
              <span className="text-[7px] opacity-25 font-mono w-5 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Session row ──────────────────────────────────────────────────────────
function SessionRow({ s, i, accent }: { s: Session; i: number; accent: string }) {
  const rm = RANK_META[s.rank] ?? RANK_META.D;
  return (
    <div className="row-hover d-fade flex items-center gap-4 px-4 py-3 rounded-2xl border border-transparent"
      style={{ animationDelay: `${Math.min(i * 0.04, 0.5)}s`, background: "rgba(255,255,255,0.015)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-black"
        style={{ background: rm.dim, border: `1px solid ${rm.color}22`, color: rm.color, fontFamily: "'Orbitron',monospace", textShadow: `0 0 6px ${rm.color}` }}>
        {s.rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest truncate opacity-45" style={{ fontFamily: "'Orbitron',monospace" }}>{s.snippet_id}</p>
        <p className="text-[7px] font-mono opacity-15 mt-0.5">{fmtRelative(s.completed_at)}</p>
      </div>
      <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
        {[
          { l: "WPM",   v: s.wpm,              c: s.wpm > 80 ? "#4ade80" : "rgba(255,255,255,0.55)" },
          { l: "ACC",   v: `${s.accuracy}%`,   c: s.accuracy >= 95 ? "#4ade80" : s.accuracy >= 80 ? "#facc15" : "#f87171" },
          { l: "COMBO", v: `${s.combo}x`,      c: "#a78bfa" },
          { l: "TIME",  v: fmtTime(s.time_elapsed), c: "rgba(255,255,255,0.3)" },
        ].map(({ l, v, c }) => (
          <div key={l} className="text-center">
            <p className="text-[5px] opacity-18 uppercase tracking-widest" style={{ fontFamily: "'Orbitron',monospace" }}>{l}</p>
            <p className="text-[13px] font-black tabular-nums" style={{ fontFamily: "'Orbitron',monospace", color: c }}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────
function LeaderRow({ e, i, uid, accent }: { e: LeaderboardEntry; i: number; uid?: string; accent: string }) {
  const isMe = e.id === uid;
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className="row-hover d-fade flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
      style={{
        animationDelay: `${Math.min(i * 0.04, 0.5)}s`,
        background: isMe ? `${accent}06` : "rgba(255,255,255,0.015)",
        borderColor: isMe ? `${accent}22` : "transparent",
        boxShadow: isMe ? `0 0 20px -10px ${accent}40` : "none",
      }}>
      <span className="w-7 text-center flex-shrink-0 text-sm">
        {i < 3 ? medals[i] :
          <span className="text-[9px] font-black opacity-20 tabular-nums" style={{ fontFamily: "'Orbitron',monospace" }}>{i + 1}</span>}
      </span>
      {e.avatar_url
        ? <img src={e.avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ border: `2px solid ${isMe ? accent : "rgba(255,255,255,0.07)"}` }} />
        : <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black"
            style={{ background: `${accent}20`, color: accent }}>
            {(e.username ?? "?")[0].toUpperCase()}
          </div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black truncate" style={{ color: isMe ? accent : "rgba(255,255,255,0.6)", fontFamily: "'Orbitron',monospace" }}>
          {e.username ?? "anonymous"}
          {isMe && <span className="opacity-35 text-[7px] ml-1.5">· you</span>}
        </p>
        <p className="text-[7px] opacity-18 font-mono">LVL {e.player_level} · {e.total_completed} sessions</p>
      </div>
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="text-right">
          <p className="text-[14px] font-black tabular-nums" style={{ fontFamily: "'Orbitron',monospace", color: isMe ? accent : "rgba(255,255,255,0.45)" }}>{(e.xp ?? 0).toLocaleString()}</p>
          <p className="text-[5px] opacity-18 uppercase tracking-widest" style={{ fontFamily: "'Orbitron',monospace" }}>XP</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[13px] font-black tabular-nums text-white/25" style={{ fontFamily: "'Orbitron',monospace" }}>{e.best_wpm}</p>
          <p className="text-[5px] opacity-18 uppercase tracking-widest" style={{ fontFamily: "'Orbitron',monospace" }}>WPM</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [accentColor, setAccentColor] = useState("#63cab7");
  useEffect(() => {
    const a = localStorage.getItem("ns_accent_color");
    if (a) setAccentColor(a);
  }, []);

  const { user, username, avatarUrl, xp, playerLevel, streak, totalCompleted, maxCombo, bestWpm, isLoading } = usePlayer();
  const [sessions,    setSessions]    = useState<Session[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tab,         setTab]         = useState<"overview" | "history" | "leaderboard">("overview");
  const [dataLoading, setDataLoading] = useState(true);
  const [clock,       setClock]       = useState("");
  const supabase = createClient();

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user || isLoading) return;
    (async () => {
      setDataLoading(true);
      const [{ data: sess }, { data: lb }] = await Promise.all([
        supabase.from("sessions").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(100),
        supabase.from("leaderboard").select("*").limit(50),
      ]);
      setSessions((sess as Session[]) ?? []);
      setLeaderboard((lb as LeaderboardEntry[]) ?? []);
      setDataLoading(false);
    })();
  }, [user, isLoading]);

  // Computed stats
  const wpmHistory  = useMemo(() => [...sessions].slice(0, 20).reverse().map(s => s.wpm), [sessions]);
  const accHistory  = useMemo(() => [...sessions].slice(0, 20).reverse().map(s => s.accuracy), [sessions]);
  const avgWpm      = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length) : 0;
  const avgAcc      = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length) : 0;
  const bestSession = useMemo(() => sessions.reduce((b, s) => s.wpm > (b?.wpm ?? 0) ? s : b, sessions[0]), [sessions]);
  const myLbRank    = leaderboard.findIndex(e => e.id === user?.id) + 1;

  let xpSpent = 0;
  for (let l = 1; l < playerLevel; l++) xpSpent += xpForLevel(l);
  const xpNeeded  = xpForLevel(playerLevel);
  const xpInLevel = xp - xpSpent;
  const xpPct     = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center">
      <style>{DASH_CSS}</style>
      <div className="flex flex-col items-center gap-5">
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle cx="22" cy="22" r="16" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round"
            strokeDasharray="28 72" style={{ animation: "dash-ring-spin 1.1s linear infinite", filter: `drop-shadow(0 0 5px ${accentColor})` }} />
        </svg>
        <span className="text-[8px] font-black uppercase tracking-[0.45em] opacity-20" style={{ fontFamily: "'Orbitron',monospace" }}>Initializing</span>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center gap-8">
      <style>{DASH_CSS}</style>
      <div className="text-center flex flex-col items-center gap-3">
        <span className="text-5xl opacity-10" style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900 }}>⬡</span>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-25" style={{ fontFamily: "'Orbitron',monospace" }}>Authentication required</p>
      </div>
      <Link href="/" className="px-7 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-80 active:scale-95"
        style={{ borderColor: `${accentColor}35`, background: `${accentColor}09`, color: accentColor, fontFamily: "'Orbitron',monospace" }}>
        Return to base
      </Link>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#030305] text-zinc-300 overflow-x-hidden"
      style={{ fontFamily: "'JetBrains Mono',monospace" }}>
      <style>{DASH_CSS}</style>

      {/* Hex background */}
      <div className="d-hex fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V17L28 1l28 16v33z' fill='none' stroke='${encodeURIComponent(accentColor)}' stroke-width='0.4'/%3E%3Cpath d='M28 100L0 84V51l28-17 28 17v33z' fill='none' stroke='${encodeURIComponent(accentColor)}' stroke-width='0.4'/%3E%3C/svg%3E")`, backgroundSize: "56px 100px" }} />

      {/* Top bloom */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse 100% 45% at 50% 0%, ${accentColor}07 0%, transparent 55%)` }} />

      {/* Scanline */}
      <div className="d-scan fixed left-0 right-0 h-[1px] pointer-events-none z-0 opacity-[0.02]"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.012]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#030305]/88 backdrop-blur-3xl">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all group">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-40 group-hover:opacity-70 transition-opacity">
                <path d="M7 2L3 6l4 4"/>
              </svg>
              <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-40 transition-opacity" style={{ fontFamily: "'Orbitron',monospace" }}>Back</span>
            </Link>
            <div className="h-4 w-px bg-white/[0.07]" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.12em]" style={{ fontFamily: "'Orbitron',monospace", color: accentColor }}>Neural</span>
              <span className="text-[11px] font-black uppercase tracking-[0.12em] text-white" style={{ fontFamily: "'Orbitron',monospace" }}>Sync</span>
              <div className="d-blink w-1.5 h-1.5 rounded-full ml-0.5" style={{ background: accentColor, boxShadow: `0 0 5px ${accentColor}` }} />
            </div>
            <span className="hidden sm:block text-[7px] font-black uppercase tracking-[0.25em] opacity-15" style={{ fontFamily: "'Orbitron',monospace" }}>/ WAR ROOM</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-[8px] tabular-nums opacity-18 font-mono">{clock}</span>
            <div className="h-4 w-px bg-white/[0.07] hidden md:block" />
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border"
              style={{ borderColor: `${accentColor}15`, background: `${accentColor}06` }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full" style={{ border: `1.5px solid ${accentColor}45` }} />
                : <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: `${accentColor}22`, color: accentColor }}>
                    {(username ?? "?")[0].toUpperCase()}
                  </div>}
              <div className="flex flex-col">
                <span className="text-[8px] font-black leading-none" style={{ color: accentColor, fontFamily: "'Orbitron',monospace" }}>{username ?? "player"}</span>
                <span className="text-[6px] opacity-22 uppercase tracking-widest" style={{ fontFamily: "'Orbitron',monospace" }}>LVL {playerLevel}</span>
              </div>
              {myLbRank > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[6px] font-black" style={{ background: `${accentColor}14`, color: accentColor, fontFamily: "'Orbitron',monospace" }}>
                  #{myLbRank}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8 relative z-10">

        {/* ═══ HERO STAT STRIP ══════════════════════════════════════ */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {([
            { l: "TOTAL XP",  v: xp,            c: accentColor, delay: "0s"    },
            { l: "LEVEL",     v: playerLevel,    c: "#facc15",   delay: "0.06s" },
            { l: "SESSIONS",  v: totalCompleted, c: "#60a5fa",   delay: "0.12s" },
            { l: "BEST WPM",  v: bestWpm,        c: "#4ade80",   delay: "0.18s" },
            { l: "MAX COMBO", v: maxCombo,       c: "#a78bfa",   delay: "0.24s" },
            { l: "STREAK",    v: streak,         c: "#f97316",   delay: "0.30s" },
          ] as const).map(({ l, v, c, delay }) => (
            <div key={l} className="stat-card d-fade flex flex-col gap-1.5 p-4 rounded-2xl border relative overflow-hidden"
              style={{ borderColor: `${c}16`, background: `${c}05`, animationDelay: delay }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${c}32`; e.currentTarget.style.boxShadow = `0 0 18px -8px ${c}45`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${c}16`; e.currentTarget.style.boxShadow = "none"; }}>
              <div className="d-shimmer absolute inset-0 pointer-events-none" />
              <span className="text-[6px] font-black uppercase tracking-[0.22em] opacity-22 relative z-10" style={{ fontFamily: "'Orbitron',monospace" }}>{l}</span>
              <span className="text-2xl font-black tabular-nums leading-none relative z-10"
                style={{ fontFamily: "'Orbitron',monospace", color: c, textShadow: `0 0 12px ${c}55` }}>
                <Odometer value={v} />
              </span>
            </div>
          ))}
        </div>

        {/* XP bar */}
        <div className="d-fade mb-5 px-5 py-3.5 rounded-2xl border flex items-center gap-4"
          style={{ borderColor: `${accentColor}12`, background: `${accentColor}04`, animationDelay: "0.36s" }}>
          <div className="flex-shrink-0 min-w-[160px]">
            <p className="text-[6px] uppercase tracking-[0.3em] opacity-20 mb-1" style={{ fontFamily: "'Orbitron',monospace" }}>
              LVL {playerLevel} → {playerLevel + 1}
            </p>
            <p className="text-[10px] font-black tabular-nums" style={{ color: accentColor, fontFamily: "'Orbitron',monospace" }}>
              {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
            </p>
          </div>
          <div className="flex-1 h-[4px] bg-white/[0.04] rounded-full overflow-hidden">
            <div className="d-fill h-full rounded-full" style={{
              width: `${xpPct}%`,
              background: `linear-gradient(90deg, ${accentColor}65, ${accentColor})`,
              boxShadow: `0 0 8px ${accentColor}55`,
            }} />
          </div>
          <span className="text-[8px] font-black tabular-nums opacity-35 flex-shrink-0" style={{ fontFamily: "'Orbitron',monospace" }}>{xpPct}%</span>
        </div>

        {/* ═══ TAB BAR ════════════════════════════════════════════ */}
        <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit"
          style={{ background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.045)" }}>
          {([
            { id: "overview",    label: "Overview"    },
            { id: "history",     label: "History"     },
            { id: "leaderboard", label: "Leaderboard" },
          ] as const).map(({ id, label }) => (
            <button key={id} className="tab-btn px-5 py-2 rounded-lg text-[7px] font-black uppercase tracking-[0.22em]"
              style={{
                fontFamily: "'Orbitron',monospace",
                background: tab === id ? `${accentColor}14` : "transparent",
                color:      tab === id ? accentColor : "rgba(255,255,255,0.18)",
                border:     tab === id ? `1px solid ${accentColor}22` : "1px solid transparent",
                boxShadow:  tab === id ? `0 0 12px -4px ${accentColor}30` : "none",
              }}
              onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW ═══════════════════════════════════════════ */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

            {/* WPM Chart — 2 cols */}
            <div className="d-fade xl:col-span-2 p-6 rounded-2xl border"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.018)" }}>
              <SectionHead color={accentColor} title="WPM Progression" />
              {dataLoading
                ? <Loader />
                : <WPMChart sessions={sessions} accent={accentColor} />}
            </div>

            {/* Rank donut */}
            <div className="d-fade p-6 rounded-2xl border"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.018)", animationDelay: "0.08s" }}>
              <SectionHead color="#a78bfa" title="Rank Distribution" />
              {dataLoading ? <Loader /> : sessions.length ? <RankDonut sessions={sessions} /> : <Empty />}
            </div>

            {/* Performance sparklines */}
            <div className="d-fade p-6 rounded-2xl border"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.018)", animationDelay: "0.12s" }}>
              <SectionHead color="#4ade80" title="Performance" />
              <div className="space-y-6 mt-1">
                {[
                  { label: "AVG WPM",      val: `${avgWpm}`,  spark: wpmHistory, color: accentColor },
                  { label: "AVG ACCURACY", val: `${avgAcc}%`, spark: accHistory, color: "#4ade80"   },
                ].map(({ label, val, spark, color }) => (
                  <div key={label} className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[5px] opacity-18 uppercase tracking-widest mb-1.5" style={{ fontFamily: "'Orbitron',monospace" }}>{label}</p>
                      <p className="text-3xl font-black tabular-nums leading-none"
                        style={{ fontFamily: "'Orbitron',monospace", color, textShadow: `0 0 12px ${color}55` }}>
                        {val}
                      </p>
                    </div>
                    <Spark data={spark} color={color} w={88} h={34} />
                  </div>
                ))}
              </div>
            </div>

            {/* Accuracy timeline */}
            <div className="d-fade p-6 rounded-2xl border"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.018)", animationDelay: "0.16s" }}>
              <SectionHead color="#facc15" title="Accuracy Timeline" />
              {sessions.length ? <AccuracyTimeline sessions={sessions} /> : <Empty />}
              <div className="flex gap-3 mt-4 flex-wrap">
                {[["≥98%","#4ade80"],["≥90%","#facc15"],["≥75%","#f97316"],["<75%","#f87171"]].map(([l,c]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                    <span className="text-[6px] opacity-25 font-mono">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radial gauges */}
            <div className="d-fade p-6 rounded-2xl border"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.018)", animationDelay: "0.20s" }}>
              <SectionHead color="#60a5fa" title="Rating Gauges" />
              <div className="flex justify-around mt-2">
                <RadialGauge value={avgWpm}   max={150} color={accentColor} label="WPM"   />
                <RadialGauge value={avgAcc}   max={100} color="#4ade80"     label="ACC"   />
                <RadialGauge value={maxCombo} max={50}  color="#a78bfa"     label="COMBO" />
              </div>
            </div>

            {/* Best session — full width */}
            {bestSession && (
              <div className="d-fade xl:col-span-3 p-6 rounded-2xl border"
                style={{
                  borderColor: `${RANK_META[bestSession.rank]?.color ?? accentColor}18`,
                  background: `${RANK_META[bestSession.rank]?.color ?? accentColor}05`,
                  animationDelay: "0.24s",
                }}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-5 rounded-full flex-shrink-0"
                    style={{ background: RANK_META[bestSession.rank]?.color ?? accentColor, boxShadow: `0 0 7px ${RANK_META[bestSession.rank]?.color ?? accentColor}` }} />
                  <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-35" style={{ fontFamily: "'Orbitron',monospace" }}>Personal Best Session</span>
                  <span className="ml-auto text-[6px] font-mono opacity-15">{fmtDate(bestSession.completed_at)}</span>
                </div>
                <div className="flex items-center gap-10 flex-wrap">
                  {[
                    { l: "WPM",   v: `${bestSession.wpm}`,             c: "#4ade80" },
                    { l: "ACC",   v: `${bestSession.accuracy}%`,       c: RANK_META[bestSession.rank]?.color ?? accentColor },
                    { l: "COMBO", v: `${bestSession.combo}x`,          c: "#a78bfa" },
                    { l: "TIME",  v: fmtTime(bestSession.time_elapsed), c: "rgba(255,255,255,0.45)" },
                    { l: "RANK",  v: bestSession.rank,                  c: RANK_META[bestSession.rank]?.color ?? accentColor },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="flex flex-col gap-1">
                      <span className="text-[5px] opacity-18 uppercase tracking-widest" style={{ fontFamily: "'Orbitron',monospace" }}>{l}</span>
                      <span className="text-3xl font-black tabular-nums"
                        style={{ fontFamily: "'Orbitron',monospace", color: c, textShadow: `0 0 12px ${c}55` }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ HISTORY ════════════════════════════════════════════ */}
        {tab === "history" && (
          <div>
            <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-18 mb-4" style={{ fontFamily: "'Orbitron',monospace" }}>
              {sessions.length} sessions recorded
            </p>
            {dataLoading ? <Loader h={40} /> : sessions.length
              ? <div className="flex flex-col gap-1.5">{sessions.map((s, i) => <SessionRow key={s.id} s={s} i={i} accent={accentColor} />)}</div>
              : <Empty text="No sessions yet — start typing!" />}
          </div>
        )}

        {/* ═══ LEADERBOARD ════════════════════════════════════════ */}
        {tab === "leaderboard" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-18" style={{ fontFamily: "'Orbitron',monospace" }}>
                Top {leaderboard.length} players
              </p>
              {myLbRank > 0 && (
                <span className="text-[7px] font-black uppercase tracking-[0.2em]" style={{ color: accentColor, fontFamily: "'Orbitron',monospace" }}>
                  Your rank · #{myLbRank}
                </span>
              )}
            </div>
            {dataLoading ? <Loader h={40} /> : leaderboard.length
              ? <div className="flex flex-col gap-1.5">{leaderboard.map((e, i) => <LeaderRow key={e.id} e={e} i={i} uid={user?.id} accent={accentColor} />)}</div>
              : <Empty text="Be the first on the board!" />}
          </div>
        )}

      </main>
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────
function SectionHead({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-35" style={{ fontFamily: "'Orbitron',monospace" }}>{title}</span>
    </div>
  );
}
function Loader({ h = 28 }: { h?: number }) {
  return (
    <div className={`flex items-center justify-center h-${h} opacity-12`}>
      <span className="text-[7px] font-mono tracking-[0.35em]">LOADING DATA...</span>
    </div>
  );
}
function Empty({ text = "No data yet" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 opacity-15">
      <span className="text-3xl font-black" style={{ fontFamily: "'Orbitron',monospace" }}>⬡</span>
      <p className="text-[7px] font-black uppercase tracking-[0.3em]" style={{ fontFamily: "'Orbitron',monospace" }}>{text}</p>
    </div>
  );
}