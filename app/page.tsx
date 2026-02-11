"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { VscChevronLeft, VscChevronRight, VscRefresh } from "react-icons/vsc";
import gsap from "gsap";

// Config & Components
import { HIGHLIGHT_THEMES, ACCENTS, FONTS, LANG_ICONS, SNIPPETS } from "./config/constants";
import { Navbar } from "./components/navbar/Navbar";

// Hooks
import { useNeuralEditor } from "./hooks/useNeuralEditor";
import { usePersistence } from "./hooks/usePersistence";

export default function NeuralSyncMaster() {
  const [mounted, setMounted] = useState(false);

  // --- ESTADOS DE CONFIGURACIÓN ---
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [editorTheme, setEditorTheme] = useState(HIGHLIGHT_THEMES[0]);
  const [fontSize, setFontSize] = useState("19px");
  const [langFilter, setLangFilter] = useState("all");
  const [level, setLevel] = useState(0);
  
  // --- ESTADOS DE MODOS ---
  const [autoPilot, setAutoPilot] = useState(true);
  const [autoWriting, setAutoWriting] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isGhostActive, setIsGhostActive] = useState(true);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [isHardcoreMode, setIsHardcoreMode] = useState(false);
  const [isPrecisionMode, setIsPrecisionMode] = useState(false);

  // --- REFERENCIAS ---
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DE SNIPPETS ---
  const filteredPool = useMemo(() => 
    SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), 
  [langFilter]);
  
  const snippet = filteredPool[level] || filteredPool[0];
  const languages = useMemo(() => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))], []);

  // --- INTEGRACIÓN DEL HOOK EDITOR (EL MOTOR) ---
  const {
    input, isError, finished, timeElapsed, wpm, accuracy, rank,
    isFocusMode, isCodeVisible, MASTER_STYLE, handleInput, 
    handleKeyDown, resetCurrentSnippet, formatTime
  } = useNeuralEditor({
    snippet,
    autoWriting,
    botSpeed: 45,
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
  });

  // --- INTEGRACIÓN DEL HOOK PERSISTENCIA ---
  usePersistence({
    setLevel,
    setIsGhostActive,
    setAutoWriting,
    setAutoPilot,
    setLangFilter,
    setSelectedAccent,
    setSelectedFont,
    setEditorTheme,
    setFontSize,
    setIsZenMode,
    setIsRecallMode,
    setIsBlindMode,
    states: {
      level, isGhostActive, autoWriting, autoPilot, langFilter,
      selectedAccent, selectedFont, editorTheme, fontSize, 
      isZenMode, isRecallMode, isBlindMode
    }
  });

  // --- EFECTOS DE MONTAJE Y NAVEGACIÓN ---
  useEffect(() => setMounted(true), []);

  const nextSnippet = () => {
    gsap.to(".content-fade", { opacity: 0, duration: 0.3, onComplete: () => {
      setLevel(l => (l + 1) % filteredPool.length);
      resetCurrentSnippet();
      gsap.to(".content-fade", { opacity: 1, duration: 0.4 });
    }});
  };

  const prevSnippet = () => {
    gsap.to(".content-fade", { opacity: 0, duration: 0.3, onComplete: () => {
      setLevel(l => (l - 1 + filteredPool.length) % filteredPool.length);
      resetCurrentSnippet();
      gsap.to(".content-fade", { opacity: 1, duration: 0.4 });
    }});
  };

  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex items-start justify-center p-8 lg:p-12 py-20 lg:py-32 overflow-x-hidden">
      
      {/* HUD de Stats */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl transition-all duration-500">
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
          <div className="flex items-baseline gap-2 justify-center font-mono">
            <span className="text-4xl font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
          </div>
        </div>
        
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[120px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Time</span>
          <div className="flex items-baseline gap-2 justify-center font-mono text-white">
            <span className="text-4xl font-black">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-2">
           <button onClick={prevSnippet} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"><VscChevronLeft size={20} /></button>
           <button onClick={nextSnippet} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"><VscChevronRight size={20} /></button>
        </div>
      </div>

      <div className="max-w-[1500px] w-full flex flex-col gap-16 h-full">
        <Navbar 
          accent={accent}
          selectedAccent={selectedAccent}
          setSelectedAccent={setSelectedAccent}
          langFilter={langFilter}
          setLangFilter={setLangFilter}
          languages={languages}
          selectedFont={selectedFont}
          setSelectedFont={setSelectedFont}
          fontSize={fontSize}
          setFontSize={setFontSize}
          editorTheme={editorTheme}
          setEditorTheme={setEditorTheme}
          isGhostActive={isGhostActive}
          setIsGhostActive={setIsGhostActive}
          autoWriting={autoWriting}
          setAutoWriting={setAutoWriting}
          autoPilot={autoPilot}
          setAutoPilot={setAutoPilot}
          isZenMode={isZenMode}
          setIsZenMode={setIsZenMode}
          isRecallMode={isRecallMode}
          setIsRecallMode={setIsRecallMode}
          isBlindMode={isBlindMode}
          setIsBlindMode={setIsBlindMode}
        />

        {snippet && (
          <div className="content-fade grid grid-cols-1 items-start relative h-full mt-8">
            {/* Sidebar de información del Snippet */}
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col gap-6 absolute left-0 top-0 z-0 ${ (isFocusMode || isZenMode) ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 w-[400px]'}`}>
                <div className="space-y-6 pr-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">{LANG_ICONS[snippet.lang]}</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                  </div>
                  <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">{snippet.title}</h1>
                  <p className="italic text-zinc-400 text-lg border-l-2 border-white/5 pl-6 leading-relaxed">{snippet.description}</p>
                </div>
            </div>

            {/* Terminal de Código */}
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] w-full ${ (isFocusMode || isZenMode) ? 'pl-0 max-w-[1100px] mx-auto' : 'pl-[420px]'} space-y-8 relative z-10`}>
              <div className="relative group">
                <button 
                  onClick={resetCurrentSnippet} 
                  className={`absolute top-8 right-8 z-50 p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 active:scale-90 flex items-center gap-3 group/btn ${ (isFocusMode || isZenMode) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                >
                  <VscRefresh size={18} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Reset</span>
                </button>

                <div 
                  ref={terminalRef} 
                  className="relative p-16 bg-[#080808] rounded-[3.5rem] border border-white/10 shadow-3xl transition-all duration-700 overflow-visible cursor-none"
                  onClick={() => textareaRef.current?.focus()}
                >
                  {/* Capa de Guía (Ghost/Recall) */}
                  <div className="source-code-layer opacity-20 pointer-events-none select-none transition-all duration-500" 
                       style={isGhostActive && isCodeVisible ? { maskImage: 'linear-gradient(to right, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 40%)', filter: 'blur(4px)' } : { opacity: 0 }}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }} codeTagProps={{ style: MASTER_STYLE }}>
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>
                  
                  {/* Capa de Input Real */}
                  <div className="absolute inset-0 p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", overflow: "visible" }} codeTagProps={{ style: { ...MASTER_STYLE, color: 'inherit' } }}>
                      {input}
                    </SyntaxHighlighter>
                    
                    {/* Cursor y Sombreado de continuación */}
                    <div className="absolute top-16 left-16 whitespace-pre pointer-events-none">
                        <span className="invisible">{input}</span>
                        {input.length < snippet.code.length && (
                            <>
                                <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse`} />
                                <span className={`transition-all duration-300 ${isGhostActive ? 'text-zinc-400' : 'text-zinc-500/30'}`} 
                                      style={isGhostActive && isCodeVisible ? { maskImage: 'linear-gradient(to right, black 0%, transparent 250px)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 250px)', filter: 'blur(1px)' } : { opacity: 0 }}>
                                  {snippet.code.slice(input.length)}
                                </span>
                            </>
                        )}
                    </div>
                  </div>

                  <textarea 
                    ref={textareaRef} 
                    value={input} 
                    onChange={(e) => handleInput(e.target.value)} 
                    onKeyDown={handleKeyDown} 
                    spellCheck={false} 
                    autoFocus 
                    className={`absolute inset-0 w-full h-full opacity-0 z-30 ${finished ? 'cursor-default' : 'cursor-none'}`} 
                    disabled={autoWriting || finished} 
                  />
                </div>
              </div>

              {/* Report Card (Rank) al finalizar */}
              {finished && (
                <div className="flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 shadow-2xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Accuracy</div>
                      <div className="text-2xl font-black text-white">{accuracy}%</div>
                    </div>
                    {rank && (
                      <div className={`px-6 py-2 rounded-full ${rank.bg} ${rank.color} font-black text-xl border border-current/20`}>
                        RANK {rank.id}
                      </div>
                    )}
                  </div>
                  <button onClick={resetCurrentSnippet} className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.08] transition-all">
                    <VscRefresh size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}