"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { VscChevronDown, VscServerProcess, VscTerminal, VscCircuitBoard, VscLibrary, VscPulse, VscDashboard, VscLoading } from "react-icons/vsc";
import { SiPython } from "react-icons/si";
import gsap from "gsap";

/* =======================
    DATABASE
======================= */
const SNIPPETS = [
  {
    id: "PY-CORE",
    title: "Async Engine",
    category: "Infrastructure",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Advanced asynchronous task orchestration using gather and exception handling. | High-frequency trading logic.",
    output: ">>> Tasks completed in 0.45s\n>>> Latency: 12ms\n>>> Status: 200 OK",
    code: `async def run_sync():\n    tasks = [fetch_data(i) for i in range(10)]\n    try:\n        results = await asyncio.gather(*tasks)\n        return [r.json() for r in results]\n    except Exception as e:\n        logger.error(f"Sync failed: {e}")`
  },
  {
    id: "PY-DATA",
    title: "Feature Scaler",
    category: "Data Science",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Implementation of Standard Scaler algorithms for tensor normalization. | Computer Vision Preprocessing.",
    output: ">>> Mean: 0.0, Std: 1.0\n>>> Tensors: Normalised\n>>> Logic: Verified",
    code: `def scale_features(X):\n    mean = np.mean(X, axis=0)\n    std = np.std(X, axis=0)\n    return (X - mean) / (std + 1e-8)`
  }
];

const ACCENTS = [
  { name: "Cyber", class: "text-blue-400", bg: "bg-blue-400", shadow: "shadow-blue-500/40", hex: "#60a5fa" },
  { name: "Neon", class: "text-pink-400", bg: "bg-pink-400", shadow: "shadow-pink-500/40", hex: "#f472b6" },
  { name: "Eco", class: "text-emerald-400", bg: "bg-emerald-400", shadow: "shadow-emerald-500/40", hex: "#34d399" },
];

const MASTER_STYLE: React.CSSProperties = {
  fontFamily: '"Fira Code", monospace',
  fontSize: "22px",
  lineHeight: "1.8",
  fontWeight: 500,
  tabSize: 4,
};

