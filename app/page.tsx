"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  VscServerProcess, VscTerminal, VscDashboard, VscLoading, 
  VscPulse, VscCircuitBoard, VscLock, VscRocket, VscShield, VscCode, VscSymbolMethod 
} from "react-icons/vsc";
import gsap from "gsap";

/* =======================
    DATABASE
======================= */
const SNIPPETS = [
  {
    id: "PY-AUTH-01",
    title: "JWT Validator",
    category: "Cybersecurity",
    lang: "python",
    useCase: "Zero Trust Architecture - Backend Validation",
    description: "Validación asíncrona de tokens RS256 con rotación de claves JWKS.",
    code: `async def verify_token(token: str):\n    try:\n        header = jwt.get_unverified_header(token)\n        rsa_key = await get_rsa_key(header["kid"])\n        payload = jwt.decode(token, rsa_key, algorithms=["RS256"])\n        return UserScope(payload)\n    except JWTError as e:\n        raise SecurityException("Invalid_Token_Chain")`,
    output: ">>> Checking JWKS Endpoint...\n>>> Signature Verified.\n>>> Scope: ADMIN_ACCESS"
  },
  {
    id: "RS-MEM-99",
    title: "Safe Buffer",
    category: "Systems",
    lang: "rust",
    useCase: "High-Performance Trading Systems",
    description: "Gestión de memoria de baja latencia utilizando Ownership estricto.",
    code: `fn process_buffer(raw_data: Vec<u8>) -> Result<Frame, Error> {\n    let shared_buffer = Arc::new(Mutex::new(raw_data));\n    let handle = thread::spawn(move || {\n        let mut data = shared_buffer.lock().unwrap();\n        validate_checksum(&data)\n    });\n    handle.join().expect("Thread_Panic")\n}`,
    output: ">>> Mutex Lock: Acquired\n>>> Ownership Transferred\n>>> Safe Checksum: 0xFA22"
  }
];

const LANGUAGES = ["all", "python", "rust", "javascript"];
const CATEGORIES = ["all", "Cybersecurity", "Systems", "Infrastructure"];
const ACCENTS = [
  { id: "cyber", color: "#3b82f6", bg: "bg-blue-500", shadow: "shadow-blue-500/20" },
  { id: "neon", color: "#ec4899", bg: "bg-pink-500", shadow: "shadow-pink-500/20" },
  { id: "eco", color: "#10b981", bg: "bg-emerald-500", shadow: "shadow-emerald-500/20" }
];

const MASTER_FONT_STYLE: React.CSSProperties = {
  fontFamily: '"Fira Code", monospace',
  fontSize: "20px",
  lineHeight: "1.8",
  fontWeight: 500,
  letterSpacing: "-0.02em",
  tabSize: 4,
};

