import { Snippet } from "@/app/types";
import { SiPython } from "react-icons/si";

export const pythonSnippets: Snippet[] = [
  {
    id: "PY-1",
    title: "Prime Generator",
    category: "Logic",
    lang: "python",
    level: "intermediate",
    tags: ["math", "algorithms", "primes"],
    icon: <SiPython className="text-blue-400" />,
    description: "Efficient prime number generation.",
    realLifeUsage: "Commonly used in cryptography and numerical analysis.",
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
    realLifeUsage: "Efficient way to reshape API responses.",
    output: "{'a': 1, 'b': 2}",
    code: `keys = ["a", "b"]
values = [1, 2]
result = {k: v for k, v in zip(keys, values)}`
  }
];