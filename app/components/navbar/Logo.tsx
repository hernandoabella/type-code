interface LogoProps {
  accent: {
    class: string; // Ejemplo: "text-blue-400"
    bg: string;    // Ejemplo: "bg-blue-400"
  };
}

const Logo = ({ accent }: LogoProps) => {
  return (
    <div 
      className="flex items-center px-4 cursor-default group" 
      role="banner"
      aria-label="TypeCode Logo"
    >
      <div className="flex flex-col relative">
        <h1 className="text-[16px] font-black uppercase tracking-[0.3em] text-white leading-none select-none flex items-center">
          {/* Parte fija */}
          <span className="opacity-90">Type</span>
          
          {/* Parte resaltada: El "Code" ahora tiene un fondo dinámico */}
          <span className={`
            relative ml-2 px-2 py-1 rounded-lg
            ${accent.class} transition-all duration-500 ease-in-out
            group-hover:scale-105
          `}>
            {/* Fondo suave con el acento actual */}
            <div className={`absolute inset-0 ${accent.bg} opacity-10 rounded-lg group-hover:opacity-20 transition-opacity`} />
            
            <span className="relative">Code</span>
          </span>
        </h1>

        {/* Línea decorativa inferior que brilla con el acento */}
        <div className="absolute -bottom-2 left-0 w-full h-[2px] overflow-hidden rounded-full">
          <div className={`
            h-full w-0 group-hover:w-full transition-all duration-700 
            ease-out ${accent.bg} opacity-50
          `} />
        </div>
      </div>
    </div>
  );
};

export default Logo;