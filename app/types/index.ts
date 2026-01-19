import { JSX } from "react";
import { SnippetCategory, SnippetLang, SnippetLevel } from "../config/constants";

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