"use client";

import { useRef, useState, useEffect, useMemo, useCallback, JSX } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  atomDark, 
  dracula, 
  nord, 
  tomorrow 
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  VscChevronDown, VscTerminal, VscCircuitBoard, 
  VscRobot, VscChevronLeft, VscChevronRight, 
  VscRefresh, VscTypeHierarchy, VscColorMode,
  VscTarget, VscEye, VscEyeClosed, VscCode
} from "react-icons/vsc";
import { SiJavascript, SiPython, SiReact, SiTypescript } from "react-icons/si";
import gsap from "gsap";

/* =======================
   SNIPPETS CONFIGURATION
   World-Class Dev Library
======================= */

export type SnippetLang =
  | "javascript"
  | "typescript"
  | "python";

export type SnippetLevel =
  | "beginner"
  | "intermediate"
  | "advanced";

export type SnippetCategory =
  | "Hooks"
  | "Forms"
  | "Async"
  | "Types"
  | "Logic"
  | "Data"
  | "Performance";

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

/* =======================
   SNIPPETS DATABASE
======================= */

export const SNIPPETS: Snippet[] = [
  /* =======================
      JAVASCRIPT / REACT
  ======================= */
  {
    id: "JS-1",
    title: "Atomic State",
    category: "Hooks",
    lang: "javascript",
    level: "beginner",
    tags: ["state", "hooks", "react", "atomic"],
    bestPractice: true,
    icon: <SiJavascript className="text-yellow-400" />,
    description: "A minimalist custom hook for atomic state management.",
    realLifeUsage:
      "Perfect for encapsulating small, reusable state logic such as counters, toggles, or flags without cluttering the main component.",
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
    level: "intermediate",
    tags: ["useMemo", "performance", "derived-state"],
    bestPractice: true,
    icon: <SiJavascript className="text-yellow-400" />,
    description: "Compute derived values without introducing extra state.",
    realLifeUsage:
      "Prevents data inconsistencies and unnecessary re-renders by deriving values directly from existing state or props.",
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
    level: "beginner",
    tags: ["forms", "inputs", "controlled"],
    bestPractice: true,
    icon: <SiJavascript className="text-yellow-400" />,
    description: "Classic controlled input pattern in React.",
    realLifeUsage:
      "Industry standard for real-time validation and keeping the UI as the single source of truth.",
    output: "Input synced with state.",
    code: `const [value, setValue] = useState("");

<input
  value={value}
  onChange={e => setValue(e.target.value)}
/>;`
  },

  /* =======================
      TYPESCRIPT
  ======================= */
  {
    id: "TS-1",
    title: "Abort Controller",
    category: "Async",
    lang: "typescript",
    level: "intermediate",
    tags: ["fetch", "cleanup", "async"],
    bestPractice: true,
    icon: <SiTypescript className="text-blue-500" />,
    description: "Safely clean up async requests using AbortController.",
    realLifeUsage:
      "Prevents memory leaks and 'state update on unmounted component' errors during fast navigation.",
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
    level: "advanced",
    tags: ["types", "unions", "reducers"],
    bestPractice: true,
    icon: <SiTypescript className="text-blue-500" />,
    description: "Type-safe logic using discriminated unions.",
    realLifeUsage:
      "Allows TypeScript to infer exact types inside conditionals, eliminating undefined access bugs.",
    output: "Action handled safely.",
    code: `type Action =
  | { type: "add"; value: number }
  | { type: "remove"; id: string };

function reducer(action: Action) {
  if (action.type === "add") {
    return action.value;
  }
}`
  },

  {
    id: "TS-3",
    title: "Readonly Props",
    category: "Types",
    lang: "typescript",
    level: "beginner",
    tags: ["immutability", "props"],
    bestPractice: true,
    icon: <SiTypescript className="text-blue-500" />,
    description: "Prevent unintended mutation using readonly properties.",
    realLifeUsage:
      "Enforces immutability in large codebases and promotes predictable one-way data flow.",
    output: "Props protected.",
    code: `type Props = {
  readonly id: string;
  readonly name: string;
};`
  },

  /* =======================
      PYTHON
  ======================= */
  {
    id: "PY-1",
    title: "Prime Generator",
    category: "Logic",
    lang: "python",
    level: "intermediate",
    tags: ["math", "algorithms", "primes"],
    icon: <SiPython className="text-blue-400" />,
    description: "Efficient prime number generation.",
    realLifeUsage:
      "Commonly used in cryptography, data validation, and numerical analysis workflows.",
    output: "[2, 3, 5, 7, 11]",
    code: `def get_primes(n):
  return [
    x for x in range(2, n)
    if all(x % d != 0 for d in range(2, int(x ** 0.5) + 1))
  ]`
  },

  {
    id: "PY-2",
    title: "Dict Comprehension",
    category: "Data",
    lang: "python",
    level: "beginner",
    tags: ["dict", "comprehension", "data-transform"],
    bestPractice: true,
    icon: <SiPython className="text-blue-400" />,
    description: "Transform collections using dictionary comprehensions.",
    realLifeUsage:
      "A Pythonic and efficient way to reshape API responses or build fast lookup tables.",
    output: "{'a': 1, 'b': 2}",
    code: `keys = ["a", "b"]
values = [1, 2]

result = {k: v for k, v in zip(keys, values)}`
  },

  {
    id: "PY-3",
    title: "Generator Function",
    category: "Performance",
    lang: "python",
    level: "advanced",
    tags: ["generators", "lazy-evaluation"],
    bestPractice: true,
    icon: <SiPython className="text-blue-400" />,
    description: "Lazy evaluation using generator functions.",
    realLifeUsage:
      "Essential for processing large files or data streams without exhausting system memory.",
    output: "Yielding values...",
    code: `def count_up(n):
  for i in range(n):
    yield i`
  },

  /* =======================
      REACT PERFORMANCE
  ======================= */
  {
    id: "R-1",
    title: "Memoized Callback",
    category: "Hooks",
    lang: "typescript",
    level: "intermediate",
    tags: ["useCallback", "performance"],
    bestPractice: true,
    icon: <SiReact className="text-cyan-400" />,
    description: "Prevent unnecessary re-renders with useCallback.",
    realLifeUsage:
      "Critical when passing callbacks to memoized child components.",
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
    level: "intermediate",
    tags: ["React.memo", "render-optimization"],
    bestPractice: true,
    icon: <SiReact className="text-cyan-400" />,
    description: "Optimize rendering with React.memo.",
    realLifeUsage:
      "Ideal for large lists or complex UI components that should only re-render on specific prop changes.",
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
    level: "advanced",
    tags: ["code-splitting", "lazy-loading"],
    bestPractice: true,
    icon: <SiReact className="text-cyan-400" />,
    description: "Split code using React.lazy for on-demand loading.",
    realLifeUsage:
      "Dramatically reduces initial bundle size by loading components only when they are needed.",
    output: "Component loaded on demand.",
    code: `const Dashboard = React.lazy(() =>
  import("./Dashboard")
);`
  }
];


