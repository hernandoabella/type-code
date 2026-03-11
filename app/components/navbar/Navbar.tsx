"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VscTarget, VscRefresh, VscClose, VscChevronDown, VscSignOut, VscAccount } from "react-icons/vsc";
import Logo from "./Logo";
import Selectors from "./Selectors";
import FontSize from "./FontSize";
import ModesMenu from "./ModesMenu";
import { ACCENTS } from "../../config/constants";
import { createClient } from "@/lib/supabase";
import { usePlayer } from "@/hooks/usePlayer";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const NAV_CSS = `
  @keyframes dropdown-in {
    from { opacity:0; transform:translateY(-6px) scale(0.97); filter:blur(3px); }
    to   { opacity:1; transform:translateY(0)    scale(1);    filter:blur(0);   }
  }
  @keyframes zen-hint {
    0%,100% { opacity:0; transform:translateY(-4px); }
    20%,80% { opacity:1; transform:translateY(0); }
  }
  @keyframes ripple-out {
    from { transform:scale(0);   opacity:0.55; }
    to   { transform:scale(3.8); opacity:0;    }
  }
  @keyframes swatch-pop {
    from { transform:scale(0.6) rotate(-6deg); opacity:0; }
    to   { transform:scale(1)   rotate(0deg);  opacity:1; }
  }

  .dd-in      { animation:dropdown-in 0.22s cubic-bezier(0.22,1,0.36,1) forwards; }
  .zen-hint   { animation:zen-hint 2.5s ease-in-out 1.5s both; }
  .swatch-pop { animation:swatch-pop 0.18s cubic-bezier(0.22,1,0.36,1) both; }

  .nav-seg { position:relative; display:flex; align-items:center; height:100%; }
  .nav-seg + .nav-seg::before {
    content:''; position:absolute; left:0; top:18%; height:64%;
    width:1px; background:rgba(255,255,255,0.07);
  }

  .nav-btn {
    position:relative; display:flex; align-items:center; justify-content:center;
    border-radius:10px; overflow:hidden;
    transition:background 0.15s, color 0.15s, transform 0.1s;
    cursor:pointer; color:rgba(255,255,255,0.3);
  }
  .nav-btn:hover  { color:rgba(255,255,255,0.85); background:rgba(255,255,255,0.06); }
  .nav-btn:active { transform:scale(0.9); }

  .ripple {
    position:absolute; border-radius:50%; pointer-events:none;
    animation:ripple-out 0.5s ease-out forwards;
  }

  .zen-fab {
    position:fixed; bottom:96px; right:24px; z-index:90;
    display:flex; align-items:center; gap:8px; padding:10px 16px;
    border-radius:16px; border:1px solid rgba(255,255,255,0.1);
    background:rgba(6,6,10,0.92); backdrop-filter:blur(20px);
    cursor:pointer; transition:all 0.2s;
    font-family:'Orbitron',monospace; font-size:8px; font-weight:900;
    letter-spacing:0.25em; text-transform:uppercase; color:rgba(255,255,255,0.35);
  }
  .zen-fab:hover  { color:rgba(255,255,255,0.8); border-color:rgba(255,255,255,0.2); }
  .zen-fab:active { transform:scale(0.95); }

  .seg-label {
    font-size:6px; font-weight:900; text-transform:uppercase;
    letter-spacing:0.3em; opacity:0.18; margin-bottom:2px;
    display:block; line-height:1; user-select:none;
    font-family:'Orbitron',monospace;
  }
`;

