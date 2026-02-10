"use client";

import { useRef, useState, useEffect, useMemo, useCallback, JSX } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  VscChevronLeft, 
  VscChevronRight, 
  VscRefresh
} from "react-icons/vsc";
import gsap from "gsap";

// --- Tipos y Constantes ---
import { HIGHLIGHT_THEMES, ACCENTS, FONTS, LANG_ICONS, SNIPPETS } from "./config/constants";
import { Navbar } from "./components/navbar/Navbar";

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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredPool = useMemo(() => 
    SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), 
  [langFilter]);
  
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
    transition: "all 0.3s ease",
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
      if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [finished, snippet, startTime, input.length]);

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    setInput(""); setFinished(false); setStartTime(null); setTimeElapsed(0); setWpm(0); setIsError(false);
    gsap.fromTo(terminalRef.current, { scale: 0.99, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('bot_active') === 'true') setAutoWriting(true);
  }, []);

  useEffect(() => {
    if (autoWriting && !finished) {
      let index = input.length;
      autoWriteInterval.current = setInterval(() => {
        if (index < snippet.code.length) { 
          index++; 
          handleInput(snippet.code.slice(0, index)); 
        }
      }, 45);
    }
    return () => { if (autoWriteInterval.current) clearInterval(autoWriteInterval.current); };
  }, [autoWriting, finished, snippet.code, handleInput, input.length]);

  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  useEffect(() => {
    if (startTime && input.length > 0 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round((input.length / 5) / minutes) || 0);
    }
  }, [input, startTime, finished]);

  const nextSnippet = () => setLevel(l => (l + 1) % filteredPool.length);
  const prevSnippet = () => setLevel(l => (l - 1 + filteredPool.length) % filteredPool.length);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex items-start justify-center p-4 md:p-12 py-20 lg:py-32 overflow-x-hidden">
      
      <Navbar 
        accent={accent}
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
        autoWriting={autoWriting}
        setAutoWriting={setAutoWriting}
        isZenMode={isZenMode}
        setIsZenMode={setIsZenMode}
        resetCurrentSnippet={resetCurrentSnippet}
      />

      <div className="max-w-[1500px] w-full flex flex-col gap-16">
        {snippet && (
          <div className="grid grid-cols-1 items-start relative mt-8">
            
            <div className={`transition-all duration-1000 fixed left-12 top-40 z-0 hidden xl:block ${ (isFocusMode || isZenMode) ? 'opacity-0 -translate-x-20 pointer-events-none' : 'opacity-100 translate-x-0 w-[350px]'}`}>
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">{LANG_ICONS[snippet.lang]}</div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{snippet.title}</h1>
                <p className="text-zinc-400 text-lg border-l-2 border-white/5 pl-6 leading-relaxed italic">{snippet.description}</p>
              </div>
            </div>

            <div className={`transition-all duration-1000 w-full ${ (isFocusMode || isZenMode) ? 'max-w-[1000px] mx-auto' : 'xl:pl-[400px]'} relative z-10`}>
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-[3.5rem] blur opacity-10 transition duration-1000 ${accent.bg}`} />
                
                <div 
                  ref={terminalRef} 
                  className="relative p-8 md:p-16 bg-[#080808] rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 shadow-3xl cursor-none overflow-hidden"
                  onClick={() => textareaRef.current?.focus()}
                >
                  {/* CAPA FONDO: Mejorada a opacity-25 y un leve blur */}
                  <div className="opacity-25 blur-[0.5px] pointer-events-none select-none transition-opacity duration-500" style={MASTER_STYLE}>
                    <SyntaxHighlighter 
                      language={snippet.lang} 
                      style={editorTheme.style} 
                      customStyle={{ margin: 0, padding: 0, background: "transparent", overflow: "visible" }}
                      codeTagProps={{ style: MASTER_STYLE }}
                    >
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>

                  {/* CAPA ACTIVA: El texto que se va "desbloqueando" */}
                  <div className="absolute inset-0 p-8 md:p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
                    <div className="relative">
                      <SyntaxHighlighter 
                        language={snippet.lang} 
                        style={editorTheme.style} 
                        customStyle={{ margin: 0, padding: 0, background: "transparent", overflow: "visible" }}
                        codeTagProps={{ style: { ...MASTER_STYLE, color: 'inherit' } }}
                      >
                        {input}
                      </SyntaxHighlighter>

                      {/* Cursor dinámico */}
                      <div className="absolute top-0 left-0 whitespace-pre">
                        <span className="invisible">{input}</span>
                        {input.length < snippet.code.length && (
                          <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse`} />
                        )}
                      </div>
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

              {/* Victory Stats */}
              <div className={`mt-8 transition-all duration-700 flex flex-col md:flex-row gap-4 ${finished ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest block mb-2">Output_Stream</span>
                  <pre className="font-mono text-sm text-zinc-400 italic">{snippet.output || "// Complete!"}</pre>
                </div>
                <button onClick={resetCurrentSnippet} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 group">
                  <VscRefresh size={24} className="text-white group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[10px] font-black uppercase opacity-40">Retry</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Footer Stats */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 md:gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-6 md:px-10 py-4 rounded-[2rem] shadow-2xl">
        <div className="flex flex-col border-r border-white/10 pr-4 md:pr-8 text-center min-w-[70px]">
          <span className="text-[8px] font-black uppercase opacity-40">Speed</span>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl md:text-3xl font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[9px] font-bold`}>WPM</span>
          </div>
        </div>
        <div className="flex flex-col border-r border-white/10 pr-4 md:pr-8 text-center min-w-[90px]">
          <span className="text-[8px] font-black uppercase opacity-40">Time</span>
          <span className="text-2xl md:text-3xl font-mono font-black text-white">{formatTime(timeElapsed)}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
           <button onClick={prevSnippet} className="p-2 md:p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-90"><VscChevronLeft size={18} /></button>
           <button onClick={nextSnippet} className="p-2 md:p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-90"><VscChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}