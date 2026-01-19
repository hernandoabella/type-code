import { 
  VscEyeClosed, 
  VscEye, 
  VscRobot, 
  VscCircuitBoard, 
  VscMap 
} from "react-icons/vsc";

export const MODES = [
  {
    id: "ghost",
    label: "Ghost",
    iconOn: VscEyeClosed,
    iconOff: VscEye,
    activeClass: "bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
  },
  {
    id: "bot",
    label: "Bot",
    iconOn: VscRobot,
    iconOff: VscRobot,
    activeClass: "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  },
  {
    id: "auto",
    label: "Auto",
    iconOn: VscCircuitBoard,
    iconOff: VscCircuitBoard,
    activeClass: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  },
  {
    id: "zen", 
    label: "Zen Mode",
    iconOn: VscMap, 
    iconOff: VscMap,
    activeClass: "bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
  }
];