/* =======================
    MAIN APPLICATION
======================= */
export default function NeuralSyncMaster() {
  const [mounted, setMounted] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [isError, setIsError] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const filteredPool = useMemo(() => SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), [langFilter]);
  const snippet = filteredPool[level];
  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/50", hex: "#ef4444" } : selectedAccent;

  useEffect(() => setMounted(true), []);
  useEffect(() => { setInput(""); setFinished(false); setStartTime(null); setWpm(0); }, [level]);

  useEffect(() => {
    if (!finished || !autoPilot) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { nextSnippet(); return 3; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished, autoPilot]);

  useEffect(() => {
    if (startTime && input.length > 0 && !finished) {
      const minutes = (Date.now() - startTime) / 60000;
      setWpm(Math.round((input.length / 5) / minutes) || 0);
    }
  }, [input, startTime, finished]);

  const handleInput = (val: string) => {
    if (finished || !snippet || val.length > snippet.code.length) return;
    if (!startTime) setStartTime(Date.now());
    const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
    setIsError(currentIsError);
    if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
      gsap.fromTo(terminalRef.current, { x: -3 }, { x: 3, duration: 0.04, repeat: 3, yoyo: true });
    }
    setInput(val);
    if (val === snippet.code && !currentIsError) setFinished(true);
  };

  const nextSnippet = () => {
    gsap.to(".content-fade", {
      opacity: 0, scale: 0.98, filter: "blur(10px)", duration: 0.4, onComplete: () => {
        setLevel(l => (l + 1) % filteredPool.length);
        gsap.fromTo(".content-fade", { opacity: 0, scale: 1.02, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5 });
      }
    });
  };

  if (!mounted) return null;
  const progress = snippet ? Math.round((input.length / snippet.code.length) * 100) : 0;

  return (
    <div className="h-screen w-screen bg-[#050505] text-zinc-300 font-sans overflow-hidden flex flex-col items-center p-8">
      
      {/* HUD INFERIOR (GRAFICAS) */}
      <div className={`fixed bottom-10 left-10 right-10 flex items-center justify-between z-[100] transition-all duration-1000 ${finished ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="flex gap-4">
           <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl min-w-[180px] shadow-2xl">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2 mb-2"><VscPulse className={accent.class} /> SYSTEM_STABILITY</span>
             <div className="text-3xl font-mono font-black text-white">{isError ? "CRITICAL" : "OPTIMAL"}</div>
           </div>
           <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl min-w-[180px] shadow-2xl">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">TRANSFER_RATE</span>
             <div className="flex items-baseline gap-2">
               <span className="text-3xl font-mono font-black text-white">{wpm}</span>
               <span className={`${accent.class} text-xs font-bold uppercase`}>bps</span>
             </div>
           </div>
        </div>

        {autoPilot && finished && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 px-10 py-5 rounded-full backdrop-blur-2xl flex items-center gap-4">
            <VscLoading className="animate-spin text-emerald-400" />
            <span className="text-sm font-black text-emerald-400 tracking-widest uppercase italic">NEXT_JUMP: T-{countdown}</span>
          </div>
        )}

        <div className="flex gap-4">
           <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl min-w-[180px] text-right shadow-2xl">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">INTEGRITY</span>
             <div className="text-3xl font-mono font-black text-white">100<span className="text-xs ml-1 text-zinc-500">%</span></div>
           </div>
           <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl min-w-[180px] text-right shadow-2xl">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 block">MEM_LOAD</span>
             <div className="text-3xl font-mono font-black text-white">{(progress * 0.12).toFixed(1)}GB</div>
           </div>
        </div>
      </div>

      <div className="max-w-[1500px] w-full flex flex-col">
        {/* NAV BAR */}
        <nav className="flex h-20 items-center justify-between px-10 bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] shadow-3xl mb-8">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-6 border-r border-white/[0.1] pr-10">
              <VscDashboard className={accent.class} size={24} />
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">NeuralSync</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-2xl">
              {ACCENTS.map((a) => (
                <button key={a.name} onClick={() => setSelectedAccent(a)} className={`w-5 h-5 rounded-full transition-all ${selectedAccent.name === a.name ? "ring-2 ring-white scale-110" : "opacity-20"}`} style={{ backgroundColor: a.hex }} />
              ))}
            </div>
          </div>
        </nav>

        {snippet ? (
          <div className="content-fade grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-20">
            {/* SIDE INFO */}
            <aside className="space-y-10 pt-16">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-[10px] font-black uppercase text-zinc-500">
                  <VscServerProcess className={accent.class} /> {snippet.id}
                </div>
                <h1 className="text-7xl font-light text-white tracking-tighter leading-[1.1]">{snippet.title}</h1>
                <p className="text-zinc-400 text-xl font-mono italic opacity-50 leading-relaxed max-w-sm">
                  {snippet.description.split('|')[0]}
                </p>
              </div>
              <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] flex items-center justify-between">
                <VscLibrary className="text-zinc-700" size={32} />
                <div className="text-right uppercase">
                  <span className="text-[10px] font-black opacity-30 block mb-1">Architecture</span>
                  <span className="text-xl font-bold text-white tracking-wide">{snippet.category}</span>
                </div>
              </div>
            </aside>

            {/* TERMINAL AREA - MUCHO MÁS BAJA */}
            <div className="mt-28 space-y-14">
              {/* STATUS BAR SUPERIOR */}
              <div className="flex items-end justify-between px-10">
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-2">
                     <div className={`h-1.5 w-16 rounded-full ${progress > 10 ? accent.bg : 'bg-white/5'} transition-all shadow-sm`} />
                     <div className={`h-1.5 w-16 rounded-full ${progress > 50 ? accent.bg : 'bg-white/5'} transition-all shadow-sm`} />
                     <div className={`h-1.5 w-16 rounded-full ${progress > 90 ? accent.bg : 'bg-white/5'} transition-all shadow-sm`} />
                   </div>
                   <span className="text-[11px] font-black uppercase opacity-30 tracking-[0.6em] ml-1">Kernel_v4.0_Active</span>
                </div>
                <div className="text-right">
                   <div className={`${accent.class} text-6xl font-mono font-black italic tracking-tighter`}>{progress}<span className="text-lg ml-1 opacity-20">%</span></div>
                </div>
              </div>

              {/* TERMINAL BOX CON COLORES DINÁMICOS */}
              <div
                ref={terminalRef}
                className={`relative p-24 bg-[#020202] rounded-[4.5rem] border border-white/[0.08] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden cursor-text transition-all duration-700 ${accent.shadow.replace('shadow-', 'shadow-[0_0_90px_]')}`}
                onClick={() => textareaRef.current?.focus()}
              >
                {/* 1. Fondo Ghost Code (Guía muy tenue) */}
                <div className="absolute inset-24 opacity-[0.03] pointer-events-none select-none blur-[2px]">
                  <SyntaxHighlighter language={snippet.lang} style={atomDark} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }}>
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>

                {/* 2. Capa de Highlighting Real (Colores de código mientras escribes) */}
                <div className="relative z-10 pointer-events-none" style={MASTER_STYLE}>
                  {snippet.code.split("").map((char, i) => {
                    const isTyped = i < input.length;
                    const isCorrect = isTyped && input[i] === snippet.code[i];
                    
                    // Si el usuario ya escribió este caracter correctamente, mostramos el Highlighting real
                    // Para esto, usamos un Highlighter que solo renderiza hasta la posición del input
                    if (isTyped && isCorrect) {
                      return (
                        <span key={i} className="relative">
                          {/* El caracter renderizado con colores de Syntax Highlighter */}
                          <SyntaxHighlighter
                            language={snippet.lang}
                            style={atomDark}
                            PreTag="span"
                            CodeTag="span"
                            customStyle={{ display: 'inline', padding: 0, margin: 0, background: 'transparent', ...MASTER_STYLE }}
                          >
                            {char}
                          </SyntaxHighlighter>
                          {/* El cursor si es el último caracter */}
                          {i === input.length - 1 && !finished && (
                             <span className={`absolute right-[-3px] top-[0.2em] w-[3px] h-[1.1em] ${accent.bg} animate-pulse shadow-[0_0_15px_currentColor]`} />
                          )}
                        </span>
                      );
                    }

                    // Si hay error o no se ha escrito
                    return (
                      <span 
                        key={i} 
                        className={`transition-all ${isTyped ? "bg-red-500 text-white rounded-sm px-0.5" : "text-white/10"}`}
                      >
                        {i === input.length && (
                          <span className={`absolute inline-block w-[3px] h-[1.1em] translate-y-[0.2em] ${accent.bg} animate-pulse shadow-[0_0_20px_currentColor]`} />
                        )}
                        {char === " " ? "\u00A0" : char}
                      </span>
                    );
                  })}
                </div>

                <textarea
                  ref={textareaRef} value={input}
                  onChange={(e) => handleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      let next = input;
                      while (snippet.code[next.length] === " " && (next.length - input.length) < 4) next += " ";
                      handleInput(next);
                    }
                  }}
                  spellCheck={false} autoFocus
                  className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-none"
                />
              </div>

              {/* OUTPUT TERMINAL LOG */}
              <div className={`transition-all duration-1000 delay-300 ${finished ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="bg-white/[0.01] border border-white/[0.03] rounded-[3.5rem] p-12 shadow-2xl">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8 border-b border-white/[0.03] pb-6">
                    <VscTerminal className={accent.class} size={20} /> SYNC_RESULTS
                  </div>
                  <pre className="font-mono text-2xl text-zinc-500 leading-relaxed italic opacity-80">
                    {snippet.output}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}