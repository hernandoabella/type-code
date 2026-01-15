"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { VscTerminal, VscCode, VscLayers, VscChevronDown, VscMap } from "react-icons/vsc";
import { SiJavascript, SiTypescript, SiPython, SiReact } from "react-icons/si";
import gsap from "gsap";

/* =======================
   DATABASE (SNIPPETS)
======================= */
const SNIPPETS = [
  /* =======================
     JAVASCRIPT / REACT
  ======================= */
  { 
    id: "JS-1",
    title: "Atomic State",
    category: "Hooks",
    lang: "javascript",
    icon: <SiJavascript className="text-yellow-400" />,
    description: "A minimalist custom hook for atomic state management.",
    output: "{ count: 1, add: [Function] }",
    code: `const useCounter = (initial = 0) => {
  const [count, setCount] = useState(initial);
  const add = () => setCount(c => c + 1);
  return { count, add };
};`
  },

  {
    id: "JS-2",
    title: "Derived State",
    category: "Hooks",
    lang: "javascript",
    icon: <SiJavascript className="text-yellow-400" />,
    description: "Computing derived values without extra state.",
    output: "Total: 42",
    code: `const total = useMemo(() => {
  return items.reduce((a, b) => a + b, 0);
}, [items]);`
  },

  {
    id: "JS-3",
    title: "Controlled Input",
    category: "Forms",
    lang: "javascript",
    icon: <SiJavascript className="text-yellow-400" />,
    description: "Classic controlled input pattern in React.",
    output: "Input synced with state.",
    code: `const [value, setValue] = useState("");
<input value={value} onChange={e => setValue(e.target.value)} />;`
  },

  /* =======================
     TYPESCRIPT
  ======================= */
  { 
    id: "TS-1",
    title: "Abort Controller",
    category: "Async",
    lang: "typescript",
    icon: <SiTypescript className="text-blue-500" />,
    description: "Cleanup async requests using AbortController.",
    output: "Fetch aborted successfully.",
    code: `useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal });
  return () => controller.abort();
}, [url]);`
  },

  {
    id: "TS-2",
    title: "Discriminated Union",
    category: "Types",
    lang: "typescript",
    icon: <SiTypescript className="text-blue-500" />,
    description: "Type-safe logic using discriminated unions.",
    output: "Action handled safely.",
    code: `type Action =
  | { type: "add"; value: number }
  | { type: "remove"; id: string };

function reducer(action: Action) {
  if (action.type === "add") return action.value;
}`
  },

  {
    id: "TS-3",
    title: "Readonly Props",
    category: "Types",
    lang: "typescript",
    icon: <SiTypescript className="text-blue-500" />,
    description: "Prevent unintended mutation using readonly.",
    output: "Props protected.",
    code: `type Props = {
  readonly id: string;
  readonly name: string;
};`
  },

/* =======================
      PYTHON EXPANDED
  ======================= */
  { 
    id: "PY-1",
    title: "Prime Generator",
    category: "Logic",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Efficient prime number generation via list comprehension and mathematical optimization.",
    output: "[2, 3, 5, 7, 11]",
    code: `def get_primes(n):\n    return [x for x in range(2, n) if all(x % d != 0 for d in range(2, int(x**0.5) + 1))]`
  },
  {
    id: "PY-2",
    title: "Dict Comprehension",
    category: "Data",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Elegant collection transformation using zip and dictionary comprehension syntax.",
    output: "{'a': 1, 'b': 2}",
    code: `keys, values = ["a", "b"], [1, 2]\nresult = {k: v for k, v in zip(keys, values)}`
  },
  {
    id: "PY-3",
    title: "Generator Function",
    category: "Performance",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Memory-efficient lazy evaluation using the yield keyword for large sequences.",
    output: "Yielding values... [0, 1, 2]",
    code: `def count_up(n):\n    for i in range(n):\n        yield i`
  },
  {
    id: "PY-4",
    title: "Timing Decorator",
    category: "Meta",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Higher-order function to measure execution time of any wrapped callable.",
    output: "Execution time: 0.0042s",
    code: `def timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        return func(*args, **kwargs)\n    return wrapper`
  },
  {
    id: "PY-5",
    title: "Structural Pattern",
    category: "Logic",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Modern structural pattern matching for clean complex conditional branching.",
    output: "Handling 404 error...",
    code: `match status:\n    case 200: return "OK"\n    case 404: return "Not Found"\n    case _: return "System Error"`
  },
  {
    id: "PY-6",
    title: "Context Manager",
    category: "IO",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Safe resource handling using the 'with' statement and contextlib.",
    output: "File stream closed safely.",
    code: `with open("logs.txt", "a") as f:\n    f.write(f"\\n{timestamp}: Event triggered")`
  },
  {
    id: "PY-7",
    title: "Lambda Sorting",
    category: "Data",
    lang: "python",
    icon: <SiPython className="text-blue-400" />,
    description: "Complex collection sorting using anonymous functions as key selectors.",
    output: "[{'id': 1}, {'id': 5}, {'id': 9}]",
    code: `users.sort(key=lambda x: x['metadata']['created_at'])`
  },

  /* =======================
     REACT PERFORMANCE
  ======================= */
  { 
    id: "R-1",
    title: "Memoized Callback",
    category: "Hooks",
    lang: "typescript",
    icon: <SiReact className="text-cyan-400" />,
    description: "Prevent unnecessary re-renders with useCallback.",
    output: "Callback memoized.",
    code: `const handleClick = useCallback(() => {
  console.log("Clicked!", id);
}, [id]);`
  },

  {
    id: "R-2",
    title: "Component Memo",
    category: "Performance",
    lang: "typescript",
    icon: <SiReact className="text-cyan-400" />,
    description: "Optimize rendering with React.memo.",
    output: "Component skipped re-render.",
    code: `const Item = React.memo(function Item({ value }) {
  return <span>{value}</span>;
});`
  },

  {
    id: "R-3",
    title: "Lazy Import",
    category: "Performance",
    lang: "typescript",
    icon: <SiReact className="text-cyan-400" />,
    description: "Code-splitting using React.lazy.",
    output: "Component loaded on demand.",
    code: `const Dashboard = React.lazy(() =>
  import("./Dashboard")
);`
  }
];