export default function NeuralTerminalV4() {
  const [mounted, setMounted] = useState(false);
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [autoPilot, setAutoPilot] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const filteredPool = useMemo(() => {
    return SNIPPETS.filter(s => 
      (langFilter === "all" || s.lang === langFilter) &&
      (catFilter === "all" || s.category === catFilter)
    );
  }, [langFilter, catFilter]);

  const snippet = filteredPool[level] || filteredPool[0];

  useEffect(() => setMounted(true), []);
  useEffect(() => { setInput(""); setFinished(false); setLevel(0); }, [langFilter, catFilter]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPilot && !finished && snippet) {
      interval = setInterval(() => {
        setInput(prev => {
          if (prev.length < snippet.code.length) return prev + snippet.code[prev.length];
          setFinished(true);
          return prev;
        });
      }, 45);
    }
    return () => clearInterval(interval);
  }, [autoPilot, finished, snippet]);

  const handleInput = (val: string) => {
    if (finished || autoPilot || !snippet || val.length > snippet.code.length) return;
    const currentIsError = val.split("").some((char, i) => char !== snippet.code[i]);
    setIsError(currentIsError);
    if (val.length > input.length && val[val.length - 1] !== snippet.code[val.length - 1]) {
      gsap.fromTo(terminalRef.current, { x: -2 }, { x: 2, duration: 0.05, repeat: 2, yoyo: true });
    }
    setInput(val);
    if (val === snippet.code && !currentIsError) setFinished(true);
  };

  if (!mounted) return null;
  const progress = snippet ? Math.round((input.length / snippet.code.length) * 100) : 0;

  return (
    <div className="h-screen w-screen bg-[#050505] text-zinc-400 font-sans overflow-hidden flex flex-col items-center p-8">
      
      {/* 1. TOP NAV */}
      <header className="w-full max-w-[1500px] flex justify-between items-center h-24 px-12 bg-[#0d0d0d]/40 border border-white/5 rounded-[3rem] backdrop-blur-2xl mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-white/10 to-transparent">
              <VscCircuitBoard className="animate-pulse" size={26} style={{ color: accent.color }} />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">Neural_Node</span>
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
            {LANGUAGES.map(l => (
              <div 
                key={l} 
                onClick={() => setLangFilter(l)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-300 ${langFilter === l ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-600 hover:text-zinc-300'}`}
              >
                {l}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex gap-4 bg-white/5 p-2 rounded-full">
            {ACCENTS.map(a => (
              <button key={a.id} onClick={() => setAccent(a)} className={`h-6 w-6 rounded-full transition-all ${accent.id === a.id ? 'ring-2 ring-white scale-110 shadow-xl' : 'opacity-20 hover:opacity-100'}`} style={{ backgroundColor: a.color }} />
            ))}
          </div>
          <button onClick={() => setAutoPilot(!autoPilot)} className={`px-8 py-3 rounded-full border border-white/10 transition-all text-[11px] font-black tracking-[0.2em] uppercase ${autoPilot ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
            {autoPilot ? 'Autopilot Active' : 'Manual Entry'}
          </button>
        </div>
      </header>

      <main className="w-full max-w-[1500px] grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 flex-1 overflow-hidden">
        
        {/* 2. SIDEBAR */}
        <aside className="space-y-8 pt-10">
          <div className="flex flex-col gap-3">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 ml-4">System Domains</span>
             <div className="grid grid-cols-1 gap-2">
               {CATEGORIES.map(c => (
                 <div 
                  key={c} 
                  onClick={() => setCatFilter(c)}
                  className={`group flex items-center justify-between px-6 py-5 rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${catFilter === c ? 'bg-gradient-to-r from-white/10 to-transparent border-white/20' : 'border-transparent hover:bg-white/[0.03]'}`}
                 >
                   <span className={`text-[11px] font-bold uppercase tracking-widest ${catFilter === c ? 'text-white' : 'text-zinc-600'}`}>{c}</span>
                   {catFilter === c && <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent.color, boxShadow: `0 0 10px ${accent.color}` }} />}
                 </div>
               ))}
             </div>
          </div>

          {snippet && (
            <div className="p-10 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-[3.5rem] mt-10">
               <h2 className="text-5xl font-light text-white tracking-tighter leading-none mb-6">{snippet.title}</h2>
               <p className="text-zinc-500 text-sm leading-relaxed italic opacity-80">{snippet.useCase}</p>
            </div>
          )}
        </aside>

        {/* 3. TERMINAL AREA - TOTAL RE-DESIGN */}
        <div className="flex flex-col gap-6 overflow-hidden pt-4">
          <div className="flex items-center justify-between px-6">
            <div className="flex gap-2 bg-white/5 p-3 rounded-2xl">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-1000 ${progress > (i * 8.3) ? accent.bg : 'bg-white/5'}`} style={{ boxShadow: progress > (i * 8.3) ? `0 0 15px ${accent.color}` : '' }} />
              ))}
            </div>
            <div className="text-6xl font-black italic tracking-tighter opacity-80" style={{ color: accent.color }}>
              {progress}%
            </div>
          </div>

          {/* MAIN TERMINAL CONTAINER */}
          {snippet ? (
            <div 
              ref={terminalRef}
              className={`relative flex-1 bg-[#0a0a0a] rounded-[4rem] border-t-2 border-l border-white/10 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 ${isError ? 'border-red-500/30' : ''}`}
              style={{ boxShadow: finished ? `0 0 80px -20px ${accent.color}` : '' }}
              onClick={() => textareaRef.current?.focus()}
            >
              {/* SCANLINE ANIMATION */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-20 w-full animate-scanline z-20" />
              
              <div className="absolute top-0 left-0 w-full h-full p-20 overflow-auto custom-scrollbar">
                
                {/* GHOST LAYER - ELEVATED OPACITY */}
                <div className="absolute opacity-[0.12] select-none pointer-events-none blur-[0.5px]">
                  <SyntaxHighlighter language={snippet.lang} style={atomDark} customStyle={MASTER_FONT_STYLE}>
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>

                {/* INTERACTIVE LAYER */}
                <div className="relative z-10 whitespace-pre pointer-events-none" style={MASTER_FONT_STYLE}>
                  {snippet.code.split("").map((char, i) => {
                    const typed = i < input.length;
                    const correct = typed && input[i] === snippet.code[i];

                    if (typed && correct) {
                      return (
                        <span key={i} className="relative inline">
                          <SyntaxHighlighter language={snippet.lang} style={atomDark} PreTag="span" CodeTag="span" customStyle={{ display: 'inline', padding: 0, background: 'transparent', ...MASTER_FONT_STYLE }}>
                            {char}
                          </SyntaxHighlighter>
                          {i === input.length - 1 && !finished && (
                            <span className="absolute right-[-2px] top-[0.2em] w-[3px] h-[1.2em] shadow-lg animate-pulse" style={{ backgroundColor: accent.color, boxShadow: `0 0 20px ${accent.color}` }} />
                          )}
                        </span>
                      );
                    }
                    return (
                      <span key={i} className={`${typed ? "bg-red-500 text-white" : "text-white/20"}`}>
                        {i === input.length && (
                           <span className="absolute inline-block w-[3px] h-[1.2em] translate-y-[0.2em] animate-pulse" style={{ backgroundColor: accent.color }} />
                        )}
                        {char === " " ? "\u00A0" : char}
                      </span>
                    );
                  })}
                </div>
              </div>

              <textarea ref={textareaRef} value={input} onChange={(e) => handleInput(e.target.value)} spellCheck={false} autoFocus className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-none" />
            </div>
          ) : (
             <div className="flex-1 border border-dashed border-white/5 rounded-[4rem] flex items-center justify-center bg-black/20">
               <span className="text-zinc-800 font-black tracking-[1em] uppercase">No_Sequence_Loaded</span>
             </div>
          )}

          {/* HUD OUTPUT */}
          <div className={`grid grid-cols-[1fr_300px] gap-8 transition-all duration-1000 ${finished ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
            <div className="bg-[#0d0d0d] border border-white/5 p-12 rounded-[4rem] flex items-center gap-10 shadow-2xl">
               <div className="h-16 w-1 rounded-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
               <pre className="font-mono text-xl text-zinc-400 italic leading-relaxed">
                 {snippet?.output}
               </pre>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[3.5rem] flex flex-col items-center justify-center text-center gap-4">
               <div className="p-4 rounded-full bg-white/5">
                 <VscShield className="text-emerald-500 animate-pulse" size={32} />
               </div>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Protocol Verified</span>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
}