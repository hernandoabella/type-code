"use client";

import { useRef, useState, useEffect, useMemo, useCallback, JSX } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  VscChevronLeft, 
  VscChevronRight, 
  VscRefresh, 
  VscTrash,
  
  VscCheckAll
} from "react-icons/vsc";
import gsap from "gsap";

import { HIGHLIGHT_THEMES, ACCENTS, FONTS, LANG_ICONS, SNIPPETS } from "./config/constants";
import { Navbar } from "@/app/components/Navbar";

export default function NeuralSyncMaster() {
  const [mounted, setMounted] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [editorTheme, setEditorTheme] = useState(HIGHLIGHT_THEMES[0]);
  const [fontSize, setFontSize] = useState("19px");
  const [isError, setIsError] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [autoWriting, setAutoWriting] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [isGhostActive, setIsGhostActive] = useState(true);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [isHardcoreMode, setIsHardcoreMode] = useState(false);
  const [isPrecisionMode, setIsPrecisionMode] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredPool = useMemo(() => SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), [langFilter]);
  const languages = useMemo(() => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))], []);
  const snippet = filteredPool[level] || filteredPool[0];

  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;

  // --- LÓGICA DE PRECISIÓN Y RANGOS ---
  const stats = useMemo(() => {
    if (!finished || !snippet) return null;
    const errors = input.split("").filter((char, i) => char !== snippet.code[i]).length;
    const accuracy = Math.max(0, Math.round(((snippet.code.length - errors) / snippet.code.length) * 100));
    
    let rank = { label: "BRONZE", color: "text-orange-700", bg: "bg-orange-950/20", border: "border-orange-900/30" };
    if (accuracy === 100) rank = { label: "GOLD", color: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-500/30" };
    else if (accuracy >= 95) rank = { label: "SILVER", color: "text-zinc-300", bg: "bg-zinc-800/20", border: "border-zinc-500/30" };
    
    return { accuracy, rank };
  }, [finished, input, snippet]);

  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: fontSize || "19px",
    lineHeight: "1.7",
    fontWeight: 700, 
    tabSize: 4,
  }), [selectedFont, fontSize]);

  const isFocusMode = useMemo(() => (input.length > 0 || autoWriting) && !finished, [input, autoWriting, finished]);

  // --- HANDLERS ---
  const handleInput = useCallback((val: string) => {
    if (finished || !snippet || val.length > snippet.code.length) return;
    if (!startTime && val.length > 0) setStartTime(Date.now());

    const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
    
    if (isHardcoreMode && currentIsError) {
      resetCurrentSnippet();
      return;
    }

    setIsError(currentIsError);
    if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
      gsap.fromTo(terminalRef.current, { x: -3 }, { x: 3, duration: 0.04, repeat: 3, yoyo: true });
    }

    setInput(val);

    if (val === snippet.code && !currentIsError) {
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [finished, snippet, startTime, input, isHardcoreMode]);

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    setInput(""); setFinished(false); setStartTime(null); setTimeElapsed(0);
    setWpm(0); setIsError(false);
    gsap.fromTo(terminalRef.current, { scale: 0.99, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const resetAllProgress = useCallback(() => {
    if (confirm("¿Reiniciar todo el progreso?")) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  // --- EFFECTS ---
  useEffect(() => {
    setMounted(true);
    const savedBot = localStorage.getItem('bot_active');
    const savedLevel = localStorage.getItem('current_level');
    if (savedBot === 'true') setAutoWriting(true);
    if (savedLevel) setLevel(parseInt(savedLevel));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('bot_active', autoWriting.toString());
    localStorage.setItem('current_level', level.toString());
  }, [autoWriting, level, mounted]);

  // Bot Writing Logic: Sigue activo aunque cambies de snippet
  useEffect(() => {
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    if (autoWriting && !finished && snippet) {
      let index = input.length;
      autoWriteInterval.current = setInterval(() => {
        if (index < snippet.code.length) {
          index++;
          handleInput(snippet.code.slice(0, index));
        } else {
          clearInterval(autoWriteInterval.current!);
        }
      }, 45);
    }
    return () => { if (autoWriteInterval.current) clearInterval(autoWriteInterval.current); };
  }, [autoWriting, finished, snippet, handleInput, level]);

  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  useEffect(() => {
    if (startTime && input.length > 0 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round((input.length / 5) / minutes) || 0);
    }
  }, [input, startTime, finished]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const min = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const sec = (totalSeconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex items-start justify-center p-8 lg:p-12 py-20 lg:py-32 overflow-x-hidden">
      
      <button onClick={resetAllProgress} className="fixed top-8 right-8 z-[110] flex items-center gap-2 px-4 py-2 bg-red-500/5 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all opacity-40 hover:opacity-100 group">
        <VscTrash className="text-red-400 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80">Master_Reset</span>
      </button>

      {/* STATS FOOTER */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl transition-all duration-500 ${finished ? 'opacity-0 translate-y-20' : 'opacity-100'}`}>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
          <div className="flex items-baseline gap-2 justify-center font-mono">
            <span className="text-4xl font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
          </div>
        </div>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[120px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Total_Time</span>
          <div className="text-4xl font-black font-mono text-white">{formatTime(timeElapsed)}</div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setLevel(l => (l - 1 + filteredPool.length) % filteredPool.length)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"><VscChevronLeft size={20} /></button>
           <button onClick={() => setLevel(l => (l + 1) % filteredPool.length)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"><VscChevronRight size={20} /></button>
        </div>
      </div>

      <div className="max-w-[1500px] w-full flex flex-col gap-16 h-full">
        <Navbar 
          accent={accent} selectedAccent={selectedAccent} setSelectedAccent={setSelectedAccent}
          langFilter={langFilter} setLangFilter={setLangFilter} languages={languages}
          selectedFont={selectedFont} setSelectedFont={setSelectedFont}
          fontSize={fontSize} setFontSize={setFontSize}
          editorTheme={editorTheme} setEditorTheme={setEditorTheme}
          isGhostActive={isGhostActive} setIsGhostActive={setIsGhostActive}
          autoWriting={autoWriting} setAutoWriting={setAutoWriting}
          autoPilot={true} setAutoPilot={() => {}}
          isZenMode={isZenMode} setIsZenMode={setIsZenMode}
          isRecallMode={isRecallMode} setIsRecallMode={setIsRecallMode}
          isBlindMode={isBlindMode} setIsBlindMode={setIsBlindMode}
          isHardcoreMode={isHardcoreMode} setIsHardcoreMode={setIsHardcoreMode}
          isPrecisionMode={isPrecisionMode} setIsPrecisionMode={setIsPrecisionMode}
        />

        {snippet && (
          <div className="content-fade grid grid-cols-1 items-start relative h-full mt-8">
            <div className={`transition-all duration-1000 flex flex-col gap-6 absolute left-0 top-0 ${ (isFocusMode || isZenMode) ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-100 w-[400px]'}`}>
              <div className="space-y-6 pr-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">{LANG_ICONS[snippet.lang]}</div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{snippet.title}</h1>
                <p className="italic text-zinc-400 text-lg border-l-2 border-white/5 pl-6 leading-relaxed">{snippet.description}</p>
                <div className="text-xs font-mono text-zinc-500 bg-white/5 p-4 rounded-2xl">{snippet.realLifeUsage}</div>
              </div>
            </div>

            <div className={`transition-all duration-1000 w-full ${ (isFocusMode || isZenMode) ? 'pl-0 max-w-[1100px] mx-auto' : 'pl-[420px]'} space-y-8 relative z-10`}>
              
              {/* TERMINAL AREA */}
              <div className={`relative group ${finished ? 'opacity-40 scale-[0.98] blur-sm pointer-events-none' : 'opacity-100'}`}>
                <div className={`absolute -inset-1 rounded-[3.5rem] blur opacity-10 transition duration-1000 ${accent.bg}`} />
                <button onClick={resetCurrentSnippet} className={`absolute top-8 right-8 z-50 p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 active:scale-90 flex items-center gap-3 group/btn ${isFocusMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <VscRefresh size={18} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Reset</span>
                </button>

                <div ref={terminalRef} className="relative p-16 bg-[#080808] rounded-[3.5rem] border border-white/10 shadow-3xl overflow-visible cursor-none" onClick={() => textareaRef.current?.focus()}>
                  {/* GHOST / RECALL LAYER */}
                  <div className="recall-layer opacity-20 pointer-events-none select-none transition-all duration-500" style={(!isBlindMode && isGhostActive) ? { maskImage: 'linear-gradient(to right, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 40%)', filter: 'blur(4px)' } : { opacity: 0 }}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }}>{snippet.code}</SyntaxHighlighter>
                  </div>
                  
                  {/* INPUT LAYER */}
                  <div className="absolute inset-0 p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", overflow: "visible" }}>{input}</SyntaxHighlighter>
                    {input.length < snippet.code.length && (
                        <div className="absolute top-16 left-16 whitespace-pre">
                            <span className="invisible">{input}</span>
                            <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse`} />
                            {isRecallMode && input.length === 0 && <span className="text-zinc-500/20 italic ml-4">Start typing to recall...</span>}
                        </div>
                    )}
                  </div>
                  <textarea ref={textareaRef} value={input} onChange={(e) => handleInput(e.target.value)} spellCheck={false} autoFocus className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-none" disabled={autoWriting || finished} />
                </div>
              </div>

              {/* REPORT CARD (PRECISION MODE) */}
              {finished && stats && (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 flex flex-col gap-6">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className={`p-8 rounded-[2.5rem] border ${stats.rank.border} ${stats.rank.bg} flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl`}>
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Final_Rank</span>
                        <div className={`text-6xl font-black italic tracking-tighter ${stats.rank.color} drop-shadow-2xl`}>{stats.rank.label}</div>
                      </div>
                      <div className="md:col-span-3 bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-around">
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">Accuracy</span>
                          <div className={`text-4xl font-mono font-black mt-1 ${stats.accuracy < 95 ? 'text-red-400' : 'text-white'}`}>{stats.accuracy}%</div>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">Speed</span>
                          <div className="text-4xl font-mono font-black text-white mt-1">{wpm} <span className="text-xs opacity-30">WPM</span></div>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">Status</span>
                          <div className="flex items-center gap-2 text-green-400 font-black italic text-2xl mt-1"><VscCheckAll /> SYNCED</div>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6">
                        <span className="text-[9px] font-black text-zinc-600 uppercase mb-2 block">Snippet_Output</span>
                        <pre className="text-zinc-400 font-mono text-sm italic">{snippet.output}</pre>
                      </div>
                      <button onClick={() => setLevel(l => (l + 1) % filteredPool.length)} className="px-12 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95">Next_Sequence</button>
                      <button onClick={resetCurrentSnippet} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all text-white active:scale-90"><VscRefresh size={24} /></button>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}