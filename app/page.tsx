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

export type SnippetLang = "javascript" | "typescript" | "python";
export type SnippetLevel = "beginner" | "intermediate" | "advanced";
export type SnippetCategory = "Hooks" | "Forms" | "Async" | "Types" | "Logic" | "Data" | "Performance";

export interface Snippet {
  id: string;
  title: string;
  category: SnippetCategory;
  lang: SnippetLang;
  level: SnippetLevel;
  tags: string[];
  icon: JSX.Element;
  description: string;
  realLifeUsage: string;
  output?: string;
  bestPractice?: boolean;
  code: string;
}

import { SNIPPETS } from "@/app/config/snippets";
import { LANG_ICONS } from "@/app/config/icons";
import { HIGHLIGHT_THEMES, ACCENTS, FONTS } from "./config/constants";
import { Navbar } from "./components/Navbar";

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
  const [autoPilot, setAutoPilot] = useState(true);
  const [autoWriting, setAutoWriting] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isTimeActive, setIsTimeActive] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [isGhostActive, setIsGhostActive] = useState(true);
  const [isRecallMode, setIsRecallMode] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredPool = useMemo(() => SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), [langFilter]);
  const languages = useMemo(() => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))], []);
  
  const snippet = filteredPool[level] || filteredPool[0];
  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;

  // --- LÓGICA DE RESET TOTAL ---
  const resetAllProgress = useCallback(() => {
    if (confirm("¿Estás seguro de que quieres reiniciar todo tu progreso?")) {
      localStorage.clear();
      setLevel(0);
      setLangFilter("all");
      resetCurrentSnippet();
      window.location.reload(); // Recarga para asegurar estado limpio
    }
  }, []);

  useEffect(() => {
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) setIsZenMode(false);
    };
    window.addEventListener("keydown", handleGlobalEsc);
    return () => window.removeEventListener("keydown", handleGlobalEsc);
  }, [isZenMode]);

  useEffect(() => {
    if (isRecallMode && input.length === 1 && !autoWriting) {
      gsap.to(".recall-layer", {
        opacity: 0,
        filter: "blur(20px)",
        scale: 0.95,
        duration: 0.8,
        ease: "power2.out"
      });
    }

    if (!isRecallMode || input.length === 0) {
      gsap.to(".recall-layer", {
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        duration: 0.4,
        ease: "power2.in"
      });
    }
  }, [isRecallMode, input.length, autoWriting]);

  const isFocusMode = useMemo(() => (input.length > 0 || autoWriting) && !finished, [input, autoWriting, finished]);

  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: fontSize || "19px",
    lineHeight: "1.7",
    fontWeight: 700, 
    tabSize: 4,
  }), [selectedFont, fontSize]);

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
      if (autoWriteInterval.current) { clearInterval(autoWriteInterval.current); autoWriteInterval.current = null; }
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [finished, snippet, startTime, input.length]);

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) { clearInterval(autoWriteInterval.current); autoWriteInterval.current = null; }
    setInput(""); setFinished(false); setStartTime(null); setTimeElapsed(0);
    setWpm(0); setIsError(false); setAutoWriting(false);
    gsap.fromTo(terminalRef.current, { scale: 0.99, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedLevel = localStorage.getItem('current_level');
    const savedBot = localStorage.getItem('bot_active');
    const savedZen = localStorage.getItem('zen_mode');
    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedBot !== null) setAutoWriting(savedBot === 'true');
    if (savedZen !== null) setIsZenMode(savedZen === 'true');
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('bot_active', autoWriting.toString());
    localStorage.setItem('zen_mode', isZenMode.toString());
    localStorage.setItem('current_level', level.toString());
  }, [autoWriting, isZenMode, level, mounted]);

  useEffect(() => {
    if (autoWriting && !finished) {
      let index = input.length;
      autoWriteInterval.current = setInterval(() => {
        if (index < snippet.code.length) { index++; handleInput(snippet.code.slice(0, index)); }
        else { if (autoWriteInterval.current) clearInterval(autoWriteInterval.current); }
      }, 45);
    } else if (autoWriteInterval.current) { clearInterval(autoWriteInterval.current); autoWriteInterval.current = null; }
    return () => { if (autoWriteInterval.current) clearInterval(autoWriteInterval.current); };
  }, [autoWriting, finished, snippet.code, handleInput]);

  useEffect(() => {
    if (!mounted) return;
    resetCurrentSnippet();
  }, [level, langFilter, mounted, resetCurrentSnippet]);

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

  const nextSnippet = () => {
    gsap.to(".content-fade", { opacity: 0, duration: 0.3, onComplete: () => {
        setLevel(l => (l + 1) % filteredPool.length);
        gsap.to(".content-fade", { opacity: 1, duration: 0.4 });
    }});
  };

  const prevSnippet = () => {
    gsap.to(".content-fade", { opacity: 0, duration: 0.3, onComplete: () => {
        setLevel(l => (l - 1 + filteredPool.length) % filteredPool.length);
        gsap.to(".content-fade", { opacity: 1, duration: 0.4 });
    }});
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autoWriting || finished) return;
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.currentTarget;
      const tabSpaces = "    "; 
      const newValue = input.substring(0, selectionStart) + tabSpaces + input.substring(selectionEnd);
      handleInput(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + tabSpaces.length;
        }
      }, 0);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex items-start justify-center p-8 lg:p-12 py-20 lg:py-32 overflow-x-hidden">
      
      {/* BOTÓN MASTER RESET (Top Right) */}
      <button 
        onClick={resetAllProgress}
        className="fixed top-8 right-8 z-[110] flex items-center gap-2 px-4 py-2 bg-red-500/5 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all group opacity-40 hover:opacity-100"
      >
        <VscTrash className="text-red-400 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest text-red-400/80">Master_Reset</span>
      </button>

      {/* Footer Permanente (Stats) */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl transition-all duration-500`}>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
          <div className="flex items-baseline gap-2 justify-center font-mono">
            <span className="text-4xl font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
          </div>
        </div>
        <div className={`flex flex-col border-r border-white/10 pr-8 text-center min-w-[120px]`}>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Total_Time</span>
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
        />

        {snippet ? (
          <div className="content-fade grid grid-cols-1 items-start relative h-full mt-8">
            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col gap-6 absolute left-0 top-0 z-0 ${ (isFocusMode || isZenMode) ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-100 translate-x-0 w-[400px]'}`}>
                <div className="space-y-6 pr-10">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-white/5 border border-white/10`}>{LANG_ICONS[snippet.lang]}</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                  </div>
                  <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">{snippet.title}</h1>
                  <div className="space-y-6 italic text-zinc-400 text-lg border-l-2 border-white/5 pl-6 leading-relaxed">{snippet.description}</div>
                  <div>{snippet.realLifeUsage}</div>
                </div>
            </div>

            <div className={`transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] w-full ${ (isFocusMode || isZenMode) ? 'pl-0 max-w-[1100px] mx-auto' : 'pl-[420px]'} space-y-8 relative z-10 h-auto`}>
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-[3.5rem] blur opacity-10 transition duration-1000 ${accent.bg}`} />
                
                <button 
                  onClick={resetCurrentSnippet} 
                  className={`absolute top-8 right-8 z-50 p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 active:scale-90 flex items-center gap-3 group/btn ${ (isFocusMode || isZenMode) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                >
                  <VscRefresh size={18} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Reset</span>
                </button>

                <div ref={terminalRef} className={`relative p-16 bg-[#080808] rounded-[3.5rem] border border-white/10 shadow-3xl transition-all duration-700 h-auto overflow-visible cursor-none`} onClick={() => textareaRef.current?.focus()}>
                  <div className="recall-layer opacity-20 pointer-events-none select-none transition-all duration-500" style={isGhostActive ? { maskImage: 'linear-gradient(to right, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 40%)', filter: 'blur(4px)' } : { opacity: 0 }}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }} codeTagProps={{ style: MASTER_STYLE }}>{snippet.code}</SyntaxHighlighter>
                  </div>
                  
                  <div className="absolute inset-0 p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", overflow: "visible" }} codeTagProps={{ style: { ...MASTER_STYLE, color: 'inherit' } }}>{input}</SyntaxHighlighter>
                    <div className="absolute top-16 left-16 whitespace-pre pointer-events-none">
                        <span className="invisible">{input}</span>
                        {input.length < snippet.code.length && (
                            <>
                                <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse`} />
                                <span className={`recall-layer transition-all duration-300 ${isGhostActive ? 'text-zinc-400' : 'text-zinc-500/30'}`} style={isGhostActive ? { maskImage: 'linear-gradient(to right, black 0%, transparent 250px)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 250px)', filter: 'blur(1px)' } : {}}>{snippet.code.slice(input.length)}</span>
                            </>
                        )}
                    </div>
                  </div>
                  <textarea ref={textareaRef} value={input} onChange={(e) => handleInput(e.target.value)} onKeyDown={handleKeyDown} spellCheck={false} autoFocus className={`absolute inset-0 w-full h-full opacity-0 z-30 ${finished ? 'cursor-default' : 'cursor-none'}`} disabled={autoWriting || finished} />
                </div>
              </div>

              <div className={`transition-all duration-700 flex items-center gap-6 ${finished ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
                <div className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 shadow-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-500 tracking-tighter">Output_Stream</div>
                    <pre className="font-mono text-sm text-zinc-400 italic">{snippet.output}</pre>
                  </div>
                </div>
                <button onClick={resetCurrentSnippet} className="group flex flex-col items-center justify-center gap-2 p-8 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.08] transition-all active:scale-95">
                  <VscRefresh size={24} className="group-hover:rotate-180 transition-transform duration-500 text-white" />
                  <span className="text-[10px] font-black uppercase text-white/40 font-sans">Retry</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}