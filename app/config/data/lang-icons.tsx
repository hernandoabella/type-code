import { JSX } from "react";
import { SiJavascript, SiTypescript, SiPython } from "react-icons/si";
import { VscCode } from "react-icons/vsc";

export const LANG_ICONS: Record<string, JSX.Element> = {
  all: <VscCode className="text-zinc-400" />,
  javascript: <SiJavascript className="text-yellow-400" />,
  typescript: <SiTypescript className="text-blue-500" />,
  python: <SiPython className="text-blue-400" />,
};