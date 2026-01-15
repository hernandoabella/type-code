"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { VscChevronDown, VscServerProcess, VscTerminal, VscCircuitBoard, VscCode, VscLibrary, VscSymbolColor, VscRobot } from "react-icons/vsc";
import { SiJavascript, SiPython, SiReact, SiTypescript } from "react-icons/si";
import gsap from "gsap";

/* SNIPPETS CONFIGURATION */
const SNIPPETS = [
  { 
    id: "JS-1",
    title: "Atomic State",
    category: "Hooks",
    lang: "javascript",
    icon: <SiJavascript className="text-yellow-400" />,
    description: "A minimalist custom hook for atomic state management.",
    realLifeUsage: "Ideal para desacoplar la lógica de UI en componentes pequeños.",
    output: "{ count: 1, add: [Function] }",
    code: `const useCounter = (initial = 0) => {\n    const [count, setCount] = useState(initial);\n    const add = () => setCount(c => c + 1);\n    return { count, add };\n};`
  },
  { 
    id: "TS-1",
    title: "Abort Controller",
    category: "Async",
    lang: "typescript",
    icon: <SiTypescript className="text-blue-500" />,
    description: "Cleanup async requests using AbortController.",
    realLifeUsage: "Previene fugas de memoria al desmontar componentes.",
    output: "Fetch aborted successfully.",
    code: `useEffect(() => {\n    const controller = new AbortController();\n    fetch(url, { signal: controller.signal });\n    return () => controller.abort();\n}, [url]);`
  },
  { 
    id: "PY-1",
    title: "Prime Generator",
    category: "Logic",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Efficient prime number generation.",
    realLifeUsage: "Criptografía y simulaciones matemáticas.",
    output: "[2, 3, 5, 7, 11]",
    code: `def get_primes(n):\n    return [\n        x for x in range(2, n)\n        if all(x % d != 0 for d in range(2, int(x**0.5) + 1))\n    ]`
  }
];

const ACCENTS = [
  { name: "Cyber", class: "text-blue-400", bg: "bg-blue-400", shadow: "shadow-blue-500/40" },
  { name: "Neon", class: "text-pink-400", bg: "bg-pink-400", shadow: "shadow-pink-500/40" },
  { name: "Eco", class: "text-emerald-400", bg: "bg-emerald-400", shadow: "shadow-emerald-500/40" },
];

const MASTER_STYLE: React.CSSProperties = {
  fontFamily: '"Fira Code", monospace',
  fontSize: "19px",
  lineHeight: "1.7",
  fontWeight: 700, 
  tabSize: 4,
};

