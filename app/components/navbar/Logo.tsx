import { VscTerminal } from "react-icons/vsc";

interface LogoProps {
  accent: {
    class: string;
    bg: string;
  };
}

const Logo = ({ accent }: LogoProps) => {
  return (
    <div className="group flex items-center gap-3 px-2 cursor-default select-none">
      
      {/* Icono */}
      <div className="relative flex items-center justify-center">
        {/* Glow radial */}
        <div
          className={`absolute -inset-2 rounded-full ${accent.bg} blur-xl opacity-20 
          group-hover:opacity-50 transition-all duration-700`}
        />

        <VscTerminal
          size={26}
          className={`
            relative ${accent.class}
            transition-all duration-700 ease-out
            group-hover:scale-110
            group-hover:-rotate-6
          `}
        />
      </div>

      {/* Texto */}
      <div className="flex flex-col leading-none">
        <span className="text-[13px] font-extrabold uppercase tracking-[0.3em] text-white">
          Type
          <span className={`ml-1 ${accent.class}`}>Code</span>
        </span>

        {/* Línea decorativa */}
        <div className="relative mt-1 h-[1px] w-full overflow-hidden">
          <div
            className={`
              absolute left-0 top-0 h-full w-0
              ${accent.bg} opacity-60
              group-hover:w-full
              transition-all duration-700 ease-out
            `}
          />
        </div>
      </div>
    </div>
  );
};

export default Logo;