// ─── Ripple ───────────────────────────────────────────────────────────────────
function useRipple(color = "rgba(255,255,255,0.25)") {
  return useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement("span");
    span.className = "ripple";
    span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;background:${color};`;
    el.appendChild(span);
    setTimeout(() => span.remove(), 520);
  }, [color]);
}

// ─── Zen hint ─────────────────────────────────────────────────────────────────
function ZenHint({ accentColor }: { accentColor: string }) {
  return (
    <div className="zen-hint fixed top-6 left-1/2 -translate-x-1/2 z-[199] pointer-events-none flex items-center gap-2 px-4 py-2 rounded-full"
      style={{ background:"rgba(6,6,10,0.85)", border:`1px solid ${accentColor}22`, backdropFilter:"blur(12px)" }}>
      <kbd className="text-[8px] font-black px-1.5 py-0.5 rounded-md"
        style={{ background:`${accentColor}18`, color:accentColor, fontFamily:"'Orbitron',monospace" }}>ESC</kbd>
      <span className="text-[8px] uppercase tracking-[0.25em] opacity-35" style={{ fontFamily:"'Orbitron',monospace" }}>exit zen</span>
    </div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────
function ColorPicker({ selectedAccent, setSelectedAccent, accentColor }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const hex = selectedAccent?.hex ?? accentColor;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="nav-btn flex items-center gap-2 px-3 py-1.5 h-8"
        style={{ border:`1px solid ${hex}35`, background: open ? `${hex}14` : "transparent" }}
      >
        {/* Wide color preview pill */}
        <span style={{
          display:"block", width:20, height:10, borderRadius:4, flexShrink:0,
          background:`linear-gradient(135deg, ${hex}, ${hex}88)`,
          boxShadow:`0 0 8px ${hex}55`,
        }} />
        <span className="text-[7px] font-black uppercase tracking-wider hidden lg:block"
          style={{ fontFamily:"'Orbitron',monospace", color: open ? hex : "rgba(255,255,255,0.3)" }}>
          {selectedAccent?.label ?? "COLOR"}
        </span>
        <VscChevronDown size={9}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: open ? hex : "rgba(255,255,255,0.2)" }} />
      </button>

      {open && (
        <div className="dd-in absolute top-full mt-3 left-1/2 -translate-x-1/2 p-3 rounded-2xl z-[300]"
          style={{ background:"#06060d", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 24px 64px rgba(0,0,0,0.85)", minWidth:230 }}>
          <p className="text-[6px] font-black uppercase tracking-[0.35em] opacity-20 mb-3 px-1"
            style={{ fontFamily:"'Orbitron',monospace" }}>accent color</p>
          <div className="grid grid-cols-3 gap-1.5">
            {ACCENTS.map((a: any, i: number) => {
              const h = a.hex ?? "#63cab7";
              const active = selectedAccent?.bg === a.bg;
              return (
                <button
                  key={a.bg}
                  onClick={() => { setSelectedAccent(a); setOpen(false); }}
                  className="swatch-pop flex flex-col items-start gap-1.5 p-2.5 rounded-xl transition-all duration-100 active:scale-95 overflow-hidden"
                  style={{
                    animationDelay:`${i * 0.025}s`,
                    background: active ? `${h}18` : "rgba(255,255,255,0.03)",
                    border:`1px solid ${active ? h + "55" : "rgba(255,255,255,0.06)"}`,
                    boxShadow: active ? `0 0 16px ${h}28, inset 0 1px 0 ${h}20` : "none",
                  }}
                >
                  {/* Full-width color swatch */}
                  <span className="block w-full rounded-md"
                    style={{
                      height:20,
                      background:`linear-gradient(135deg, ${h}, ${h}77)`,
                      boxShadow: active ? `0 0 10px ${h}60` : `0 1px 4px ${h}25`,
                    }} />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[6px] font-black uppercase tracking-wider"
                      style={{ color: active ? h : "rgba(255,255,255,0.2)", fontFamily:"'Orbitron',monospace" }}>
                      {a.label ?? "–"}
                    </span>
                    {active && (
                      <svg width="8" height="8" viewBox="0 0 8 8">
                        <polyline points="1,4 3.2,6.5 7,1.5" fill="none" stroke={h} strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── User Menu ────────────────────────────────────────────────────────────────
function UserMenu({ accentColor }: { accentColor: string }) {
  const { user, username, avatarUrl, playerLevel, xp } = usePlayer();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const ref     = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const ripple   = useRipple(`${accentColor}35`);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    setOpen(false);
    window.location.reload();
  };

  const handleSignIn = () => supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.origin },
  });

  if (!user) {
    return (
      <button onClick={handleSignIn}
        className="nav-btn flex items-center gap-2 px-3 h-8"
        style={{ border:`1px solid ${accentColor}30`, background:`${accentColor}0a`, color:accentColor }}>
        <VscAccount size={13} />
        <span className="text-[7px] font-black uppercase tracking-wider hidden lg:block"
          style={{ fontFamily:"'Orbitron',monospace" }}>Sign in</span>
      </button>
    );
  }

  const initial = (username ?? user.email ?? "?")[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { ripple(e); setOpen(o => !o); }}
        className="nav-btn flex items-center gap-2 px-2.5 h-8"
        style={{
          border:`1px solid ${open ? accentColor + "40" : "rgba(255,255,255,0.08)"}`,
          background: open ? `${accentColor}10` : "transparent",
        }}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt="" className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
              style={{ border:`1.5px solid ${accentColor}50` }} />
          : <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0"
              style={{ background:`${accentColor}22`, color:accentColor }}>{initial}</div>
        }
        <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
          <span className="text-[8px] font-black truncate max-w-[80px]"
            style={{ color:accentColor, fontFamily:"'Orbitron',monospace" }}>
            {username ?? user.email?.split("@")[0]}
          </span>
          <span className="text-[6px] opacity-25" style={{ fontFamily:"'Orbitron',monospace" }}>LVL {playerLevel}</span>
        </div>
        <VscChevronDown size={9}
          className={`hidden lg:block transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: open ? accentColor : "rgba(255,255,255,0.2)", flexShrink:0 }} />
      </button>

      {open && (
        <div className="dd-in absolute top-full mt-3 right-0 z-[300] rounded-2xl overflow-hidden"
          style={{ background:"#06060d", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 24px 64px rgba(0,0,0,0.9)", minWidth:210 }}>

          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                  style={{ border:`2px solid ${accentColor}40` }} />
              : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black flex-shrink-0"
                  style={{ background:`${accentColor}20`, color:accentColor }}>{initial}</div>
            }
            <div className="min-w-0">
              <p className="text-[9px] font-black truncate"
                style={{ color:accentColor, fontFamily:"'Orbitron',monospace" }}>
                {username ?? user.email?.split("@")[0]}
              </p>
              <p className="text-[7px] opacity-25 font-mono truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-white/[0.04] border-b border-white/[0.05]">
            {[
              { l:"LEVEL", v:String(playerLevel), c:accentColor },
              { l:"XP",    v:xp.toLocaleString(), c:"#facc15"  },
            ].map(({ l,v,c }) => (
              <div key={l} className="flex flex-col gap-0.5 px-4 py-2.5">
                <span className="text-[5px] opacity-20 uppercase tracking-widest" style={{ fontFamily:"'Orbitron',monospace" }}>{l}</span>
                <span className="text-[15px] font-black tabular-nums" style={{ fontFamily:"'Orbitron',monospace", color:c }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Sign out — prominent red button */}
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors duration-150"
            style={{ background:"transparent" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.09)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background:"rgba(248,113,113,0.13)", border:"1px solid rgba(248,113,113,0.22)" }}>
              <VscSignOut size={13} style={{ color:"#f87171" }} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em]"
              style={{ fontFamily:"'Orbitron',monospace", color:"#f87171" }}>
              {loading ? "Signing out…" : "Sign out"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════════════════════
export const Navbar = (props: any) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetPulse, setResetPulse] = useState(false);
  const { accent, isZenMode, setIsZenMode, resetCurrentSnippet, selectedAccent, setSelectedAccent } = props;
  const accentColor  = accent?.color ?? "#63cab7";
  const rippleAccent = useRipple(`${accentColor}40`);
  const rippleRed    = useRipple("rgba(248,113,113,0.3)");

  useEffect(() => {
    if (accentColor) localStorage.setItem("ns_accent_color", accentColor);
  }, [accentColor]);

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    rippleRed(e);
    setResetPulse(true);
    setTimeout(() => setResetPulse(false), 600);
    resetCurrentSnippet?.();
  };

  const handleZen = (e: React.MouseEvent<HTMLButtonElement>) => {
    rippleAccent(e);
    setTimeout(() => setIsZenMode(true), 120);
  };

  useEffect(() => {
    if (document.getElementById("nav-css")) return;
    const el = document.createElement("style");
    el.id = "nav-css"; el.textContent = NAV_CSS;
    document.head.appendChild(el);
  }, []);

  return (
    <>
      {isZenMode && <ZenHint accentColor={accentColor} />}

      {isZenMode && (
        <button className="zen-fab" onClick={() => setIsZenMode(false)}
          style={{ color:accentColor, borderColor:`${accentColor}25`, boxShadow:`0 0 20px ${accentColor}10` }}>
          <VscTarget size={12} />
          <span>Exit Zen</span>
          <kbd className="px-1.5 py-0.5 rounded-md text-[6px]"
            style={{ background:`${accentColor}15`, color:accentColor, fontFamily:"'Orbitron',monospace" }}>ESC</kbd>
        </button>
      )}

      <nav className={`fixed top-4 md:top-5 left-1/2 z-[200] -translate-x-1/2 transition-all duration-500
        ${isZenMode ? "opacity-0 -translate-y-8 pointer-events-none scale-95" : "opacity-100 translate-y-0 scale-100"}`}>

        <div className="flex h-14 items-stretch"
          style={{
            background:"rgba(5,5,9,0.95)",
            backdropFilter:"blur(32px) saturate(160%)",
            border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:"22px",
            boxShadow:`0 8px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 60px -20px ${accentColor}22`,
          }}>

          {/* LOGO */}
          <div className="nav-seg px-4"><Logo accent={accent} /></div>

          {/* ENV */}
          <div className="nav-seg hidden lg:flex px-3 items-center">
            <div className="flex flex-col justify-center">
              <span className="seg-label">env</span>
              <Selectors {...props} />
            </div>
          </div>

          {/* FONT */}
          <div className="nav-seg hidden lg:flex px-3 items-center">
            <div className="flex flex-col justify-center">
              <span className="seg-label">type</span>
              <FontSize {...props} />
            </div>
          </div>

          {/* MODES */}
          <div className="nav-seg px-3 items-center">
            <div className="flex flex-col justify-center">
              <span className="seg-label">modes</span>
              <ModesMenu {...props} />
            </div>
          </div>

          {/* COLOR */}
          <div className="nav-seg hidden sm:flex px-3 items-center">
            <div className="flex flex-col justify-center">
              <span className="seg-label">color</span>
              <ColorPicker selectedAccent={selectedAccent} setSelectedAccent={setSelectedAccent} accentColor={accentColor} />
            </div>
          </div>

          {/* CTRL */}
          <div className="nav-seg px-3 items-center">
            <div className="flex flex-col justify-center">
              <span className="seg-label">ctrl</span>
              <div className="flex items-center gap-1">
                <button onClick={handleReset} className="nav-btn w-8 h-8" title="Reset snippet">
                  <VscRefresh size={15} className={`transition-transform duration-500 ${resetPulse ? "rotate-180" : ""}`}
                    style={{ color: resetPulse ? "#f87171" : undefined }} />
                </button>
                <button onClick={handleZen} className="nav-btn hidden md:flex w-8 h-8 relative group/zen" title="Zen mode">
                  <VscTarget size={15} />
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/zen:opacity-100 transition-opacity whitespace-nowrap px-2 py-1 rounded-lg text-[6px] font-black uppercase tracking-widest"
                    style={{ background:"#0a0a12", border:"1px solid rgba(255,255,255,0.08)", fontFamily:"'Orbitron',monospace", color:accentColor }}>
                    zen · hides all
                  </span>
                </button>
                <button onClick={() => setMobileOpen(o => !o)} className="nav-btn lg:hidden w-8 h-8">
                  {mobileOpen ? <VscClose size={15} /> : (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M2 4h11M2 7.5h11M2 11h11"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* USER */}
          <div className="nav-seg px-3 items-center rounded-r-[21px]" style={{ background:`${accentColor}07` }}>
            <UserMenu accentColor={accentColor} />
          </div>
        </div>

        {/* Accent underline */}
        <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 h-[2px] w-16 rounded-full pointer-events-none"
          style={{ background:`linear-gradient(90deg,transparent,${accentColor},transparent)`, boxShadow:`0 0 8px ${accentColor}` }} />

        {/* Mobile panel */}
        <div
          className={`absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[88vw] max-w-sm transition-all duration-300 lg:hidden
            ${mobileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"}`}
          style={{ background:"rgba(5,5,9,0.97)", backdropFilter:"blur(32px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"24px", boxShadow:"0 40px 80px rgba(0,0,0,0.8)" }}>
          <div className="p-5 space-y-5">

            {/* Color grid */}
            <div>
              <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-25 mb-3" style={{ fontFamily:"'Orbitron',monospace" }}>Color</p>
              <div className="grid grid-cols-3 gap-1.5">
                {ACCENTS.map((a: any) => {
                  const h = a.hex ?? "#63cab7";
                  const active = selectedAccent?.bg === a.bg;
                  return (
                    <button key={a.bg} onClick={() => setSelectedAccent(a)}
                      className="flex flex-col items-start gap-1.5 p-2.5 rounded-xl transition-all active:scale-95"
                      style={{
                        background: active ? `${h}18` : "rgba(255,255,255,0.04)",
                        border:`1px solid ${active ? h + "50" : "rgba(255,255,255,0.07)"}`,
                        boxShadow: active ? `0 0 12px ${h}25` : "none",
                      }}>
                      <span className="block w-full h-4 rounded-md"
                        style={{ background:`linear-gradient(135deg,${h},${h}80)`, boxShadow:active?`0 0 8px ${h}50`:"none" }} />
                      {a.label && <span className="text-[6px] font-black uppercase tracking-wider"
                        style={{ color: active ? h : "rgba(255,255,255,0.2)", fontFamily:"'Orbitron',monospace" }}>{a.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-white/[0.05]" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-25 mb-2" style={{ fontFamily:"'Orbitron',monospace" }}>Environment</p>
                <Selectors {...props} />
              </div>
              <div>
                <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-25 mb-2" style={{ fontFamily:"'Orbitron',monospace" }}>Typography</p>
                <FontSize {...props} />
              </div>
            </div>

            <div className="h-px bg-white/[0.05]" />

            <div className="flex items-stretch gap-3">
              <button onClick={() => { setIsZenMode(true); setMobileOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all active:scale-95"
                style={{ background:`${accentColor}10`, border:`1px solid ${accentColor}25`, color:accentColor }}>
                <VscTarget size={14} />
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ fontFamily:"'Orbitron',monospace" }}>Zen</span>
              </button>
              <div className="flex-1 flex items-center justify-center">
                <UserMenu accentColor={accentColor} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[190] bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
};