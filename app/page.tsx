"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  VscChevronLeft, 
  VscChevronRight,
  VscMap,
  
  
} from "react-icons/vsc";
import gsap from "gsap";

import { HIGHLIGHT_THEMES, ACCENTS, FONTS, LANG_ICONS, SNIPPETS } from "@/app/config/constants";
import { Navbar } from "@/app/components/navbar/Navbar";

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
  
  // --- ESTADOS DE MODOS (EXISTENTES Y NUEVOS) ---
  const [isGhostActive, setIsGhostActive] = useState(true);
  const [isRecallMode, setIsRecallMode] = useState(false);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [isHardcoreMode, setIsHardcoreMode] = useState(false);
  const [isPrecisionMode, setIsPrecisionMode] = useState(true);
  const [isTimeAttack, setIsTimeAttack] = useState(false);
  const [isShadowMode, setIsShadowMode] = useState(false);
  
  // --- NUEVOS MODOS PARA IMPLEMENTAR ---
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [isComboMode, setIsComboMode] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [isSurvivalMode, setIsSurvivalMode] = useState(false);
  const [isPathMode, setIsPathMode] = useState(false);
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [isCRTMode, setIsCRTMode] = useState(false);

  // --- LÓGICA DE JUEGO ---
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [shadowProgress, setShadowProgress] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredPool = useMemo(() => SNIPPETS.filter((s: { lang: string; }) => (langFilter === "all" || s.lang === langFilter)), [langFilter]);
  const snippet = filteredPool[level] || filteredPool[0];
  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;

  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: fontSize || "19px",
    lineHeight: "1.7",
    fontWeight: 700, 
    tabSize: 4,
  }), [selectedFont, fontSize]);

  const isFocusMode = useMemo(() => (input.length > 0 || autoWriting) && !finished, [input, autoWriting, finished]);

  const stats = useMemo(() => {
    if (!finished || !snippet) return null;
    const errors = input.split("").filter((char, i) => char !== snippet.code[i]).length;
    const accuracy = Math.max(0, Math.round(((snippet.code.length - errors) / snippet.code.length) * 100));
    
    let rank = { label: "BRONZE", color: "text-orange-700", bg: "bg-orange-950/20", border: "border-orange-900/30" };
    if (accuracy === 100) rank = { label: "GOLD", color: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-500/30" };
    else if (accuracy >= 95) rank = { label: "SILVER", color: "text-zinc-300", bg: "bg-zinc-800/20", border: "border-zinc-500/30" };
    
    return { accuracy, rank };
  }, [finished, input, snippet]);

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
      if (isTimeAttack) {
        const bonus = stats && stats.accuracy > 98 ? 500 : 0;
        setScore(prev => prev + (wpm * 10) + bonus);
      }
    }
  }, [finished, snippet, startTime, input, isHardcoreMode, isTimeAttack, wpm, stats]);

  const resetCurrentSnippet = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    setInput(""); setFinished(false); setStartTime(null); setTimeElapsed(0);
    setWpm(0); setIsError(false); setTimeLeft(60); setShadowProgress(0);
    if (!isTimeAttack) setScore(0);
    gsap.fromTo(terminalRef.current, { scale: 0.99, opacity: 0.8 }, { scale: 1, opacity: 1, duration: 0.4, ease: "expo.out" });
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, [isTimeAttack]);

  useEffect(() => {
    setMounted(true);
    const savedBot = localStorage.getItem('bot_active');
    if (savedBot === 'true') setAutoWriting(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('bot_active', autoWriting.toString());
  }, [autoWriting, mounted]);

  useEffect(() => {
    let shadowInterval: NodeJS.Timeout;

    if (startTime && !finished) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
        if (isTimeAttack) {
          setTimeLeft(prev => {
            if (prev <= 1) { setFinished(true); return 0; }
            return prev - 1;
          });
        }
      }, isTimeAttack ? 1000 : 100);

      if (isShadowMode) {
        shadowInterval = setInterval(() => {
          setShadowProgress(prev => {
            if (prev < snippet.code.length) {
              return Math.random() > 0.15 ? prev + 1 : prev;
            }
            return prev;
          });
        }, 55);
      }
    }
    return () => {
      clearInterval(timerRef.current!);
      clearInterval(shadowInterval);
    };
  }, [startTime, finished, isTimeAttack, isShadowMode, snippet.code.length]);

  useEffect(() => {
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    if (autoWriting && !finished && snippet) {
      let index = input.length;
      autoWriteInterval.current = setInterval(() => {
        if (index < snippet.code.length) {
          index++;
          handleInput(snippet.code.slice(0, index));
        } else clearInterval(autoWriteInterval.current!);
      }, 45);
    }
    return () => clearInterval(autoWriteInterval.current!);
  }, [autoWriting, finished, snippet, handleInput, level]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    return `${Math.floor(totalSeconds / 60).toString().padStart(2, '0')}:${(totalSeconds % 60).toString().padStart(2, '0')}`;
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex items-start justify-center p-8 py-20 lg:py-32 overflow-x-hidden ${isCRTMode ? 'crt-effect' : ''}`}>
      
      {/* COMBO COUNTER (PRE-IMPLEMENTACIÓN) */}
      {isComboMode && comboCount > 0 && (
        <div className="fixed top-32 right-12 flex flex-col items-center animate-bounce">
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Combo</span>
          <span className="text-6xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">x{comboCount}</span>
        </div>
      )}

      {/* FOOTER STATS */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl transition-all duration-500 ${finished ? 'opacity-0 translate-y-20' : 'opacity-100'}`}>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
          <div className="flex items-baseline gap-2 justify-center font-mono">
            <span className="text-4xl font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
          </div>
        </div>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[120px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{isTimeAttack ? "Time_Left" : "Total_Time"}</span>
          <div className={`text-4xl font-black font-mono ${isTimeAttack && timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {isTimeAttack ? `${timeLeft}s` : formatTime(timeElapsed)}
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setLevel(l => (l - 1 + filteredPool.length) % filteredPool.length)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"><VscChevronLeft size={20} /></button>
            <button onClick={() => setLevel(l => (l + 1) % filteredPool.length)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-90"><VscChevronRight size={20} /></button>
        </div>
      </div>

      <div className="max-w-[1500px] w-full flex flex-col gap-16">
        <Navbar 
          accent={accent} selectedAccent={selectedAccent} setSelectedAccent={setSelectedAccent}
          langFilter={langFilter} setLangFilter={setLangFilter} languages={["all", "javascript", "typescript", "python"]}
          selectedFont={selectedFont} setSelectedFont={setSelectedFont}
          fontSize={fontSize} setFontSize={setFontSize}
          editorTheme={editorTheme} setEditorTheme={setEditorTheme}
          isGhostActive={isGhostActive} setIsGhostActive={setIsGhostActive}
          autoWriting={autoWriting} setAutoWriting={setAutoWriting}
          isZenMode={isZenMode} setIsZenMode={setIsZenMode}
          isRecallMode={isRecallMode} setIsRecallMode={setIsRecallMode}
          isBlindMode={isBlindMode} setIsBlindMode={setIsBlindMode}
          isHardcoreMode={isHardcoreMode} setIsHardcoreMode={setIsHardcoreMode}
          isPrecisionMode={isPrecisionMode} setIsPrecisionMode={setIsPrecisionMode}
          isTimeAttack={isTimeAttack} setIsTimeAttack={setIsTimeAttack}
          isShadowMode={isShadowMode} setIsShadowMode={setIsShadowMode}
          // Props para nuevos modos
          isCoachMode={isCoachMode} setIsCoachMode={setIsCoachMode}
          isComboMode={isComboMode} setIsComboMode={setIsComboMode}
          isSurvivalMode={isSurvivalMode} setIsSurvivalMode={setIsSurvivalMode}
          isPathMode={isPathMode} setIsPathMode={setIsPathMode}
          isInterviewMode={isInterviewMode} setIsInterviewMode={setIsInterviewMode}
          isHeatmapMode={isHeatmapMode} setIsHeatmapMode={setIsHeatmapMode}
          isCRTMode={isCRTMode} setIsCRTMode={setIsCRTMode}
        />

        {snippet && (
          <div className="grid grid-cols-1 items-start relative h-full mt-8">
            <div className={`transition-all duration-1000 absolute left-0 top-0 ${ (isFocusMode || isZenMode) ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-100 w-[400px]'}`}>
              <div className="space-y-6 pr-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">{LANG_ICONS[snippet.lang]}</div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{snippet.title}</h1>
                <p className="italic text-zinc-400 text-lg border-l-2 border-white/5 pl-6">{snippet.description}</p>
              </div>
            </div>

            <div className={`transition-all duration-1000 w-full ${ (isFocusMode || isZenMode) ? 'pl-0 max-w-[1100px] mx-auto' : 'pl-[420px]'} space-y-8`}>
              <div className={`relative group ${finished ? 'opacity-40 scale-[0.98] blur-sm pointer-events-none' : 'opacity-100'}`}>
                <div ref={terminalRef} className={`relative p-16 bg-[#080808] rounded-[3.5rem] border border-white/10 shadow-3xl overflow-visible cursor-none ${isHardcoreMode ? 'border-red-900/50' : ''}`} onClick={() => textareaRef.current?.focus()}>
                  
                  {/* GHOST LAYER */}
                  <div className="opacity-20 pointer-events-none select-none" style={(!isBlindMode && isGhostActive) ? { maskImage: 'linear-gradient(to right, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 40%)', filter: 'blur(4px)' } : { opacity: 0 }}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }}>{snippet.code}</SyntaxHighlighter>
                  </div>

                  {/* INPUT LAYER */}
                  <div className="absolute inset-0 p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", overflow: "visible" }}>{input}</SyntaxHighlighter>
                    
                    {/* CURSOR PRINCIPAL */}
                    <div className="absolute top-16 left-16 whitespace-pre">
                        <span className="invisible">{input}</span>
                        {input.length < snippet.code.length && (
                             <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse z-20`} />
                        )}

                        {/* SHADOW CARET (RIVAL BOT) */}
                        {isShadowMode && shadowProgress < snippet.code.length && (
                          <div className="absolute top-0 left-0 whitespace-pre">
                            <span className="invisible">{snippet.code.slice(0, shadowProgress)}</span>
                            <span className="inline-block w-[3px] h-[1.2em] translate-y-[0.15em] bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-75">
                               <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black bg-cyan-400 text-black px-1 rounded-sm">SHADOW</span>
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  <textarea ref={textareaRef} value={input} onChange={(e) => handleInput(e.target.value)} spellCheck={false} autoFocus className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-none" disabled={autoWriting || finished} />
                </div>
              </div>

              {/* REPORT CARD */}
              {finished && stats && (
                <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 flex flex-col gap-6">
                   <div className="flex gap-4">
                      {isTimeAttack && (
                        <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-3xl p-6 flex justify-between items-center shadow-lg">
                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Time_Attack_Score</p>
                            <p className="text-4xl font-black text-white">{score} <span className="text-lg opacity-40">PTS</span></p>
                          </div>
                        </div>
                      )}
                      {isShadowMode && (
                        <div className={`flex-1 border rounded-3xl p-6 flex items-center gap-4 ${input.length >= shadowProgress ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                          <VscMap size={30} className={input.length >= shadowProgress ? 'text-cyan-400' : 'text-red-400'} />
                          <div>
                            <p className="text-[10px] font-black uppercase opacity-60">Shadow_Race</p>
                            <p className="text-xl font-black text-white">{input.length >= shadowProgress ? "YOU DEFEATED THE SHADOW" : "THE SHADOW OVERTOOK YOU"}</p>
                          </div>
                        </div>
                      )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className={`p-8 rounded-[2.5rem] border ${stats.rank.border} ${stats.rank.bg} flex flex-col items-center justify-center relative overflow-hidden`}>
                        <span className="text-[10px] font-black uppercase text-zinc-500 mb-1">Rank</span>
                        <div className={`text-6xl font-black italic ${stats.rank.color}`}>{stats.rank.label}</div>
                      </div>
                      <div className="md:col-span-3 bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-around">
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">Accuracy</span>
                          <div className={`text-4xl font-black mt-1 ${stats.accuracy < 95 ? 'text-red-400' : 'text-white'}`}>{stats.accuracy}%</div>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-black text-zinc-500 uppercase">WPM</span>
                          <div className="text-4xl font-black text-white mt-1">{wpm}</div>
                        </div>
                        <button onClick={() => { setLevel(l => (l + 1) % filteredPool.length); resetCurrentSnippet(); }} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:invert transition-all">Next_Sequence</button>
                      </div>
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