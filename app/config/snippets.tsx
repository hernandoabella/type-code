

import { ReactNode } from "react";
import { 
  SiJavascript, 
  SiTypescript, 
  SiPython, 
  SiReact 
} from "react-icons/si";

export interface Snippet {
  id: string;
  title: string;
  category: string;
  lang: 'javascript' | 'typescript' | 'python';
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  bestPractice?: boolean;
  icon: ReactNode;
  description: string;
  realLifeUsage: string;
  output: string;
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
    realLifeUsage: "Perfect for encapsulating small, reusable state logic such as counters, toggles, or flags without cluttering the main component.",
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
    realLifeUsage: "Prevents data inconsistencies and unnecessary re-renders by deriving values directly from existing state or props.",
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
    realLifeUsage: "Industry standard for real-time validation and keeping the UI as the single source of truth.",
    output: "Input synced with state.",
    code: `const [value, setValue] = useState("");

<input
  value={value}
  onChange={e => setValue(e.target.value)}
/>;`
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
    realLifeUsage: "Prevents memory leaks and 'state update on unmounted component' errors during fast navigation.",
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
    realLifeUsage: "Allows TypeScript to infer exact types inside conditionals, eliminating undefined access bugs.",
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
    realLifeUsage: "Enforces immutability in large codebases and promotes predictable one-way data flow.",
    output: "Props protected.",
    code: `type Props = {
  readonly id: string;
  readonly name: string;
};`
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
    realLifeUsage: "Commonly used in cryptography, data validation, and numerical analysis workflows.",
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
    realLifeUsage: "A Pythonic and efficient way to reshape API responses or build fast lookup tables.",
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
    realLifeUsage: "Essential for processing large files or data streams without exhausting system memory.",
    output: "Yielding values...",
    code: `def count_up(n):
  for i in range(n):
    yield i`
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
    realLifeUsage: "Ideal for large lists or complex UI components that should only re-render on specific prop changes.",
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
    realLifeUsage: "Dramatically reduces initial bundle size by loading components only when they are needed.",
    output: "Component loaded on demand.",
    code: `const Dashboard = React.lazy(() =>
  import("./Dashboard")
);`
  }
];