import { Snippet } from "@/app/types";
import { SiTypescript } from "react-icons/si";

export const typescriptSnippets: Snippet[] = [
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
    realLifeUsage: "Prevents memory leaks during fast navigation.",
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
    realLifeUsage: "Allows TypeScript to infer exact types inside conditionals.",
    output: "Action handled safely.",
    code: `type Action =
  | { type: "add"; value: number }
  | { type: "remove"; id: string };

function reducer(action: Action) {
  if (action.type === "add") {
    return action.value;
  }
}`
  }
];