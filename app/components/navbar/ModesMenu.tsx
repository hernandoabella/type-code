"use client";

export const ModesMenu = ({
  isGhostActive,  setIsGhostActive,
  isRecallMode,   setIsRecallMode,
  autoWriting,    setAutoWriting,
  accent,
}: any) => {
  const color = accent?.color ?? "#63cab7";

  const modes = [
    { label: "Ghost",  active: isGhostActive, toggle: () => setIsGhostActive(!isGhostActive) },
    { label: "Recall", active: isRecallMode,   toggle: () => setIsRecallMode(!isRecallMode)   },
    { label: "Bot",    active: autoWriting,    toggle: () => setAutoWriting(!autoWriting)     },
  ];

  return (
    <div className="flex items-center gap-1">
      {modes.map(({ label, active, toggle }) => (
        <button
          key={label}
          onClick={toggle}
          className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-200 active:scale-95"
          style={{
            background: active ? `${color}18` : "transparent",
            border:     `1px solid ${active ? `${color}45` : "rgba(255,255,255,0.07)"}`,
            color:      active ? color        : "rgba(255,255,255,0.28)",
            boxShadow:  active ? `0 0 10px ${color}25` : "none",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ModesMenu;