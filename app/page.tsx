"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SiTypescript, SiJavascript, SiPython, SiRust } from "react-icons/si";
import { VscTerminal, VscCheckAll, VscColorMode, VscArrowRight } from "react-icons/vsc";
import gsap from "gsap";

const SNIPPETS = [
  { id: "L1", lang: "typescript", category: "Hooks", title: "Typed State", description: "Standard generic state initialization.", code: `const [data, setData] = useState<User[]>([]);`, output: "TS: User array state initialized." },
  { id: "L2", lang: "javascript", category: "Patterns", title: "Optional Chaining", description: "Safe deep property access.", code: `const val = response?.data?.user?.id ?? 0;`, output: "JS: Null-safe extraction complete." },
  { id: "L4", lang: "python", category: "Logic", title: "List Comprehension", description: "Pythonic way to square numbers.", code: `squares = [x**2 for x in range(10)]`, output: "PY: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]" },
  { id: "L6", lang: "rust", category: "Memory", title: "Ownership", description: "Memory move semantics.", code: `let s1 = String::from("hello");\nlet s2 = s1;`, output: "RS: Memory moved successfully." },
];

const THEMES = ["night", "luxury", "cyberpunk", "dracula", "retro", "coffee"];
const LANGUAGES = ["All", "typescript", "javascript", "python", "rust"];

const LangIcon = ({ lang }: { lang: string }) => {
  switch (lang.toLowerCase()) {
    case 'typescript': return <SiTypescript className="text-[#3178C6]" />;
    case 'javascript': return <SiJavascript className="text-[#F7DF1E]" />;
    case 'python': return <SiPython className="text-[#3776AB]" />;
    case 'rust': return <SiRust className="text-orange-600" />;
    default: return <VscTerminal />;
  }
};

const MASTER_STYLE = { fontFamily: '"Fira Code", monospace', fontSize: "18px", lineHeight: "1.7" };

