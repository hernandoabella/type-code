
import { JSX } from "react";
import { 
  VscEyeClosed, VscEye, VscRobot, VscCircuitBoard, 
  VscCode 
} from "react-icons/vsc";
import { SiJavascript, SiPython, SiReact, SiTypescript } from "react-icons/si";
import { 
  atomDark, 
  dracula, 
  nord, 
  tomorrow 
} from "react-syntax-highlighter/dist/esm/styles/prism";

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

export const SNIPPETS: Snippet[] = [
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
    realLifeUsage: "Perfect for encapsulating small, reusable state logic such as counters, toggles, or flags.",
    output: "{ count: 1, add: [Function] }",
    code: `const useCounter = (initial = 0) => {
  const [count, setCount] = useState(initial);

  const add = () => setCount(c => c + 1);

  return { count, add };
};`
  },
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
    realLifeUsage: "Prevents memory leaks and state update errors during fast navigation.",
    output: "Fetch aborted successfully.",
    code: `useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal });

  return () => controller.abort();
}, [url]);`
  },
  {
    id: "PY-1",
    title: "Prime Generator",
    category: "Logic",
    lang: "python",
    level: "intermediate",
    tags: ["math", "algorithms", "primes"],
    icon: <SiPython className="text-blue-400" />,
    description: "Efficient prime number generation.",
    realLifeUsage: "Commonly used in cryptography and numerical analysis workflows.",
    output: "[2, 3, 5, 7, 11]",
    code: `def get_primes(n):
  return [
    x for x in range(2, n)
    if all(x % d != 0 for d in range(2, int(x ** 0.5) + 1))
  ]`
  },
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
    realLifeUsage: "Critical when passing callbacks to memoized child components.",
    output: "Callback memoized.",
    code: `const handleClick = useCallback(() => {
  console.log("Clicked!", id);
}, [id]);`
  },
];

export const LANG_ICONS: Record<string, JSX.Element> = {
  all: <VscCode className="text-zinc-400" />,
  javascript: <SiJavascript className="text-yellow-400" />,
  typescript: <SiTypescript className="text-blue-500" />,
  python: <SiPython className="text-blue-400" />,
};

export const ACCENTS = [
  { name: "Cyber", class: "text-blue-400", bg: "bg-blue-400", shadow: "shadow-blue-500/60" },
  { name: "Neon", class: "text-pink-400", bg: "bg-pink-400", shadow: "shadow-pink-500/60" },
  { name: "Eco", class: "text-emerald-400", bg: "bg-emerald-400", shadow: "shadow-emerald-500/60" },
];

export const FONTS = [
  { name: "Fira Code", family: '"Fira Code", monospace' },
  { name: "JetBrains Mono", family: '"JetBrains Mono", monospace' },
  { name: "Source Code", family: '"Source Code Pro", monospace' },
];

export const HIGHLIGHT_THEMES = [
  { name: "Atom Dark", style: atomDark },
  { name: "Dracula", style: dracula },
  { name: "Nord", style: nord },
  { name: "Tomorrow", style: tomorrow },
];

export const MODES_CONFIG = [
  {
    id: "ghost",
    label: "Ghost",
    iconOn: VscEyeClosed,
    iconOff: VscEye,
    activeClass: "bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
  },
  {
    id: "bot",
    label: "Bot",
    iconOn: VscRobot,
    iconOff: VscRobot,
    activeClass: "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
  {
    id: "auto",
    label: "Auto",
    iconOn: VscCircuitBoard,
    iconOff: VscCircuitBoard,
    activeClass: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
  }
];