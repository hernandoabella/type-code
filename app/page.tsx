"use client";

import { useRef, useState, useEffect, useMemo, useCallback, JSX } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  VscChevronLeft, 
  VscChevronRight, 
  VscRefresh, 
  VscTrash
} from "react-icons/vsc";
import gsap from "gsap";

// Config & Hooks
import { HIGHLIGHT_THEMES, ACCENTS, FONTS, LANG_ICONS, SNIPPETS } from "./config/constants";
import { Navbar } from "./components/Navbar";
import { useNeuralEditor } from "./hooks/useNeuralEditor"; // Usando el hook actualizado

export default function NeuralSyncMaster() {
  const [mounted, setMounted] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [editorTheme, setEditorTheme] = useState(HIGHLIGHT_THEMES[0]);
  const [fontSize, setFontSize] = useState("19px");
  const [langFilter, setLangFilter] = useState("all");
  const [level, setLevel] = useState(0);
  
  // Modos de Juego
  const [autoWriting, setAutoWriting] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isGhostActive, setIsGhostActive] = useState(true);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [isHardcoreMode, setIsHardcoreMode] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const filteredPool = useMemo(() => 
    SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), 
  [langFilter]);
  
  const languages = useMemo(() => 
    ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))], 
  []);
  
  const snippet = filteredPool[level] || filteredPool[0];

  // --- INTEGRACIÓN DEL HOOK ACTUALIZADO ---
  const {
    input,
    isError,
    finished,
    timeElapsed,
    wpm,
    accuracy,
    isFocusMode,
    isCodeVisible,
    MASTER_STYLE,
    handleInput,
    handleKeyDown,
    resetCurrentSnippet,
    formatTime,
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
  });

  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;

  // --- PERSISTENCIA & MOUNT ---
  useEffect(() => {
    setMounted(true);
    const savedLevel = localStorage.getItem('current_level');
    if (savedLevel) setLevel(parseInt(savedLevel));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('current_level', level.toString());
  }, [level, mounted]);

  // Reset al cambiar de snippet o filtro
  useEffect(() => {
    if (mounted) resetCurrentSnippet();
  }, [level, langFilter, mounted, resetCurrentSnippet]);

  // --- NAVEGACIÓN ---
  const nextSnippet = () => {
    gsap.to(".content-fade", { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
      setLevel(l => (l + 1) % filteredPool.length);
      gsap.to(".content-fade", { opacity: 1, y: 0, duration: 0.4 });
    }});
  };

  const prevSnippet = () => {
    gsap.to(".content-fade", { opacity: 0, y: 20, duration: 0.3, onComplete: () => {
      setLevel(l => (l - 1 + filteredPool.length) % filteredPool.length);
      gsap.to(".content-fade", { opacity: 1, y: 0, duration: 0.4 });
    }});
  };

  const resetAllProgress = () => {
    if (confirm("Reset System Data?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex items-start justify-center p-8 lg:p-12 py-20 lg:py-32 overflow-hidden">
      
      {/* MASTER RESET */}
      <button 
        onClick={resetAllProgress}
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 px-4 py-2 bg-red-500/5 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all group opacity-20 hover:opacity-100"
      >
        <VscTrash className="text-red-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80">System_Wipe</span>
      </button>

      {/* STATS HUD */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2.5rem] shadow-2xl transition-all duration-500">
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Accuracy</span>
          <div className="flex items-baseline gap-1 justify-center font-mono">
            <span className="text-4xl font-black text-white">{accuracy}</span>
            <span className="text-zinc-500 text-[10px]">%</span>
          </div>
        </div>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
          <div className="flex items-baseline gap-1 justify-center font-mono">
            <span className="text-4xl font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
          </div>
        </div>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[120px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Time</span>
          <div className="text-4xl font-black text-white font-mono">{formatTime(timeElapsed)}</div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={prevSnippet} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"><VscChevronLeft size={20} /></button>
           <button onClick={nextSnippet} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"><VscChevronRight size={20} /></button>
        </div>
      </div>

      <div className="max-w-[1500px] w-full flex flex-col gap-16">
        <Navbar 
          accent={accent}
          selectedAccent={selectedAccent} setSelectedAccent={setSelectedAccent}
          langFilter={langFilter} setLangFilter={setLangFilter}
          languages={languages}
          selectedFont={selectedFont} setSelectedFont={setSelectedFont}
          fontSize={fontSize} setFontSize={setFontSize}
          editorTheme={editorTheme} setEditorTheme={setEditorTheme}
          isGhostActive={isGhostActive} setIsGhostActive={setIsGhostActive}
          autoWriting={autoWriting} setAutoWriting={setAutoWriting}
          autoPilot={false} setAutoPilot={() => {}} 
          isZenMode={isZenMode} setIsZenMode={setIsZenMode}
          isRecallMode={isRecallMode} setIsRecallMode={setIsRecallMode}
          isBlindMode={isBlindMode} setIsBlindMode={setIsBlindMode}
          isHardcoreMode={isHardcoreMode} setIsHardcoreMode={setIsHardcoreMode}
        />

        <div className="content-fade grid grid-cols-1 items-start relative mt-8">
          {/* INFO SIDEBAR */}
          <div className={`transition-all duration-1000 ease-out flex flex-col gap-6 absolute left-0 top-0 z-0 ${ (isFocusMode || isZenMode) ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 w-[400px]'}`}>
              <div className="space-y-6 pr-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">{LANG_ICONS[snippet.lang]}</div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{snippet.title}</h1>
                <p className="italic text-zinc-400 text-lg border-l-2 border-white/5 pl-6 leading-relaxed">{snippet.description}</p>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-zinc-500 font-mono italic">
                  {snippet.realLifeUsage}
                </div>
              </div>
          </div>

          {/* TERMINAL AREA */}
          <div className={`transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] w-full ${ (isFocusMode || isZenMode) ? 'pl-0 max-w-[1100px] mx-auto' : 'pl-[420px]'} space-y-8 relative z-10`}>
            <div className="relative">
              <div className={`absolute -inset-4 rounded-[4rem] blur-2xl opacity-10 transition-opacity duration-1000 ${isHardcoreMode ? 'bg-red-500' : accent.bg}`} />
              
              <div 
                ref={terminalRef} 
                className={`relative p-16 bg-[#080808] rounded-[3.5rem] border border-white/10 shadow-3xl transition-all duration-500 overflow-hidden cursor-none`}
                onClick={() => textareaRef.current?.focus()}
              >
                {/* GHOST LAYER (Código de fondo) */}
                <div 
                  className="source-code-layer opacity-20 pointer-events-none select-none transition-all duration-500" 
                  style={{ 
                    visibility: isCodeVisible ? 'visible' : 'hidden',
                    filter: isGhostActive ? 'blur(4px)' : 'blur(0px)',
                    maskImage: isGhostActive ? 'linear-gradient(to right, black 0%, transparent 50%)' : 'none'
                  }}
                >
                  <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }}>
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>
                
                {/* USER INPUT LAYER */}
                <div className="absolute inset-0 p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
                  <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent" }}>
                    {input}
                  </SyntaxHighlighter>
                  
                  {/* CURSOR & NEXT CHARS */}
                  <div className="absolute top-16 left-16 whitespace-pre pointer-events-none">
                      <span className="invisible">{input}</span>
                      {input.length < snippet.code.length && (
                          <>
                              <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse`} />
                              {!isBlindMode && (
                                <span className={`transition-all duration-300 ${isGhostActive ? 'text-zinc-500/50' : 'text-zinc-500/20'}`}>
                                  {snippet.code.slice(input.length, input.length + 50)}...
                                </span>
                              )}
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

            {/* SUCCESS FEEDBACK */}
            <div className={`transition-all duration-700 flex items-center gap-6 ${finished ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
              <div className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Compilated_Output</span>
                <pre className="font-mono text-sm text-zinc-400 italic">{snippet.output || "// Operation successful"}</pre>
              </div>
              <button onClick={resetCurrentSnippet} className="group p-10 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.08] transition-all active:scale-95">
                <VscRefresh size={24} className="group-hover:rotate-180 transition-transform duration-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}