export default function DaisyTyper() {
  const [theme, setTheme] = useState("night");
  const [selectedLang, setSelectedLang] = useState("All");
  const [selectedCat, setSelectedCat] = useState("All");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [timer, setTimer] = useState(3);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const pool = useMemo(() => {
    return SNIPPETS.filter(s => 
      (selectedLang === "All" || s.lang === selectedLang) && 
      (selectedCat === "All" || s.category === selectedCat)
    ).sort(() => Math.random() - 0.5);
  }, [selectedLang, selectedCat]);

  const snippet = pool[currentIdx];

  useEffect(() => {
    if (isWaiting && autoNext) {
      const countdown = setInterval(() => {
        setTimer(t => { if (t <= 1) { handleNext(); return 3; } return t - 1; });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [isWaiting, autoNext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = (e.target as HTMLTextAreaElement).selectionStart;
      const end = (e.target as HTMLTextAreaElement).selectionEnd;
      const newValue = input.substring(0, start) + "  " + input.substring(end);
      if (newValue.length <= (snippet?.code.length || 0)) {
        setInput(newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    }
  };

  const handleInput = (val: string) => {
    if (isWaiting || !snippet) return;
    if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
      gsap.fromTo(terminalRef.current, { x: -4 }, { x: 4, duration: 0.05, repeat: 3, yoyo: true });
    }
    setInput(val);
    if (val === snippet.code) setIsWaiting(true);
  };

  const handleNext = () => {
    setIsWaiting(false);
    setTimer(3);
    if (currentIdx < pool.length - 1) {
      gsap.to(".content-layer", { opacity: 0, duration: 0.2, onComplete: () => {
        setCurrentIdx(prev => prev + 1);
        setInput("");
        gsap.to(".content-layer", { opacity: 1, duration: 0.2 });
      }});
    }
  };

  return (
    <div data-theme={theme} className="min-h-screen bg-base-300 transition-colors duration-500 p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* NAVBAR / HEADER */}
        <div className="navbar bg-base-100 shadow-xl rounded-box border border-base-content/10 px-6">
          <div className="flex-1 gap-2">
            <VscTerminal className="text-2xl text-primary" />
            <span className="text-lg font-black tracking-tighter uppercase">Neural.Typer</span>
          </div>
          <div className="flex-none gap-4">
            {/* THEME DROPDOWN */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-sm rounded-btn gap-2">
                <VscColorMode /> Theme
              </label>
              <ul tabIndex={0} className="menu dropdown-content z-[1] p-2 shadow bg-base-200 rounded-box w-52 mt-4 border border-base-content/10">
                {THEMES.map(t => (
                  <li key={t}><button onClick={() => setTheme(t)} className="capitalize font-bold">{t}</button></li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold opacity-50">AUTO</span>
              <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={autoNext} onChange={() => setAutoNext(!autoNext)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR FILTERS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card bg-base-100 shadow-xl border border-base-content/10">
              <div className="card-body p-6">
                <h2 className="card-title text-xs uppercase tracking-[0.2em] opacity-50 mb-4">Runtime</h2>
                <div className="flex flex-col gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l} onClick={() => { setSelectedLang(l); setInput(""); setCurrentIdx(0); }}
                      className={`btn btn-sm justify-start gap-3 ${selectedLang === l ? "btn-primary" : "btn-ghost"}`}>
                      <LangIcon lang={l} /> {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN TERMINAL AREA */}
          <div className="lg:col-span-3 space-y-6">
            <div ref={terminalRef} className="card bg-base-100 shadow-2xl border-2 border-base-content/5 overflow-hidden" onClick={() => textareaRef.current?.focus()}>
              {/* TERMINAL HEADER */}
              <div className="bg-base-200/50 px-8 py-4 flex justify-between items-center border-b border-base-content/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <div className="badge badge-outline badge-sm font-bold opacity-50">{snippet?.lang} // {snippet?.category}</div>
              </div>

              <div className="card-body content-layer p-12 min-h-[450px]">
                {snippet ? (
                  <>
                    <div className="mb-10">
                      <h1 className="text-4xl font-black italic uppercase tracking-tighter text-primary mb-2">{snippet.title}</h1>
                      <p className="opacity-60 text-sm font-medium">{snippet.description}</p>
                    </div>

                    <div className="relative">
                      {/* GHOST TEXT (Base Text Color) */}
                      <div className="opacity-20 select-none whitespace-pre" style={MASTER_STYLE}>
                        {snippet.code}
                      </div>

                      {/* ACTIVE TYPING */}
                      <div className="absolute inset-0 whitespace-pre pointer-events-none z-10" style={MASTER_STYLE}>
                        {snippet.code.split("").map((char, i) => {
                          const isTyped = i < input.length;
                          const isCorrect = isTyped && input[i] === char;
                          const isWrong = isTyped && input[i] !== char;

                          return (
                            <span key={i} className="relative">
                              {isCorrect && <span className="text-secondary drop-shadow-[0_0_8px_currentColor]">{char}</span>}
                              {isWrong && <span className="bg-error text-error-content rounded-sm">{char === " " ? " " : char}</span>}
                              {i === input.length && !isWaiting && (
                                <span className="absolute left-0 top-0 w-[2px] h-[1.2em] bg-primary animate-pulse shadow-[0_0_10px_currentColor]" />
                              )}
                            </span>
                          );
                        })}
                      </div>

                      <textarea
                        ref={textareaRef}
                        value={input}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => handleInput(e.target.value)}
                        spellCheck={false}
                        autoFocus
                        className="absolute inset-0 w-full h-full opacity-0 cursor-none resize-none outline-none z-20"
                        style={MASTER_STYLE}
                      />
                    </div>

                    {/* DYNAMIC FOOTER */}
                    <div className={`mt-12 transition-all duration-700 ${isWaiting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                      <div className="alert alert-success shadow-lg rounded-2xl py-4">
                        <VscCheckAll className="text-xl" />
                        <div className="flex justify-between w-full items-center">
                          <span className="font-bold italic text-sm">{snippet.output}</span>
                          {autoNext ? <span className="badge badge-sm font-black italic">NEXT IN {timer}S</span> : <button onClick={handleNext} className="btn btn-xs btn-ghost">CONTINUE <VscArrowRight /></button>}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[300px] opacity-20 font-black">SYSTEM_OFFLINE</div>
                )}
              </div>
            </div>

            {/* STATS HUD */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stats shadow bg-base-100 border border-base-content/5">
                <div className="stat p-4">
                  <div className="stat-title text-[10px] font-black uppercase tracking-widest">Progress</div>
                  <div className="stat-value text-2xl text-primary">{currentIdx + 1}/{pool.length}</div>
                </div>
              </div>
              <div className="stats shadow bg-base-100 border border-base-content/5">
                <div className="stat p-4">
                  <div className="stat-title text-[10px] font-black uppercase tracking-widest">Accuracy</div>
                  <div className="stat-value text-2xl text-secondary">98%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}