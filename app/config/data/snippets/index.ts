// app/config/snippets/index.ts
import { javascriptSnippets } from "./javascript";
import { typescriptSnippets } from "./typescript";
import { pythonSnippets } from "./python";
import { Snippet } from "@/app/types";

export const SNIPPETS: Snippet[] = [
  ...javascriptSnippets,
  ...typescriptSnippets,
  ...pythonSnippets,
];