"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { VscCheck, VscTerminal } from "react-icons/vsc";
import gsap from "gsap";

/* =======================
   SNIPPETS DATABASE
======================= */
const SNIPPETS = [
  { 
    id: "JS-1", 
    title: "Atomic State", 
    category: "Hooks", 
    lang: "javascript", 
    description: "Un hook simple para manejar un contador atómico.",
    output: "{ count: 1, add: [Function] }",
    code: `const useCounter = (initial = 0) => {\n    const [count, setCount] = useState(initial);\n    const add = () => setCount(c => c + 1);\n    return { count, add };\n};` 
  },
  { 
    id: "TS-1", 
    title: "Abort Controller", 
    category: "Async", 
    lang: "typescript", 
    description: "Limpieza de peticiones fetch para evitar memory leaks.",
    output: "Fetch aborted: successfully cleaned up.",
    code: `useEffect(() => {\n    const controller = new AbortController();\n    fetch(url, { signal: controller.signal });\n    return () => controller.abort();\n}, [url]);` 
  },
];

const ACCENTS = [
  { name: "Cyber", class: "text-blue-400", bg: "bg-blue-400" },
  { name: "Neon", class: "text-pink-400", bg: "bg-pink-400" },
  { name: "Eco", class: "text-emerald-400", bg: "bg-emerald-400" },
];

const MASTER_STYLE: React.CSSProperties = {
  fontFamily: '"Fira Code", monospace',
  fontSize: "18px",
  lineHeight: "1.7",
  fontWeight: 450,
  tabSize: 4,
};

export default function NeuralSyncSimple() {
  const [mounted, setMounted] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [isError, setIsError] = useState(false);
  
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);
  const [countDown, setCountDown] = useState(3);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const snippet = SNIPPETS[level] || SNIPPETS[0];
  const accent = isError ? { class: "text-red-400", bg: "bg-red-400" } : selectedAccent;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!finished || !autoPilot) return;
    setCountDown(3);
    const timer = setInterval(() => {
      setCountDown((c) => {
        if (c <= 1) { 
          nextSnippet(); 
          return 3; 
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished, autoPilot]);

  const handleInput = (val: string) => {
    if (finished || val.length > snippet.code.length) return;
    const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
    setIsError(currentIsError);

    if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
      gsap.fromTo(terminalRef.current, { x: -2 }, { x: 2, duration: 0.05, repeat: 2, yoyo: true });
    }

    setInput(val);
    if (val === snippet.code) setFinished(true);
  };

  const nextSnippet = () => {
    gsap.to(".content-fade", { opacity: 0, duration: 0.2, onComplete: () => {
      setInput("");
      setFinished(false);
      setIsError(false);
      setLevel((l) => (l + 1) % SNIPPETS.length);
      gsap.to(".content-fade", { opacity: 1, duration: 0.2 });
    }});
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-zinc-800">
      {/* Header Minimalista */}
      <nav className="flex h-20 items-center justify-between px-12">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${accent.bg} transition-colors duration-500`} />
          <span className="text-[11px] font-medium tracking-widest uppercase opacity-50">Sync</span>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setAutoPilot(!autoPilot)}
            className={`text-[10px] tracking-widest uppercase transition-opacity hover:opacity-100 ${autoPilot ? "opacity-100 text-emerald-400" : "opacity-30"}`}
          >
            Auto {autoPilot ? "On" : "Off"}
          </button>
          <div className="flex gap-3">
            {ACCENTS.map((a) => (
              <button 
                key={a.name} 
                onClick={() => setSelectedAccent(a)} 
                className={`h-3 w-3 rounded-full transition-transform hover:scale-125 ${a.bg} ${selectedAccent.name === a.name ? "opacity-100 ring-4 ring-white/10" : "opacity-20"}`}
              />
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-12 px-6">
        <div className="content-fade space-y-12">
          {/* Título y Descripción simple */}
          <section className="space-y-2">
            <h1 className="text-4xl font-light text-white tracking-tight">{snippet.title}</h1>
            <p className="text-zinc-500 text-sm font-light">{snippet.description}</p>
          </section>

          {/* Terminal sin bordes ni sombras pesadas */}
          <div 
            ref={terminalRef} 
            className="relative min-h-[300px] cursor-none"
            onClick={() => textareaRef.current?.focus()}
          >
            <div className="relative z-10 p-2">
              {/* Fondo Guía (Sintaxis) */}
              <div className="opacity-10 pointer-events-none select-none">
                <SyntaxHighlighter 
                  language={snippet.lang} 
                  style={atomDark} 
                  codeTagProps={{ style: MASTER_STYLE }} 
                  customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }}
                >
                  {snippet.code}
                </SyntaxHighlighter>
              </div>

              {/* Capa de Escritura Real */}
              <div className="absolute inset-0 p-2 whitespace-pre pointer-events-none" style={MASTER_STYLE}>
                {snippet.code.split("").map((char, i) => {
                  let color = "text-transparent";
                  if (i < input.length) {
                    color = input[i] === snippet.code[i] ? selectedAccent.class : "text-red-400";
                  }
                  return (
                    <span key={i} className={`${color} relative transition-colors duration-150`}>
                      {i === input.length && (
                        <span className={`absolute left-0 top-0 h-full w-[1.5px] ${accent.bg} animate-pulse`} />
                      )}
                      {input[i] !== undefined 
                        ? (input[i] === " " ? "\u00A0" : input[i]) 
                        : (char === " " ? "\u00A0" : char)}
                    </span>
                  );
                })}
              </div>
            </div>

            <textarea 
              ref={textareaRef} 
              value={input} 
              onChange={(e) => handleInput(e.target.value)} 
              onKeyDown={(e) => {
                if(e.key === "Tab") {
                  e.preventDefault();
                  let next = input;
                  for(let i=0; i<4; i++) if(snippet.code[next.length] === " ") next += " ";
                  handleInput(next);
                }
              }}
              spellCheck={false} 
              autoFocus 
              className="absolute inset-0 w-full h-full opacity-0 cursor-none" 
            />
          </div>

          {/* Footer de Output Simple */}
          <div className={`transition-all duration-700 ${finished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="pt-8 border-t border-zinc-900 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <VscCheck className="text-emerald-500" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-500">Sync Complete</span>
                {autoPilot && <span className="text-[10px] text-zinc-600 ml-auto">Next in {countDown}s</span>}
              </div>
              
              <div className="bg-[#0f0f0f] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <VscTerminal size={12} />
                  <span className="text-[9px] uppercase font-bold tracking-widest">Output</span>
                </div>
                <div className="text-zinc-400 text-sm italic font-mono">
                   {snippet.output}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}