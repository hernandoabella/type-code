"use client";

import { useState, useEffect, useRef } from "react";
import { VscTarget, VscRefresh, VscClose, VscChevronDown } from "react-icons/vsc";
import Logo from "./Logo";
import Selectors from "./Selectors";
import FontSize from "./FontSize";
import ModesMenu from "./ModesMenu";
import { AuthButton } from "../Authbutton";
import { ACCENTS } from "../../config/constants";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const NAV_CSS = `
  @keyframes nav-appear {
    from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.96); filter: blur(8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1);    filter: blur(0px); }
  }
  @keyframes seg-glow-pulse {
    0%,100% { box-shadow: 0 0 0px 0px var(--sg, transparent); }
    50%      { box-shadow: 0 0 14px 2px var(--sg, transparent); }
  }
  @keyframes dot-ping {
    0%    { transform: scale(1);   opacity: 0.8; }
    100%  { transform: scale(2.2); opacity: 0;   }
  }
  @keyframes dropdown-in {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); filter: blur(4px); }
    to   { opacity: 1; transform: translateY(0)     scale(1);    filter: blur(0);   }
  }
  @keyframes zen-exit {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to   { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
  @keyframes zen-hint {
    0%,100% { opacity: 0; transform: translateY(-4px); }
    20%,80% { opacity: 1; transform: translateY(0); }
  }
  @keyframes color-swatch-in {
    from { transform: scale(0.5) rotate(-10deg); opacity: 0; }
    to   { transform: scale(1)   rotate(0deg);   opacity: 1; }
  }

  .nav-appear  { animation: nav-appear 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
  .nav-exit    { animation: zen-exit   0.3s ease-in forwards; }
  .dd-in       { animation: dropdown-in 0.25s cubic-bezier(0.22,1,0.36,1) forwards; }
  .zen-hint    { animation: zen-hint 2.5s ease-in-out 1.5s both; }
  .swatch-in   { animation: color-swatch-in 0.2s cubic-bezier(0.22,1,0.36,1) both; }

  .nav-seg {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    transition: background 0.2s;
  }
  .nav-seg::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 1px;
    background: rgba(255,255,255,0.07);
  }
  .nav-seg:last-child::after { display: none; }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    transition: background 0.15s, color 0.15s, transform 0.1s;
    cursor: pointer;
    color: rgba(255,255,255,0.3);
  }
  .nav-btn:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.06); }
  .nav-btn:active { transform: scale(0.91); }

  .accent-dot {
    width: 16px; height: 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    position: relative;
  }
  .accent-dot:hover { transform: scale(1.25); }
  .accent-dot.active { transform: scale(1.15); }
  .accent-dot .ping {
    position: absolute; inset: 0; border-radius: 5px;
    animation: dot-ping 1.4s ease-out infinite;
  }

  .zen-fab {
    position: fixed;
    bottom: 96px;
    right: 24px;
    z-index: 90;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(6,6,10,0.92);
    backdrop-filter: blur(20px);
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Orbitron', monospace;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }
  .zen-fab:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.2); background: rgba(10,10,16,0.98); }
  .zen-fab:active { transform: scale(0.95); }
`;

// ─── Zen ESC hint ─────────────────────────────────────────────────────────────
function ZenHint({ accentColor }: { accentColor: string }) {
  return (
    <div className="zen-hint fixed top-6 left-1/2 -translate-x-1/2 z-[199] pointer-events-none flex items-center gap-2 px-4 py-2 rounded-full"
      style={{ background: "rgba(6,6,10,0.8)", border: `1px solid ${accentColor}20`, backdropFilter: "blur(12px)" }}>
      <kbd className="text-[8px] font-black px-1.5 py-0.5 rounded-md"
        style={{ background: `${accentColor}18`, color: accentColor, fontFamily: "'Orbitron',monospace" }}>ESC</kbd>
      <span className="text-[8px] uppercase tracking-[0.25em] opacity-40" style={{ fontFamily: "'Orbitron',monospace" }}>exit zen</span>
    </div>
  );
}

// ─── Segment label ────────────────────────────────────────────────────────────
function SegLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[6px] font-black uppercase tracking-[0.3em] opacity-20 mb-0.5 block leading-none select-none"
      style={{ fontFamily: "'Orbitron',monospace" }}>
      {children}
    </span>
  );
}

