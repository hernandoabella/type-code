import { JSX } from "react";

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