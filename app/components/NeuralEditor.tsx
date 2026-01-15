"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { VscRefresh } from "react-icons/vsc";

interface NeuralEditorProps {
  isFocusMode: boolean;
  accent: any;
  resetCurrentSnippet: () => void;
  terminalRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  isGhostActive: boolean;
  snippet: any;
  editorTheme: any;
  MASTER_STYLE: any;
  input: string;
  handleInput: (val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  finished: boolean;
  autoWriting: boolean;
}

export const NeuralEditor = ({
  isFocusMode,
  accent,
  resetCurrentSnippet,
  terminalRef,
  textareaRef,
  isGhostActive,
  snippet,
  editorTheme,
  MASTER_STYLE,
  input,
  handleInput,
  handleKeyDown,
  finished,
  autoWriting,
}: NeuralEditorProps) => {
  return (
    <div className={`transition-all duration-700 ease-in-out w-full ${isFocusMode ? 'pl-0' : 'pl-[420px]'} space-y-8 relative z-10 h-auto`}>
      <div className="relative group">
        <div className={`absolute -inset-1 rounded-[3.5rem] blur opacity-10 transition duration-1000 ${accent.bg}`} />
        
        {/* Botón Flotante de Reset */}
        <button 
          onClick={resetCurrentSnippet} 
          className={`absolute top-8 right-8 z-50 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 active:scale-90 flex items-center gap-3 group/btn ${isFocusMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
          <VscRefresh size={18} className="group-hover/btn:rotate-180 transition-transform duration-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">Abort & Reset</span>
        </button>

        {/* Terminal Principal */}
        <div 
          ref={terminalRef} 
          className={`relative p-16 bg-[#080808] rounded-[3.5rem] border border-white/10 shadow-3xl transition-all duration-700 h-auto overflow-visible ${isFocusMode ? 'scale-[1.01]' : 'scale-100'}`} 
          onClick={() => textareaRef.current?.focus()}
        >
          {/* Ghost Layer (Fondo tenue) */}
          <div className="opacity-20 pointer-events-none select-none transition-all duration-500" style={isGhostActive ? { maskImage: 'linear-gradient(to right, black 0%, transparent 40%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 40%)', filter: 'blur(4px)' } : {}}>
            <SyntaxHighlighter language={snippet.lang} style={editorTheme.style} customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }} codeTagProps={{ style: MASTER_STYLE }}>{snippet.code}</SyntaxHighlighter>
          </div>
          
          {/* Input Layer (Lo que el usuario escribe) */}
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

          <textarea 
            ref={textareaRef} 
            value={input} 
            onChange={(e) => handleInput(e.target.value)} 
            onKeyDown={handleKeyDown} 
            spellCheck={false} 
            autoFocus 
            className={`absolute inset-0 w-full h-full opacity-0 z-30 ${finished ? 'cursor-default' : 'cursor-none'}`} 
            disabled={autoWriting || finished} 
          />
        </div>
      </div>

      {/* Output & Success Section */}
      <div className={`transition-all duration-700 flex items-center gap-6 ${finished ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex-1 bg-[#0c0c0c] border border-white/10 rounded-3xl p-8 shadow-2xl flex items-center justify-between">
          <div className="space-y-1">
            <pre className="font-mono text-sm text-zinc-400 italic">{snippet.output}</pre>
          </div>
        </div>
        <button onClick={resetCurrentSnippet} className="group flex flex-col items-center justify-center gap-2 p-8 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.08] transition-all active:scale-95">
          <VscRefresh size={24} className="group-hover:rotate-180 transition-transform duration-500 text-white" />
          <span className="text-[10px] font-black uppercase text-white/40 group-hover:text-white">Retry</span>
        </button>
      </div>
    </div>
  );
};