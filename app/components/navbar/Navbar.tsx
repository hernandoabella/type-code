"use client";

import { useState } from "react";
import { VscTarget, VscRefresh, VscSettingsGear, VscClose } from "react-icons/vsc";
import Logo from "./Logo";
import Selectors from "./Selectors";
import FontSize from "./FontSize";
import ModesMenu from "./ModesMenu";
import { Accents } from "./Accents";
import { ACCENTS } from "../../config/constants";

export const Navbar = (props: any) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { accent, isZenMode, setIsZenMode, resetCurrentSnippet, selectedAccent, setSelectedAccent } = props;

  return (
    <>
      <nav className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-700 
        ${isZenMode ? "opacity-0 -translate-y-10 pointer-events-none" : "opacity-100 translate-y-0"}`}>
        
        <div className="flex h-12 md:h-16 items-center gap-1 md:gap-2 px-2 md:px-5 bg-[#080808]/90 backdrop-blur-3xl border border-white/10 rounded-full md:rounded-[1.8rem] shadow-2xl transition-all duration-500">
          
          {/* NÚCLEO IZQUIERDO: Logo siempre presente */}
          <div className="scale-90 md:scale-100">
            <Logo accent={accent} />
          </div>
          
          {/* Separador */}
          <div className="hidden sm:block h-6 md:h-8 w-px bg-white/10 mx-1" />

          {/* ZONA DE CONTROL DINÁMICA */}
          <div className="flex items-center">
            <div className="hidden lg:flex items-center gap-2">
              <Selectors {...props} />
              <FontSize {...props} />
              <div className="h-8 w-px bg-white/10 mx-2" />
            </div>
            <ModesMenu {...props} />
          </div>

          <div className="h-6 md:h-8 w-px bg-white/10 mx-1 md:mx-2" />

          {/* ── Accent color dots ── */}
          <div className="hidden sm:flex items-center gap-2 px-1">
            {ACCENTS.map((a: any) => {
              const hex = a.hex ?? "#63cab7";
              const isActive = selectedAccent?.bg === a.bg;
              return (
                <button
                  key={a.bg}
                  onClick={() => setSelectedAccent(a)}
                  className="transition-all duration-200 active:scale-90"
                  style={{
                    width:        isActive ? "14px" : "10px",
                    height:       isActive ? "14px" : "10px",
                    borderRadius: "50%",
                    background:   hex,
                    opacity:      isActive ? 1 : 0.35,
                    boxShadow:    isActive
                      ? `0 0 0 2px #080808, 0 0 0 3.5px ${hex}, 0 0 10px ${hex}90`
                      : "none",
                  }}
                />
              );
            })}
          </div>

          <div className="hidden sm:block h-6 md:h-8 w-px bg-white/10 mx-1 md:mx-2" />

          {/* ACCIONES FINALES */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <button 
              onClick={() => window.confirm("¿Reset?") && resetCurrentSnippet?.()}
              className="p-2 md:p-3 rounded-full md:rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all"
            >
              <VscRefresh size={18} className="md:size-5" />
            </button>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 md:p-3 rounded-full bg-white/5 text-zinc-400 hover:text-white transition-all"
            >
              {isMobileMenuOpen ? <VscClose size={18} /> : <VscSettingsGear size={18} />}
            </button>

            <button 
              onClick={() => setIsZenMode(true)}
              className="hidden md:flex p-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
            >
              <VscTarget size={20} />
            </button>
          </div>
        </div>

        {/* PANEL MÓVIL */}
        <div className={`absolute top-16 md:top-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-xs p-5 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] transition-all duration-500 lg:hidden ${
          isMobileMenuOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-90 pointer-events-none"
        }`}>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Core Engine</span>
              <Accents currentAccent={accent} setAccent={setSelectedAccent} />
            </div>

            {/* Accent dots móvil */}
            <div className="flex items-center gap-3 px-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase">Color</span>
              <div className="flex items-center gap-2.5">
                {ACCENTS.map((a: any) => {
                  const hex = a.hex ?? "#63cab7";
                  const isActive = selectedAccent?.bg === a.bg;
                  return (
                    <button
                      key={a.bg}
                      onClick={() => setSelectedAccent(a)}
                      className="transition-all duration-200 active:scale-90"
                      style={{
                        width:        isActive ? "16px" : "12px",
                        height:       isActive ? "16px" : "12px",
                        borderRadius: "50%",
                        background:   hex,
                        opacity:      isActive ? 1 : 0.35,
                        boxShadow:    isActive
                          ? `0 0 0 2px #0a0a0a, 0 0 0 3.5px ${hex}, 0 0 10px ${hex}90`
                          : "none",
                      }}
                    />
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

            <button 
              onClick={() => setIsZenMode(true)}
              className="w-full py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
            >
              <VscTarget size={18} /> Zen Mode
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
};