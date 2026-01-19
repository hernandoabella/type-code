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

// Configuración y componentes
import { HIGHLIGHT_THEMES, ACCENTS, FONTS, LANG_ICONS, SNIPPETS } from "./config/constants";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

export default function NeuralSyncMaster() {
  const [mounted, setMounted] = useState(false);
  
  // --- ESTADOS DE UI & LAYOUT ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [editorTheme, setEditorTheme] = useState(HIGHLIGHT_THEMES[0]);
  const [fontSize, setFontSize] = useState("19px");

  // --- ESTADOS DE LÓGICA ---
  const [isError, setIsError] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);
  const [autoWriting, setAutoWriting] = useState(false);
  const [isTimeActive, setIsTimeActive] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [isGhostActive, setIsGhostActive] = useState(true);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);

  // Stats para la sidebar
  const userStats = { points: 12450, rank: "Neural Architect", accuracy: 98.2, streak: 12, completion: 74 };

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Memos
  const filteredPool = useMemo(() => SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), [langFilter]);
  const languages = useMemo(() => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))], []);
  const snippet = filteredPool[level] || filteredPool[0];
  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;
  const isFocusMode = useMemo(() => (input.length > 0 || autoWriting) && !finished, [input, autoWriting, finished]);

  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: fontSize || "19px",
    lineHeight: "1.7",
    fontWeight: 700, 
    tabSize: 4,
  }), [selectedFont, fontSize]);

  // --- FUNCIONES ---
  const handleInput = useCallback((val: string) => {
    if (finished || !snippet || val.length > snippet.code.length) return;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    
    const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
    setIsError(currentIsError);

    if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
      gsap.fromTo(terminalRef.current, { x: -3 }, { x: 3, duration: 0.04, repeat: 3, yoyo: true });
    }

    setInput(val);
    
    if (val === snippet.code && !currentIsError) {
      setFinished(true);
      if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [finished, snippet, startTime, input.length]);

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    setInput(""); setFinished(false); setStartTime(null); setTimeElapsed(0);
    setWpm(0); setIsError(false); setAutoWriting(false);
    gsap.fromTo(terminalRef.current, { scale: 0.99, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  // --- EFECTOS ---
  useEffect(() => {
    setMounted(true);
    const savedBot = localStorage.getItem('bot_active');
    if (savedBot === 'true') setAutoWriting(true);
  }, []);

  useEffect(() => {
    if (startTime && !finished && isTimeActive) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished, isTimeActive]);

  useEffect(() => {
    if (startTime && input.length > 0 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round((input.length / 5) / minutes) || 0);
    }
  }, [input, startTime, finished]);

  useEffect(() => {
    if (autoWriting && !finished && snippet) {
      let index = input.length;
      autoWriteInterval.current = setInterval(() => {
        if (index < snippet.code.length) {
          index++;
          handleInput(snippet.code.slice(0, index));
        } else if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
      }, 45);
    }
    return () => { if (autoWriteInterval.current) clearInterval(autoWriteInterval.current); };
  }, [autoWriting, finished, snippet.code, handleInput, input.length]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex overflow-hidden">
      
      {/* SIDEBAR INTEGRADA */}
      {!isZenMode && (
        <Sidebar 
          userStats={userStats} 
          isBlindMode={isBlindMode} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
      )}

      {/* CONTENEDOR PRINCIPAL: Expansión dinámica */}
      <main className={`flex-1 relative h-screen overflow-y-auto transition-all duration-500 ease-in-out ${(!isZenMode && isSidebarOpen) ? 'pr-80' : 'pr-0'}`}>
        
        {/* BOTÓN MASTER RESET */}
        <button onClick={() => window.location.reload()} className="fixed top-8 left-8 z-[110] flex items-center gap-2 px-4 py-2 bg-red-500/5 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all opacity-40 hover:opacity-100">
          <VscTrash className="text-red-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80">Reset_System</span>
        </button>

        {/* STATS FOOTER: Centrado Inteligente según el Layout */}
        <div 
          className="fixed bottom-8 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl transition-all duration-500 ease-in-out"
          style={{ 
            left: (!isZenMode && isSidebarOpen) ? 'calc(50% - 160px)' : '50%',
            transform: 'translateX(-50%)'
          }}
        >
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
              <span className="text-4xl font-black">{Math.floor(timeElapsed / 1000)}s</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setLevel(l => l - 1)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"><VscChevronLeft size={20} /></button>
             <button onClick={() => setLevel(l => l + 1)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"><VscChevronRight size={20} /></button>
          </div>
        </div>

        {/* ÁREA DE JUEGO */}
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-12 p-8 lg:p-20 pt-32 pb-40 transition-all duration-500">
          <Navbar 
            accent={accent} selectedAccent={selectedAccent} setSelectedAccent={setSelectedAccent}
            langFilter={langFilter} setLangFilter={setLangFilter} languages={languages}
            selectedFont={selectedFont} setSelectedFont={setSelectedFont}
            fontSize={fontSize} setFontSize={setFontSize}
            editorTheme={editorTheme} setEditorTheme={setEditorTheme}
            isGhostActive={isGhostActive} setIsGhostActive={setIsGhostActive}
            autoWriting={autoWriting} setAutoWriting={setAutoWriting}
            autoPilot={autoPilot} setAutoPilot={setAutoPilot}
            isZenMode={isZenMode} setIsZenMode={setIsZenMode}
            isRecallMode={isRecallMode} setIsRecallMode={setIsRecallMode} 
            isBlindMode={isBlindMode} setIsBlindMode={setIsBlindMode}
          />

          <div className="content-fade grid grid-cols-1 items-start relative mt-8">
            {/* DESCRIPCIÓN (Se oculta en foco) */}
            <div className={`transition-all duration-1000 ease-out flex flex-col gap-6 fixed left-12 top-48 z-0 ${ (isFocusMode || isZenMode) ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 w-[300px]'}`}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">{LANG_ICONS[snippet.lang]}</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                  </div>
                  <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">{snippet.title}</h1>
                  <p className="italic text-zinc-400 text-lg border-l-2 border-white/5 pl-6 leading-relaxed">{snippet.description}</p>
                </div>
            </div>

            {/* TERMINAL CENTRAL */}
            <div className="w-full max-w-[900px] mx-auto space-y-8 relative z-10 transition-all duration-500">
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-[3.5rem] blur opacity-10 transition duration-1000 ${accent.bg}`} />
                
                <button onClick={resetCurrentSnippet} className={`absolute top-8 right-8 z-50 p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 ${ (isFocusMode || isZenMode) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <VscRefresh size={18} />
                </button>

                <div ref={terminalRef} className="relative p-12 lg:p-16 bg-[#080808] rounded-[3.5rem] border border-white/10 shadow-3xl min-h-[400px] cursor-none" onClick={() => textareaRef.current?.focus()}>
                  {/* Capas de Texto (Ghost & Input) */}
                  <div className="opacity-20 pointer-events-none select-none transition-all" style={isGhostActive && !isBlindMode ? { filter: 'blur(4px)' } : { opacity: 0 }}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }}>{snippet.code}</SyntaxHighlighter>
                  </div>
                  
                  <div className="absolute inset-0 p-12 lg:p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
                    <div className={isBlindMode ? "opacity-0" : "opacity-100 transition-opacity"}>
                      <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent" }}>{input}</SyntaxHighlighter>
                    </div>
                    {/* Cursor Animado */}
                    <div className="absolute top-12 lg:top-16 left-12 lg:left-16 whitespace-pre">
                      <span className="invisible">{input}</span>
                      {input.length < snippet.code.length && <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} animate-pulse shadow-[0_0_15px_currentColor]`} />}
                    </div>
                  </div>

                  <textarea 
                    ref={textareaRef} 
                    value={input} 
                    onChange={(e) => handleInput(e.target.value)} 
                    spellCheck={false} 
                    autoFocus 
                    className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-none" 
                    disabled={autoWriting || finished} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}