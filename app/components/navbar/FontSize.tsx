import { VscTextSize } from "react-icons/vsc";

interface FontSizeProps {
  fontSize: string;
  setFontSize: (size: string) => void;
  accent: {
    class: string;
  };
}

const FontSize = ({ fontSize, setFontSize, accent }: FontSizeProps) => {
  // Extraemos el número actual (ej: "19px" -> 19)
  const currentSize = parseInt(fontSize);

  const updateSize = (delta: number) => {
    const newSize = currentSize + delta;
    // Límites de seguridad para el editor
    if (newSize >= 12 && newSize <= 40) {
      setFontSize(`${newSize}px`);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <VscTextSize size={16} className="text-zinc-500" />
      
      <div className="flex items-center gap-1">
        {/* Botón Menos */}
        <button 
          onClick={() => updateSize(-1)}
          className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-all active:scale-90 font-bold"
        >
          -
        </button>

        {/* Valor Actual */}
        <span className={`text-[11px] font-black min-w-[32px] text-center ${accent.class} tabular-nums`}>
          {fontSize}
        </span>

        {/* Botón Mas */}
        <button 
          onClick={() => updateSize(1)}
          className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-all active:scale-90 font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default FontSize;