// ─── Color picker dropdown ────────────────────────────────────────────────────
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
        style={{ border: `1px solid ${hex}30`, background: open ? `${hex}12` : "transparent", color: open ? hex : undefined }}
      >
        {/* Active color swatch */}
        <span style={{
          display: "block", width: 9, height: 9, borderRadius: 3,
          background: hex, boxShadow: `0 0 6px ${hex}`,
          flexShrink: 0,
        }} />
        <span className="text-[7px] font-black uppercase tracking-wider hidden lg:block"
          style={{ fontFamily: "'Orbitron',monospace", color: open ? hex : "rgba(255,255,255,0.3)" }}>
          {selectedAccent?.label ?? "COLOR"}
        </span>
        <VscChevronDown size={10} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} style={{ opacity: 0.4 }} />
      </button>

      {open && (
        <div className="dd-in absolute top-full mt-3 left-1/2 -translate-x-1/2 p-3 rounded-2xl z-[300]"
          style={{ background: "#07070e", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", minWidth: 160 }}>
          <p className="text-[6px] font-black uppercase tracking-[0.35em] opacity-20 mb-3 px-1"
            style={{ fontFamily: "'Orbitron',monospace" }}>accent</p>
          <div className="grid grid-cols-4 gap-2">
            {ACCENTS.map((a: any, i: number) => {
              const h = a.hex ?? "#63cab7";
              const active = selectedAccent?.bg === a.bg;
              return (
                <button
                  key={a.bg}
                  onClick={() => { setSelectedAccent(a); setOpen(false); }}
                  className="swatch-in flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-150 active:scale-90"
                  style={{
                    animationDelay: `${i * 0.03}s`,
                    background: active ? `${h}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? h : "rgba(255,255,255,0.06)"}`,
                    boxShadow: active ? `0 0 12px ${h}30` : "none",
                  }}
                >
                  <span className="relative block w-5 h-5 rounded-md flex-shrink-0"
                    style={{ background: h, boxShadow: active ? `0 0 8px ${h}` : "none" }}>
                    {active && (
                      <span className="absolute inset-0 rounded-md" style={{ background: h }}>
                        <svg viewBox="0 0 10 10" className="w-full h-full p-1">
                          <polyline points="1,5 4,8 9,2" fill="none" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </span>
                  {a.label && (
                    <span className="text-[5px] font-black uppercase tracking-wider"
                      style={{ color: active ? h : "rgba(255,255,255,0.2)", fontFamily: "'Orbitron',monospace" }}>
                      {a.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════════════════════
export const Navbar = (props: any) => {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [resetPulse, setResetPulse]   = useState(false);
  const {
    accent, isZenMode, setIsZenMode,
    resetCurrentSnippet, selectedAccent, setSelectedAccent,
  } = props;
  const accentColor = accent?.color ?? "#63cab7";

  // Persist accent for dashboard
  useEffect(() => {
    if (accentColor) localStorage.setItem("ns_accent_color", accentColor);
  }, [accentColor]);

  const handleReset = () => {
    setResetPulse(true);
    setTimeout(() => setResetPulse(false), 600);
    resetCurrentSnippet?.();
  };

  // ── Inject CSS ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("nav-css")) return;
    const el = document.createElement("style");
    el.id = "nav-css"; el.textContent = NAV_CSS;
    document.head.appendChild(el);
  }, []);

  return (
    <>
      {/* ── ESC hint in zen mode ── */}
      {isZenMode && <ZenHint accentColor={accentColor} />}

      {/* ── Exit zen FAB ── */}
      {isZenMode && (
        <button className="zen-fab" onClick={() => setIsZenMode(false)}
          style={{ color: accentColor, borderColor: `${accentColor}25`, boxShadow: `0 0 20px ${accentColor}08` }}>
          <VscTarget size={12} />
          <span>Exit Zen</span>
          <kbd className="px-1.5 py-0.5 rounded-md text-[6px]"
            style={{ background: `${accentColor}15`, color: accentColor, fontFamily: "'Orbitron',monospace" }}>ESC</kbd>
        </button>
      )}

      {/* ── Main navbar ── */}
      <nav className={`fixed top-4 md:top-5 left-1/2 z-[200] transition-all duration-500
        ${isZenMode ? "opacity-0 -translate-y-8 pointer-events-none scale-95" : "opacity-100 translate-y-0 scale-100"}
        -translate-x-1/2`}>

        <div
          className="flex h-14 items-stretch"
          style={{
            background: "rgba(5,5,9,0.94)",
            backdropFilter: "blur(32px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "22px",
            boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 60px -20px ${accentColor}20`,
          }}
        >

          {/* ── LOGO segment ── */}
          <div className="nav-seg px-4">
            <Logo accent={accent} />
          </div>

          {/* ── ENVIRONMENT segment (desktop) ── */}
          <div className="nav-seg hidden lg:flex px-3 gap-1 items-center">
            <div className="flex flex-col justify-center">
              <SegLabel>env</SegLabel>
              <div className="flex items-center gap-1">
                <Selectors {...props} />
              </div>
            </div>
          </div>

          {/* ── FONT segment (desktop) ── */}
          <div className="nav-seg hidden lg:flex px-3 items-center">
            <div className="flex flex-col justify-center">
              <SegLabel>type</SegLabel>
              <FontSize {...props} />
            </div>
          </div>

          {/* ── MODES segment ── */}
          <div className="nav-seg px-3 items-center">
            <div className="flex flex-col justify-center">
              <SegLabel>modes</SegLabel>
              <ModesMenu {...props} />
            </div>
          </div>

          {/* ── COLOR segment (desktop) ── */}
          <div className="nav-seg hidden sm:flex px-3 items-center">
            <div className="flex flex-col justify-center">
              <SegLabel>color</SegLabel>
              <ColorPicker
                selectedAccent={selectedAccent}
                setSelectedAccent={setSelectedAccent}
                accentColor={accentColor}
              />
            </div>
          </div>

          {/* ── ACTIONS segment ── */}
          <div className="nav-seg px-3 flex items-center gap-1.5">
            <div className="flex flex-col justify-center">
              <SegLabel>ctrl</SegLabel>
              <div className="flex items-center gap-1">

                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="nav-btn w-8 h-8 relative"
                  title="Reset snippet"
                >
                  {/* Pulse ring on reset */}
                  {resetPulse && (
                    <span className="absolute inset-0 rounded-[10px] pointer-events-none"
                      style={{ boxShadow: `0 0 0 3px ${accentColor}`, animation: "seg-glow-pulse 0.5s ease-out", "--sg": accentColor } as any} />
                  )}
                  <VscRefresh size={15} className={`transition-transform duration-500 ${resetPulse ? "rotate-180" : ""}`} />
                </button>

                {/* Zen mode */}
                <button
                  onClick={() => setIsZenMode(true)}
                  className="nav-btn hidden md:flex w-8 h-8 relative group/zen"
                  title="Zen mode (hides all UI)"
                >
                  <VscTarget size={15} />
                  {/* Tooltip */}
                  <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/zen:opacity-100 transition-opacity whitespace-nowrap px-2 py-1 rounded-lg text-[6px] font-black uppercase tracking-widest"
                    style={{ background: "#0a0a12", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Orbitron',monospace", color: accentColor }}>
                    zen · hides all
                  </span>
                </button>

                {/* Mobile toggle */}
                <button
                  onClick={() => setMobileOpen(o => !o)}
                  className="nav-btn lg:hidden w-8 h-8"
                >
                  {mobileOpen ? <VscClose size={15} /> : (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M2 4h11M2 7.5h11M2 11h11"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── AUTH segment ── */}
          <div className="nav-seg hidden sm:flex px-4 items-center rounded-r-[21px] overflow-hidden"
            style={{ background: `${accentColor}07` }}>
            <AuthButton accentColor={accentColor} />
          </div>

        </div>

        {/* ── Active accent underline ── */}
        <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 h-[2px] w-16 rounded-full pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, boxShadow: `0 0 8px ${accentColor}` }} />

        {/* ── Mobile panel ── */}
        <div className={`absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[88vw] max-w-sm
          transition-all duration-300 lg:hidden overflow-hidden
          ${mobileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"}`}
          style={{
            background: "rgba(5,5,9,0.97)",
            backdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
          }}
        >
          <div className="p-5 space-y-5">

            {/* Color */}
            <div>
              <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-25 mb-3" style={{ fontFamily: "'Orbitron',monospace" }}>Color</p>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((a: any) => {
                  const h = a.hex ?? "#63cab7";
                  const active = selectedAccent?.bg === a.bg;
                  return (
                    <button key={a.bg} onClick={() => { setSelectedAccent(a); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
                      style={{ background: active ? `${h}18` : "rgba(255,255,255,0.04)", border: `1px solid ${active ? h : "rgba(255,255,255,0.07)"}` }}>
                      <span style={{ display: "block", width: 10, height: 10, borderRadius: 3, background: h, boxShadow: active ? `0 0 6px ${h}` : "none" }} />
                      {a.label && <span className="text-[8px] font-black uppercase tracking-wider" style={{ color: active ? h : "rgba(255,255,255,0.3)", fontFamily: "'Orbitron',monospace" }}>{a.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.05]" />

            {/* Env + Font */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-25 mb-2" style={{ fontFamily: "'Orbitron',monospace" }}>Environment</p>
                <Selectors {...props} />
              </div>
              <div>
                <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-25 mb-2" style={{ fontFamily: "'Orbitron',monospace" }}>Typography</p>
                <FontSize {...props} />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.05]" />

            {/* Zen + Auth */}
            <div className="flex items-center gap-3">
              <button onClick={() => { setIsZenMode(true); setMobileOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all active:scale-95"
                style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25`, color: accentColor }}>
                <VscTarget size={14} />
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ fontFamily: "'Orbitron',monospace" }}>Zen Mode</span>
              </button>
              <AuthButton accentColor={accentColor} />
            </div>

          </div>
        </div>
      </nav>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[190] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
};