"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { VscRefresh } from "react-icons/vsc";
import { Snippet } from "@/app/config/constants";

interface TerminalProps {
  input: string;
  snippet: Snippet;
  selectedFont: { name: string; family: string };
  editorTheme: { name: string; style: any };
  isGhostActive: boolean;
  isError: boolean;
  isFocusMode: boolean;
  finished: boolean;
  autoWriting: boolean;
  accent: { name: string; class: string; bg: string; shadow: string };
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  terminalRef: React.RefObject<HTMLDivElement | null>;
  handleInput: (val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  resetCurrentSnippet: () => void;
}

/**
 * Terminal Component
 * Maneja el renderizado de tres capas: 
 * 1. Referencia (difuminada en Ghost Mode)
 * 2. Escritura activa (resaltado de sintaxis real)
 * 3. Texto fantasma (degradado de máscara)
 */
export const Terminal = ({
  input,
  snippet,
  selectedFont,
  editorTheme,
  isGhostActive,
  isError,
  isFocusMode,
  finished,
  autoWriting,
  accent,
  textareaRef,
  terminalRef,
  handleInput,
  handleKeyDown,
  resetCurrentSnippet,
}: TerminalProps) => {

  // Estilo maestro compartido para asegurar alineación perfecta entre capas
  const MASTER_STYLE: React.CSSProperties = {
    fontFamily: selectedFont.family,
    fontSize: "19px",
    lineHeight: "1.7",
    fontWeight: 700,
    tabSize: 4,
  };

  return (
    <div className={`transition-all duration-700 ease-in-out w-full ${isFocusMode ? 'pl-0' : 'pl-[420px]'} space-y-8 relative z-10 h-auto`}>
      <div className="relative group">
        
        {/* Aura de fondo que brilla con el color del acento */}
        <div className={`absolute -inset-1 rounded-[3.5rem] blur opacity-10 transition duration-1000 ${accent.bg}`} />
        
        {/* Botón de Reset Flotante (Solo visible en Focus Mode) */}
        <button 
          onClick={resetCurrentSnippet} 
          className={`absolute top-8 right-8 z-50 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 active:scale-90 flex items-center gap-3 group/btn ${
            isFocusMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <VscRefresh size={18} className="group-hover/btn:rotate-180 transition-transform duration-500 text-white" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white">Abort & Reset</span>
        </button>

        {/* Marco del Terminal */}
        <div 
          ref={terminalRef} 
          className={`relative p-16 bg-[#080808] rounded-[3.5rem] border transition-all duration-700 h-auto overflow-visible ${
            isError ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'border-white/10 shadow-3xl'
          } ${isFocusMode ? 'scale-[1.01]' : 'scale-100'}`} 
          onClick={() => textareaRef.current?.focus()}
        >
          
          {/* CAPA 1: Código de Referencia (Base) */}
          <div 
            className="opacity-20 pointer-events-none select-none transition-all duration-500" 
            style={isGhostActive ? { 
              maskImage: 'linear-gradient(to right, black 0%, transparent 40%)', 
              WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 40%)', 
              filter: 'blur(4px)' 
            } : {}}
          >
            <SyntaxHighlighter 
              language={snippet.lang} 
              style={editorTheme.style} 
              customStyle={{ margin: 0, padding: 0, background: "transparent", ...MASTER_STYLE }} 
              codeTagProps={{ style: MASTER_STYLE }}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
          
          {/* CAPA 2: Visualización Activa */}
          <div className="absolute inset-0 p-16 z-10 pointer-events-none" style={MASTER_STYLE}>
            {/* Texto que el usuario ya escribió (con sintaxis real) */}
            <SyntaxHighlighter 
              language={snippet.lang} 
              style={editorTheme.style} 
              customStyle={{ margin: 0, padding: 0, background: "transparent", overflow: "visible" }} 
              codeTagProps={{ style: { ...MASTER_STYLE, color: 'inherit' } }}
            >
              {input}
            </SyntaxHighlighter>

            {/* Cursor y Texto Ghost (lo que falta) */}
            <div className="absolute top-16 left-16 whitespace-pre pointer-events-none">
                <span className="invisible">{input}</span>
                {input.length < snippet.code.length && (
                  <>
                    {/* Cursor Neón */}
                    <span className={`inline-block w-[3px] h-[1.2em] translate-y-[0.15em] ${accent.bg} shadow-[0_0_15px_currentColor] animate-pulse`} />
                    
                    {/* El rastro "Ghost" con degradado dinámico */}
                    <span 
                      className={`transition-all duration-300 ${isGhostActive ? 'text-zinc-400' : 'text-zinc-500'}`} 
                      style={isGhostActive ? { 
                        maskImage: 'linear-gradient(to right, black 0%, transparent 250px)', 
                        WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 250px)', 
                        filter: 'blur(1px) drop-shadow(0 0 4px rgba(255,255,255,0.3))' 
                      } : {}}
                    >
                      {snippet.code.slice(input.length)}
                    </span>
                  </>
                )}
            </div>
          </div>

          {/* CAPA 3: Area de captura (Invisible) */}
          <textarea 
            ref={textareaRef} 
            value={input} 
            onChange={(e) => handleInput(e.target.value)} 
            onKeyDown={handleKeyDown} 
            spellCheck={false} 
            autoFocus 
            className={`absolute inset-0 w-full h-full opacity-0 z-30 outline-none ${
              finished ? 'cursor-default' : 'cursor-none'
            }`} 
            disabled={autoWriting || finished} 
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;