const LANG_ICONS: Record<string, JSX.Element> = {
  all: <VscCode className="text-zinc-400" />,
  javascript: <SiJavascript className="text-yellow-400" />,
  typescript: <SiTypescript className="text-blue-500" />,
  python: <SiPython className="text-blue-400" />,
};

const ACCENTS = [
  { name: "Cyber", class: "text-blue-400", bg: "bg-blue-400", shadow: "shadow-blue-500/60" },
  { name: "Neon", class: "text-pink-400", bg: "bg-pink-400", shadow: "shadow-pink-500/60" },
  { name: "Eco", class: "text-emerald-400", bg: "bg-emerald-400", shadow: "shadow-emerald-500/60" },
];

const FONTS = [
  { name: "Fira Code", family: '"Fira Code", monospace' },
  { name: "JetBrains Mono", family: '"JetBrains Mono", monospace' },
  { name: "Source Code", family: '"Source Code Pro", monospace' },
];

const HIGHLIGHT_THEMES = [
  { name: "Atom Dark", style: atomDark },
  { name: "Dracula", style: dracula },
  { name: "Nord", style: nord },
  { name: "Tomorrow", style: tomorrow },
];

const CustomSelect = ({ label, value, options, onChange, icon: Icon, isLang = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)} className="group flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-full px-4 py-1.5 cursor-pointer hover:bg-white/[0.06] transition-all">
        {isLang ? (LANG_ICONS[value] || <VscCode size={12}/>) : (Icon && <Icon size={12} className="opacity-40" />)}
        <span className="text-[9px] font-black uppercase tracking-widest min-w-[60px] opacity-60 text-white font-sans">{value === "all" ? label : value}</span>
        <VscChevronDown size={10} className={isOpen ? "rotate-180" : ""} />
      </div>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full min-w-[220px] bg-[#0f0f0f] border border-white/[0.08] rounded-2xl shadow-2xl py-2 z-[60] backdrop-blur-xl max-h-60 overflow-y-auto font-sans">
          {options.map((opt: any) => {
            const labelStr = typeof opt === 'string' ? opt : opt.name;
            const categoryMatch = SNIPPETS.find(s => s.lang === labelStr)?.category;

            return (
              <div key={labelStr} onClick={() => { onChange(opt); setIsOpen(false); }} className="px-5 py-2.5 text-[10px] font-bold uppercase cursor-pointer hover:bg-white/[0.05] flex items-center justify-between group/item transition-colors">
                <div className="flex items-center gap-3">
                  {isLang && (LANG_ICONS[labelStr] || <VscCode size={12}/>)}
                  <span className="text-zinc-300 group-hover/item:text-white">{labelStr}</span>
                </div>
                {isLang && categoryMatch && (
                  <span className="text-[8px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-500 border border-white/5 group-hover/item:border-white/10 group-hover/item:text-zinc-300 transition-all">
                    {categoryMatch}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function NeuralSyncMaster() {
  const [mounted, setMounted] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [editorTheme, setEditorTheme] = useState(HIGHLIGHT_THEMES[0]);
  const [isError, setIsError] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [autoPilot, setAutoPilot] = useState(true);
  const [autoWriting, setAutoWriting] = useState(false);
  const [isTimeActive, setIsTimeActive] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [isGhostActive, setIsGhostActive] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const autoWriteInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredPool = useMemo(() => SNIPPETS.filter(s => (langFilter === "all" || s.lang === langFilter)), [langFilter]);
  const languages = useMemo(() => ["all", ...Array.from(new Set(SNIPPETS.map(s => s.lang)))], []);
  
  const snippet = filteredPool[level] || filteredPool[0];
  const accent = isError ? { class: "text-red-500", bg: "bg-red-500", shadow: "shadow-red-500/40" } : selectedAccent;
  const isFocusMode = useMemo(() => (input.length > 0 || autoWriting) && !finished, [input, autoWriting, finished]);

  const MASTER_STYLE = useMemo(() => ({
    fontFamily: selectedFont.family,
    fontSize: "19px",
    lineHeight: "1.7",
    fontWeight: 700, 
    tabSize: 4,
  }), [selectedFont]);

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

  // INITIAL MOUNT: Load all settings from localStorage
  useEffect(() => {
    setMounted(true);
    
    const savedLevel = localStorage.getItem('current_level');
    const savedGhost = localStorage.getItem('ghost_active');
    const savedBot = localStorage.getItem('bot_active');
    const savedAuto = localStorage.getItem('auto_pilot');
    const savedAccent = localStorage.getItem('selected_accent');
    const savedFont = localStorage.getItem('selected_font');
    const savedTheme = localStorage.getItem('editor_theme');
    const savedLang = localStorage.getItem('lang_filter');

    if (savedLevel) setLevel(parseInt(savedLevel));
    if (savedGhost !== null) setIsGhostActive(savedGhost === 'true');
    if (savedBot !== null) setAutoWriting(savedBot === 'true');
    if (savedAuto !== null) setAutoPilot(savedAuto === 'true');
    if (savedLang) setLangFilter(savedLang);
    
    if (savedAccent) {
      const found = ACCENTS.find(a => a.name === savedAccent);
      if (found) setSelectedAccent(found);
    }
    if (savedFont) {
      const found = FONTS.find(f => f.name === savedFont);
      if (found) setSelectedFont(found);
    }
    if (savedTheme) {
      const found = HIGHLIGHT_THEMES.find(t => t.name === savedTheme);
      if (found) setEditorTheme(found);
    }
  }, []);

  // PERSISTENCE SYNC: Watch for changes and update localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('current_level', level.toString());
    localStorage.setItem('ghost_active', isGhostActive.toString());
    localStorage.setItem('bot_active', autoWriting.toString());
    localStorage.setItem('auto_pilot', autoPilot.toString());
    localStorage.setItem('selected_accent', selectedAccent.name);
    localStorage.setItem('selected_font', selectedFont.name);
    localStorage.setItem('editor_theme', editorTheme.name);
    localStorage.setItem('lang_filter', langFilter);
  }, [level, isGhostActive, autoWriting, autoPilot, selectedAccent, selectedFont, editorTheme, langFilter, mounted]);

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
    const dec = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${dec}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autoWriting || finished) return;
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = input.substring(0, start) + "    " + input.substring(end);
      handleInput(newValue);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-screen bg-[#050505] text-zinc-300 font-sans flex items-start justify-center p-8 lg:p-12 py-20 lg:py-32">
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-8 bg-black/80 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2rem] shadow-2xl">
        <div className="flex flex-col border-r border-white/10 pr-8 text-center min-w-[80px]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Velocity</span>
          <div className="flex items-baseline gap-2 justify-center font-mono">
            <span className="text-4xl font-black text-white">{wpm}</span>
            <span className={`${accent.class} text-[10px] font-bold`}>WPM</span>
          </div>
        </div>
        <div className={`flex flex-col border-r border-white/10 pr-8 text-center transition-opacity duration-500 min-w-[120px] ${isTimeActive ? 'opacity-100' : 'opacity-20'}`}>
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
        <nav className="flex h-16 items-center justify-between px-10 bg-[#0a0a0a] border border-white/5 rounded-3xl shadow-2xl shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black text-white tracking-tighter italic">Type<span className={accent.class}>Code</span></span>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <CustomSelect label="Modules" value={langFilter} options={languages} onChange={setLangFilter} isLang={true} />
              <CustomSelect label="Fonts" value={selectedFont.name} options={FONTS} onChange={setSelectedFont} icon={VscTypeHierarchy} />
              <CustomSelect label="Themes" value={editorTheme.name} options={HIGHLIGHT_THEMES} onChange={setEditorTheme} icon={VscColorMode} />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsGhostActive(!isGhostActive)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase transition-all ${isGhostActive ? "bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "bg-white/5 border-white/20 text-white"}`}>
               {isGhostActive ? <VscEyeClosed size={14} /> : <VscEye size={14} />} Ghost: {isGhostActive ? "On" : "Off"}
             </button>
             <button onClick={() => setAutoWriting(!autoWriting)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase transition-all ${autoWriting ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-white/10 text-white/40"}`}><VscRobot size={14} /> Bot</button>
             <button onClick={() => setAutoPilot(!autoPilot)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase transition-all ${autoPilot ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "border-white/10 text-white/40"}`}><VscCircuitBoard size={14} /> Auto</button>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full">
              {ACCENTS.map((a) => (
                <button key={a.name} onClick={() => setSelectedAccent(a)} className={`w-3.5 h-3.5 rounded-full transition-all ${a.bg} ${selectedAccent.name === a.name ? "scale-125 shadow-[0_0_10px_currentColor]" : "opacity-20 hover:opacity-50"}`} />
              ))}
            </div>
          </div>
        </nav>

        {snippet ? (
          <div className="content-fade grid grid-cols-1 lg:grid-cols-[1fr] gap-0 items-start relative h-full">
            <div className={`transition-all duration-700 ease-in-out flex flex-col gap-6 absolute left-0 top-0 z-0 ${isFocusMode ? 'w-0 opacity-0 -translate-x-20 pointer-events-none' : 'w-[400px] opacity-100 translate-x-0'}`}>
                <div className="space-y-6 pr-10">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-white/5 border border-white/10`}>{LANG_ICONS[snippet.lang]}</div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{snippet.category}</span>
                  </div>
                  <h1 className="text-6xl font-black text-white tracking-tighter leading-none uppercase font-sans">{snippet.title}</h1>
                  <div className="space-y-6 italic text-zinc-400 text-lg border-l-2 border-white/5 pl-6 font-sans leading-relaxed">{snippet.description}</div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-4 font-sans">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white/30 tracking-widest"><VscTarget className={accent.class} /> Use_Case</div>
                    <p className="text-sm font-bold text-zinc-300 leading-relaxed uppercase">{snippet.realLifeUsage}</p>
                  </div>
                </div>
            </div>

            <div className={`transition-all duration-700 ease-in-out w-full ${isFocusMode ? 'pl-0' : 'pl-[420px]'} space-y-8 relative z-10 h-auto`}>
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-[3.5rem] blur opacity-10 transition duration-1000 ${accent.bg}`} />
                
                <button 
                  onClick={resetCurrentSnippet} 
                  className={`absolute top-8 right-8 z-50 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 active:scale-90 flex items-center gap-3 group/btn ${isFocusMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                >
                  <VscRefresh size={18} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Abort & Reset</span>
                </button>

                <div ref={terminalRef} className={`relative p-16 bg-[#080808] rounded-[3.5rem] border border-white/10 shadow-3xl transition-all duration-700 h-auto overflow-visible ${isFocusMode ? 'scale-[1.01]' : 'scale-100'}`} onClick={() => textareaRef.current?.focus()}>
                  <div className="opacity-20 pointer-events-none select-none transition-all duration-500" style={isGhostActive ? { maskImage: 'linear-gradient(to right, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 40%)', filter: 'blur(4px)' } : {}}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }} codeTagProps={{ style: MASTER_STYLE }}>{snippet.code}</SyntaxHighlighter>
                  </div>
                  
                  <div className="absolute inset-0 p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
                    <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", overflow: "visible" }} codeTagProps={{ style: { ...MASTER_STYLE, color: 'inherit' } }}>{input}</SyntaxHighlighter>
                    <div className="absolute top-16 left-16 whitespace-pre pointer-events-none">
                        <span className="invisible">{input}</span>
                        {input.length < snippet.code.length && (
                            <>
                                <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse`} />
                                <span className={`transition-all duration-300 ${isGhostActive ? 'text-zinc-400' : 'text-zinc-500'}`} style={isGhostActive ? { maskImage: 'linear-gradient(to right, black 0%, transparent 250px)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 250px)', filter: 'blur(1px) drop-shadow(0 0 4px rgba(255,255,255,0.3))' } : {}}>{snippet.code.slice(input.length)}</span>
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
                  <span className="text-[10px] font-black uppercase text-white/40 group-hover:text-white font-sans">Retry</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}