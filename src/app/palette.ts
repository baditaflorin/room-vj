import type { PaletteName } from "../features/session/types";

export function paletteClass(name: PaletteName): string {
  if (name === "thermal")
    return "bg-[linear-gradient(135deg,#090a13,#f23b2f,#ffe28a)]";
  if (name === "noir")
    return "bg-[linear-gradient(135deg,#05070a,#9ee8ff,#ff4f99)]";
  return "bg-[linear-gradient(135deg,#30e8bf,#fffb7d,#ff4f99)]";
}
