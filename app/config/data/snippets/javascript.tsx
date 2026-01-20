import { Snippet } from "@/app/types";
import { SiJavascript } from "react-icons/si";

export const javascriptSnippets: Snippet[] = [
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
    realLifeUsage: "Perfect for encapsulating small, reusable state logic.",
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
    realLifeUsage: "Prevents data inconsistencies and unnecessary re-renders.",
    output: "Total: 42",
    code: `const total = useMemo(() => {
  return items.reduce((a, b) => a + b, 0);
}, [items]);`
  }
];