"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { VscTarget, VscRefresh, VscSettingsGear, VscClose } from "react-icons/vsc";
import Logo from "./Logo";
import Selectors from "./Selectors";
import FontSize from "./FontSize";
import ModesMenu from "./ModesMenu";
import { Accents } from "./Accents";
import { AuthButton } from "../Authbutton";
import { ACCENTS } from "../../config/constants";

// ─── Dashboard icon ──────────────────────────────────────────────────────────
function DashboardIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}

export const Navbar = (props: any) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { accent, isZenMode, setIsZenMode, resetCurrentSnippet, selectedAccent, setSelectedAccent } = props;
  const accentColor = accent?.color ?? "#63cab7";

  // ── Persist accent color for dashboard to read ─────────────────────────
  useEffect(() => {
    if (accentColor) localStorage.setItem("ns_accent_color", accentColor);
  }, [accentColor]);

  return (
    <>
      <nav className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 
        ${isZenMode ? "opacity-0 -translate-y-10 pointer-events-none" : "opacity-100 translate-y-0"}`}>

        <div className="flex h-12 md:h-16 items-center gap-1 md:gap-2 px-2 md:px-5 bg-[#080808]/90 backdrop-blur-3xl border border-white/10 rounded-full md:rounded-[1.8rem] shadow-2xl transition-all duration-500">

          {/* Logo */}
          <div className="scale-90 md:scale-100">
            <Logo accent={accent} />
          </div>

          <div className="hidden sm:block h-6 md:h-8 w-px bg-white/10 mx-1" />

          {/* Controls */}
          <div className="flex items-center">
            <div className="hidden lg:flex items-center gap-2">
              <Selectors {...props} />
              <FontSize {...props} />
              <div className="h-8 w-px bg-white/10 mx-2" />
            </div>
            <ModesMenu {...props} />
          </div>

          <div className="h-6 md:h-8 w-px bg-white/10 mx-1 md:mx-2" />

          {/* ── Accent color buttons ── */}
          <div className="hidden sm:flex items-center gap-1.5 px-1">
            {ACCENTS.map((a: any) => {
              const hex      = a.hex ?? "#63cab7";
              const isActive = selectedAccent?.bg === a.bg;
              return (
                <button
                  key={a.bg}
                  onClick={() => setSelectedAccent(a)}
                  title={a.label ?? hex}
                  className="relative flex items-center justify-center transition-all duration-200 active:scale-90 group/dot"
                  style={{
                    width:        isActive ? "28px" : "22px",
                    height:       isActive ? "28px" : "22px",
                    borderRadius: "8px",
                    background:   isActive ? `${hex}22` : "transparent",
                    border:       `1.5px solid ${isActive ? hex : "rgba(255,255,255,0.08)"}`,
                    boxShadow:    isActive ? `0 0 10px ${hex}50` : "none",
                  }}
                >
                  <span style={{
                    display: "block", width: isActive ? "10px" : "8px", height: isActive ? "10px" : "8px",
                    borderRadius: "3px", background: hex,
                    boxShadow: isActive ? `0 0 6px ${hex}` : "none",
                    transition: "all 0.2s",
                  }} />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full flex items-center justify-center"
                      style={{ background: hex, boxShadow: `0 0 6px ${hex}` }}>
                      <svg viewBox="0 0 8 8" className="w-1.5 h-1.5">
                        <polyline points="1,4 3,6 7,2" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block h-6 md:h-8 w-px bg-white/10 mx-1 md:mx-2" />

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-1.5">

            {/* Reset */}
            <button
              onClick={() => window.confirm("¿Reset?") && resetCurrentSnippet?.()}
              className="p-2 md:p-2.5 rounded-full md:rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
            >
              <VscRefresh size={16} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 md:p-2.5 rounded-full bg-white/5 text-zinc-400 hover:text-white transition-all"
            >
              {isMobileMenuOpen ? <VscClose size={16} /> : <VscSettingsGear size={16} />}
            </button>

            {/* Zen mode */}
            <button
              onClick={() => setIsZenMode(true)}
              className="hidden md:flex p-2.5 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
            >
              <VscTarget size={18} />
            </button>

            {/* ── Dashboard button ── */}
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:opacity-90 active:scale-95 group/dash"
              style={{
                borderColor: `${accentColor}35`,
                background:  `${accentColor}0d`,
                color:        accentColor,
              }}
            >
              {/* Live dot */}
              <span className="relative flex-shrink-0 w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: accentColor }} />
                <span className="relative block w-1.5 h-1.5 rounded-full" style={{ background: accentColor, boxShadow: `0 0 5px ${accentColor}` }} />
              </span>
              <DashboardIcon size={14} />
              <span
                className="text-[8px] font-black uppercase tracking-[0.2em] hidden lg:block"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                Stats
              </span>
            </Link>

            {/* Auth */}
            <div className="hidden sm:block">
              <AuthButton accentColor={accentColor} />
            </div>
          </div>
        </div>

        {/* ── Mobile panel ── */}
        <div className={`absolute top-16 md:top-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-xs p-5 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] transition-all duration-500 lg:hidden ${
          isMobileMenuOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-90 pointer-events-none"
        }`}>
          <div className="space-y-6">

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Core Engine</span>
              <Accents currentAccent={accent} setAccent={setSelectedAccent} />
            </div>

            {/* Accent buttons — mobile */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Color</span>
              <div className="flex items-center gap-2 flex-wrap">
                {ACCENTS.map((a: any) => {
                  const hex      = a.hex ?? "#63cab7";
                  const isActive = selectedAccent?.bg === a.bg;
                  return (
                    <button key={a.bg} onClick={() => setSelectedAccent(a)}
                      className="relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95"
                      style={{
                        background:  isActive ? `${hex}18` : "rgba(255,255,255,0.04)",
                        border:      `1px solid ${isActive ? hex : "rgba(255,255,255,0.08)"}`,
                        boxShadow:   isActive ? `0 0 10px ${hex}30` : "none",
                      }}>
                      <span style={{ display:"block", width:"10px", height:"10px", borderRadius:"3px", background:hex, boxShadow:isActive?`0 0 6px ${hex}`:"none" }} />
                      {a.label && (
                        <span className="text-[9px] font-black uppercase tracking-widest"
                          style={{ color: isActive ? hex : "rgba(255,255,255,0.3)" }}>{a.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase ml-2">Environment</span>
                <Selectors {...props} />
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase ml-2">Typography</span>
                <FontSize {...props} />
              </div>
            </div>

            {/* Dashboard link — mobile */}
            <Link href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
              style={{ borderColor: `${accentColor}30`, background: `${accentColor}08` }}
              onClick={() => setIsMobileMenuOpen(false)}>
              <span className="relative w-2 h-2 flex-shrink-0">
                <span className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: accentColor }} />
                <span className="relative block w-2 h-2 rounded-full" style={{ background: accentColor }} />
              </span>
              <DashboardIcon size={15} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] flex-1"
                style={{ color: accentColor, fontFamily: "'Orbitron', monospace" }}>War Room</span>
            </Link>

            {/* Auth — mobile */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <AuthButton accentColor={accentColor} />
            </div>

            <button onClick={() => setIsZenMode(true)}
              className="w-full py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
              <VscTarget size={18} /> Zen Mode
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
};