const CustomSelect = ({ label, value, options, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)} className="group flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-full px-4 py-1.5 cursor-pointer hover:bg-white/[0.06] transition-all">
        <span className="text-[9px] font-black uppercase tracking-widest min-w-[60px] opacity-60 text-white">{value === "all" ? label : value}</span>
        <VscChevronDown size={10} className={isOpen ? "rotate-180" : ""} />
      </div>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full min-w-[160px] bg-[#0f0f0f] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-[60] backdrop-blur-xl">
          {options.map((opt: string) => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className="px-5 py-2 text-[10px] font-bold uppercase cursor-pointer hover:bg-white/[0.05]">
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NeuralSyncMaster() {
  const [mounted, setMounted] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [isError, setIsError] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);
  const [autoWriting, setAutoWriting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);

  const filteredPool = useMemo(() => SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter) && (catFilter === "all" || s.category === catFilter)), [langFilter, catFilter]);
  const languages = useMemo(() => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))], []);
  const categories = useMemo(() => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.category)))], []);
  
  const snippet = filteredPool[level] || filteredPool[0];
  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;

  useEffect(() => setMounted(true), []);
  useEffect(() => { 
    setInput(""); 
    setFinished(false); 
    setStartTime(null); 
    setWpm(0); 
    if (autoWriting) startAutoWriting();
  }, [level, langFilter, catFilter]);

  // Lógica de Auto-Writing
  const startAutoWriting = () => {
    if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    let index = 0;
    autoWriteInterval.current = setInterval(() => {
      if (index <= snippet.code.length) {
        handleInput(snippet.code.slice(0, index));
        index++;
      } else {
        if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
      }
    }, 40); // Velocidad de escritura (40ms por caracter)
  };

  useEffect(() => {
    if (autoWriting && !finished) {
      startAutoWriting();
    } else if (!autoWriting) {
      if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    }
    return () => { if (autoWriteInterval.current) clearInterval(autoWriteInterval.current); };
  }, [autoWriting, snippet]);

  useEffect(() => {
    if (!finished || !autoPilot) return;
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
    if (val === snippet.code && !currentIsError) {
        setFinished(true);
        if (autoWriteInterval.current) clearInterval(autoWriteInterval.current);
    }
  };

  const nextSnippet = () => {
    gsap.to(".content-fade", {
      opacity: 0, scale: 0.98, duration: 0.3, onComplete: () => {
        setLevel(l => (l + 1) % filteredPool.length);
        gsap.fromTo(".content-fade", { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.4 });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autoWriting) return; // Desactivar teclado físico si el bot escribe
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = input.substring(0, start) + "    " + input.substring(end);
      handleInput(newValue);
    }
  };

  if (!mounted) return null;
  const progress = snippet ? Math.round((input.length / snippet.code.length) * 100) : 0;

  return (
    <div className="h-screen w-screen bg-[#050505] text-zinc-300 font-sans overflow-hidden flex items-center justify-center p-12">
      
      {/* HUD STATISTICS */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl">
        <div className="flex flex-col border-r border-white/10 pr-8 text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-4xl font-mono font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
          </div>
        </div>
        <div className="flex flex-col border-r border-white/10 pr-8 text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Precision</span>
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-4xl font-mono font-black text-white">{isError ? "92" : "100"}</span>
            <span className="text-zinc-500 text-[10px] font-bold">%</span>
          </div>
        </div>
        {autoPilot && finished && (
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Next</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 italic">T-{countdown}</div>
          </div>
        )}
      </div>

      <div className="max-w-[1400px] w-full flex flex-col gap-10">
        <nav className="flex h-16 items-center justify-between px-10 bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black text-white tracking-tighter italic">Type<span className={accent.class}>Code</span></span>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <CustomSelect label="Modules" value={langFilter} options={languages} onChange={setLangFilter} />
              <CustomSelect label="Categories" value={catFilter} options={categories} onChange={setCatFilter} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* BOTÓN AUTO-WRITING */}
            <button 
              onClick={() => setAutoWriting(!autoWriting)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase transition-all ${autoWriting ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "border-white/10 text-white/40"}`}
            >
              <VscRobot size={14} className={autoWriting ? "animate-bounce" : ""} />
              {autoWriting ? "Bot Writing..." : "Activate Bot"}
            </button>

            <button onClick={() => setAutoPilot(!autoPilot)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase transition-all ${autoPilot ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "border-white/10 text-white/40"}`}>
              <VscCircuitBoard size={14} className={autoPilot ? "animate-pulse" : ""} />
              {autoPilot ? "AutoPilot On" : "Manual Mode"}
            </button>
            
            <div className="flex items-center p-1 bg-white/[0.03] border border-white/5 rounded-xl">
              {ACCENTS.map((a) => (
                <button key={a.name} onClick={() => setSelectedAccent(a)} className={`p-2.5 rounded-lg transition-all ${selectedAccent.name === a.name ? "bg-white/10 text-white shadow-inner" : "text-zinc-600 hover:text-zinc-400"}`}>
                  <VscSymbolColor size={14} />
                </button>
              ))}
            </div>
          </div>
        </nav>

        {snippet ? (
          <div className="content-fade grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 items-start">
            <aside className="space-y-10 pt-4">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                  <VscServerProcess className={accent.class} /> Kernel_{snippet.lang.toUpperCase()}
                </div>
                <h1 className="text-6xl font-black text-white tracking-tighter leading-none uppercase">{snippet.title}</h1>
                <div className="space-y-4 border-l-2 border-white/5 pl-8">
                  <p className="text-zinc-400 text-lg font-medium leading-relaxed italic">{snippet.description}</p>
                  <p className="text-zinc-500 text-xs font-bold leading-relaxed uppercase tracking-widest"><span className={accent.class}>System_Log: </span>{snippet.realLifeUsage}</p>
                </div>
              </div>
            </aside>

            <div className="space-y-8">
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-[3.5rem] blur opacity-20 transition duration-1000 ${accent.bg}`} />
                <div ref={terminalRef} className="relative p-16 bg-[#080808] rounded-[3rem] border border-white/10 shadow-3xl overflow-hidden cursor-text transition-all duration-500" onClick={() => textareaRef.current?.focus()}>
                  
                  {/* CAPA GUÍA */}
                  <div className="absolute inset-16 opacity-[0.05] pointer-events-none select-none">
                    <SyntaxHighlighter language={snippet.lang} style={atomDark} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }} codeTagProps={{ style: MASTER_STYLE }}>
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>

                  {/* CAPA PRINCIPAL */}
                  <div className="relative z-10 whitespace-pre pointer-events-none" style={MASTER_STYLE}>
                    {snippet.code.split("").map((char, i) => {
                      let color = "text-zinc-600"; 
                      if (i < input.length) {
                        color = input[i] === snippet.code[i] ? selectedAccent.class : "text-white bg-red-600 rounded-sm";
                      }
                      return (
                        <span key={i} className={`${color} transition-colors duration-100`}>
                          {i === input.length && (
                            <span className={`absolute inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse`} />
                          )}
                          {input[i] || (char === " " ? "\u00A0" : char)}
                        </span>
                      );
                    })}
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoFocus
                    className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-none"
                    disabled={autoWriting}
                  />
                </div>
              </div>

              <div className={`transition-all duration-700 ${finished ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-500 mb-4 tracking-tighter">
                    <VscTerminal className={accent.class} /> Compiled_Output
                  </div>
                  <pre className="font-mono text-sm text-zinc-400 italic bg-black/40 p-4 rounded-xl">{snippet.output}</pre>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}