const ACCENTS = [
  { name: "Cyber", class: "text-blue-400", bg: "bg-blue-400" },
  { name: "Neon", class: "text-pink-400", bg: "bg-pink-400" },
  { name: "Eco", class: "text-emerald-400", bg: "bg-emerald-400" },
];

const MASTER_STYLE: React.CSSProperties = {
  fontFamily: '"Fira Code", monospace',
  fontSize: "19px",
  lineHeight: "1.7",
  fontWeight: 500,
  tabSize: 4,
};

/* =======================
   COMPONENTS
======================= */

const LangIcon = ({ lang }: { lang: string }) => {
  switch (lang) {
    case "javascript": return <SiJavascript className="text-yellow-400" size={12} />;
    case "typescript": return <SiTypescript className="text-blue-500" size={12} />;
    case "python": return <SiPython className="text-blue-400" size={12} />;
    default: return <VscCode className="opacity-40" size={14} />;
  }
};

const CustomSelect = ({ label, value, options, onChange, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-full px-5 py-2 cursor-pointer transition-all active:scale-95"
      >
        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
          {Icon ? <Icon size={14} /> : <LangIcon lang={value} />}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest min-w-[80px]">
          {value === "all" ? label : value}
        </span>
        <VscChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} size={12} />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full min-w-[160px] bg-[#0f0f0f] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-[60] backdrop-blur-xl">
          {options.map((opt: string) => (
            <div 
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-white/[0.05] transition-colors ${value === opt ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {opt === "all" ? label : opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NeuralSyncFinal() {
  const [mounted, setMounted] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [isError, setIsError] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);
  const [countDown, setCountDown] = useState(3);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const filteredPool = useMemo(() => {
    return SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter) && (catFilter === "all" || s.category === catFilter));
  }, [langFilter, catFilter]);

  const categories = useMemo(() => {
    const cats = SNIPPETS.filter(s => langFilter === "all" || s.lang === langFilter).map(s => s.category);
    return ["all", ...Array.from(new Set(cats))];
  }, [langFilter]);

  const languages = ["all", "javascript", "typescript", "python"];
  const snippet = filteredPool[level];
  const accent = isError ? { class: "text-red-400", bg: "bg-red-400" } : selectedAccent;

  useEffect(() => setMounted(true), []);
  useEffect(() => { setInput(""); setFinished(false); setLevel(0); setIsError(false); }, [langFilter, catFilter]);

  useEffect(() => {
    if (!finished || !autoPilot || filteredPool.length <= 1) return;
    setCountDown(3);
    const timer = setInterval(() => {
      setCountDown((c) => {
        if (c <= 1) { nextSnippet(); return 3; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished, autoPilot, filteredPool, level]);

  const handleInput = (val: string) => {
    if (finished || !snippet || val.length > snippet.code.length) return;
    const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
    setIsError(currentIsError);
    if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
      gsap.fromTo(terminalRef.current, { x: -2 }, { x: 2, duration: 0.05, repeat: 2, yoyo: true });
    }
    setInput(val);
    if (val === snippet.code && !currentIsError) setFinished(true);
  };

  const nextSnippet = () => {
    gsap.to(".content-fade", { opacity: 0, y: -10, duration: 0.3, onComplete: () => {
      setInput(""); setFinished(false); setIsError(false);
      setLevel((l) => (l + 1) % filteredPool.length);
      gsap.to(".content-fade", { opacity: 1, y: 0, duration: 0.3 });
    }});
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-300 font-sans pb-32">
      <nav className="flex h-24 items-center justify-between px-12 border-b border-white/[0.03] sticky top-0 bg-[#080808]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${accent.bg} animate-pulse shadow-[0_0_8px_currentColor]`} />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Neural.Sync</span>
            </div>
          </div>

          <div className="flex gap-4">
            <CustomSelect label="Modules" value={langFilter} options={languages} onChange={setLangFilter} />
            <CustomSelect label="Categories" value={catFilter} options={categories} onChange={setCatFilter} icon={VscLayers} />
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <button 
            onClick={() => setAutoPilot(!autoPilot)} 
            className={`flex flex-col items-end group transition-all ${autoPilot ? "opacity-100" : "opacity-20 hover:opacity-40"}`}
          >
            <span className={`text-[10px] tracking-[0.2em] uppercase font-black ${autoPilot ? "text-emerald-400" : ""}`}>
              AutoPilot {autoPilot ? "[ON]" : "[OFF]"}
            </span>
            <div className={`h-[1px] mt-1 transition-all duration-500 ${autoPilot ? "w-full bg-emerald-400" : "w-0 bg-white"}`} />
          </button>

          <div className="flex items-center p-1.5 bg-white/[0.02] border border-white/[0.05] rounded-xl gap-1.5">
            {ACCENTS.map((a) => (
              <button 
                key={a.name} 
                onClick={() => setSelectedAccent(a)} 
                className={`relative px-3 py-1.5 rounded-lg transition-all duration-300 group overflow-hidden ${selectedAccent.name === a.name ? "bg-white/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.5)]" : "hover:bg-white/[0.04]"}`}
              >
                <div className="flex items-center gap-2 relative z-10">
                  <div className={`h-2.5 w-2.5 rounded-full ${a.bg} shadow-[0_0_8px_currentColor] transition-transform group-hover:scale-110`} />
                  <span className={`text-[9px] font-black tracking-widest uppercase transition-colors ${selectedAccent.name === a.name ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                    {a.name}
                  </span>
                </div>
                {selectedAccent.name === a.name && <div className={`absolute bottom-0 left-0 h-[2px] w-full ${a.bg} shadow-[0_0_10px_currentColor]`} />}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-24 px-6">
        {snippet ? (
          <div className="content-fade space-y-16">
            <header>
              <div className="flex items-center gap-6 mb-10">
                <div className="p-4 bg-white/[0.02] rounded-3xl border border-white/[0.05] text-3xl">{snippet.icon}</div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-[0.5em] mb-2 ${accent.class}`}>{snippet.category}</span>
                  <h1 className="text-7xl font-light text-white tracking-tighter leading-none">{snippet.title}</h1>
                </div>
              </div>
              
              {/* BIGGER DESCRIPTION */}
              <div className="max-w-3xl border-l-2 border-white/[0.05] pl-8 py-2">
                 <p className="text-zinc-400 text-xl font-mono leading-relaxed tracking-tight italic opacity-80">
                    {snippet.description}
                 </p>
              </div>
            </header>

            <div 
              ref={terminalRef} 
              className="relative p-12 bg-black/40 rounded-[3rem] border border-white/[0.05] shadow-3xl overflow-hidden cursor-text"
              onClick={() => textareaRef.current?.focus()}
            >
              <div className="absolute inset-12 opacity-[0.45] pointer-events-none select-none">
                <SyntaxHighlighter language={snippet.lang} style={atomDark} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }} codeTagProps={{ style: MASTER_STYLE }}>
                  {snippet.code}
                </SyntaxHighlighter>
              </div>

              <div className="relative z-10 whitespace-pre pointer-events-none" style={MASTER_STYLE}>
                {snippet.code.split("").map((char, i) => {
                  let color = "text-transparent";
                  if (i < input.length) {
                    color = input[i] === snippet.code[i] ? selectedAccent.class : "text-white bg-red-600 shadow-[0_0_15px_red]";
                  }
                  return (
                    <span key={i} className={`${color} transition-all duration-75`}>
                      {i === input.length && <span className={`absolute inline-block w-[2px] h-[1.2em] translate-y-[0.2em] ${accent.bg} animate-pulse shadow-[0_0_20px_white]`} />}
                      {input[i] || (char === " " ? "\u00A0" : char)}
                    </span>
                  );
                })}
              </div>

              <textarea 
                ref={textareaRef} value={input} 
                onChange={(e) => handleInput(e.target.value)} 
                onKeyDown={(e) => {
                  if(e.key === "Tab") {
                    e.preventDefault();
                    let next = input;
                    while(snippet.code[next.length] === " " && (next.length - input.length) < 4) next += " ";
                    handleInput(next);
                  }
                }}
                spellCheck={false} autoFocus 
                className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-none" 
              />
            </div>

            <div className={`transition-all duration-1000 ${finished ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12 pointer-events-none"}`}>
              <div className="grid grid-cols-[1fr_auto] gap-12 items-end">
                <div className="bg-white/[0.01] p-10 rounded-[2.5rem] border border-white/[0.04]">
                  <div className="flex items-center gap-3 mb-6 opacity-30 text-[10px] uppercase font-bold tracking-widest text-white">
                    <VscTerminal /> Runtime_Result {autoPilot && `:: Syncing in ${countDown}s`}
                  </div>
                  <div className="text-zinc-200 text-2xl font-mono tracking-tight leading-relaxed">
                    <span className="text-zinc-800 mr-6">❯</span>{snippet.output}
                  </div>
                </div>
                {!autoPilot && (
                  <button onClick={nextSnippet} className="h-20 w-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl">
                    <VscMap size={24} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}