"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { VscChevronLeft, VscChevronRight, VscTarget } from "react-icons/vsc";
import gsap from "gsap";

// Config & Types
import { SNIPPETS } from "@/app/config/snippets";
import { LANG_ICONS } from "@/app/config/icons";
import { HIGHLIGHT_THEMES, ACCENTS, FONTS } from "./config/constants";

// Components & Hooks
import { Navbar } from "./components/Navbar";
import { NeuralEditor } from "./components/NeuralEditor";
import { usePersistence } from "@/app/hooks/usePersistence";

export default function NeuralSyncMaster() {
  const [mounted, setMounted] = useState(false);
  
  // States de Configuración
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState("19px");
  const [editorTheme, setEditorTheme] = useState(HIGHLIGHT_THEMES[0]);
  const [langFilter, setLangFilter] = useState("all");
  const [level, setLevel] = useState(0);
  
  // States de Lógica del Editor
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);
  const [autoWriting, setAutoWriting] = useState(false);
  const [isGhostActive, setIsGhostActive] = useState(true);
  
  // States de Estadísticas
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);

  // Referencias
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Persistencia (Carga y Guarda automáticamente en LocalStorage)
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
    states: {
      level, isGhostActive, autoWriting, autoPilot,
      langFilter, selectedAccent, selectedFont, editorTheme, fontSize
    }
  });

  // 2. Selectores de Datos
  const filteredPool = useMemo(() => 
    SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), 
    [langFilter]
  );
  
  const languages = useMemo(() => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))], []);
  const snippet = filteredPool[level] || filteredPool[0];
  
  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;
  const isFocusMode = useMemo(() => (input.length > 0 || autoWriting) && !finished, [input, autoWriting, finished]);

  // 3. Estilo Maestro (Afecta a la terminal y al textarea invisible)
  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: fontSize,
    lineHeight: "1.7",
    fontWeight: 700, 
    tabSize: 4,
    transition: "font-size 0.2s ease",
  }), [selectedFont, fontSize]);

  // 4. Manejador de Entrada
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

  // 5. Reset del Snippet
  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    
    setInput(""); 
    setFinished(false); 
    setStartTime(null); 
    setTimeElapsed(0);
    setWpm(0); 
    setIsError(false); 
    setAutoWriting(false);

    gsap.fromTo(terminalRef.current, { scale: 0.99, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  // 6. Ciclos de Vida (Efectos)
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    resetCurrentSnippet();
  }, [level, langFilter, mounted, resetCurrentSnippet]);

  // Lógica del Bot (Auto-Writing)
  useEffect(() => {
    if (autoWriting && !finished) {
      let index = input.length;
      autoWriteInterval.current = setInterval(() => {
        if (index < snippet.code.length) { 
          index++; 
          handleInput(snippet.code.slice(0, index)); 
        } else { 
          clearInterval(autoWriteInterval.current!); 
        }
      }, 45);
    } else {
      if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    }
    return () => { if (autoWriteInterval.current) clearInterval(autoWriteInterval.current); };
  }, [autoWriting, finished, snippet.code, handleInput]);

  // Cronómetro
  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  // Cálculo de WPM
  useEffect(() => {
    if (startTime && input.length > 0 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round((input.length / 5) / minutes) || 0);
    }
  }, [input, startTime, finished]);

  // Navegación
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
    const dec = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${dec}`;
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
    <div className="min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex items-start justify-center p-8 lg:p-12 py-20 lg:py-32">
      
      {/* Footer Stats Floating */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl">
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
          <div className="flex items-baseline gap-2 justify-center font-mono">
            <span className="text-4xl font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
          </div>
        </div>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[120px]">
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

      <div className="max-w-[1500px] w-full flex flex-col gap-8 transition-all duration-700 h-full">
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
        />

        {snippet ? (
          <div className="content-fade grid grid-cols-1 lg:grid-cols-[1fr] gap-0 items-start relative h-full">
            
            {/* Sidebar Info (Desaparece en Focus Mode) */}
            <div className={`transition-all duration-700 ease-in-out flex flex-col gap-6 absolute left-0 top-0 z-0 ${isFocusMode ? 'w-0 opacity-0 -translate-x-20 pointer-events-none' : 'w-[400px] opacity-100 translate-x-0'}`}>
                <div className="space-y-6 pr-10">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-white/5 border border-white/10`}>{LANG_ICONS[snippet.lang]}</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                  </div>
                  <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">{snippet.title}</h1>
                  <div className="space-y-6 italic text-zinc-400 text-lg border-l-2 border-white/5 pl-6 leading-relaxed">{snippet.description}</div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white/30 tracking-widest"><VscTarget className={accent.class} /> Use_Case</div>
                    <p className="text-sm font-bold text-zinc-300 leading-relaxed uppercase">{snippet.realLifeUsage}</p>
                  </div>
                </div>
            </div>

            {/* Componente del Editor Exportado */}
            <NeuralEditor 
              isFocusMode={isFocusMode} 
              accent={accent} 
              resetCurrentSnippet={resetCurrentSnippet} 
              terminalRef={terminalRef} 
              textareaRef={textareaRef} 
              isGhostActive={isGhostActive} 
              snippet={snippet} 
              editorTheme={editorTheme} 
              MASTER_STYLE={MASTER_STYLE} 
              input={input} 
              handleInput={handleInput} 
              handleKeyDown={handleKeyDown} 
              finished={finished} 
              autoWriting={autoWriting} 
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}