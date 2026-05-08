import { z } from "zod";

const storageSchema = z.object({
  roomCode: z.string().min(4).max(24).optional(),
  palette: z.enum(["prism", "thermal", "noir"]).default("prism"),
  intensity: z.number().min(0.2).max(2).default(1),
});

export type StoredSettings = z.infer<typeof storageSchema>;

const fallbackSettings: StoredSettings = {
  palette: "prism",
  intensity: 1,
};

export function readSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem("room-vj-settings");
    if (!raw) return fallbackSettings;
    return storageSchema.parse(JSON.parse(raw));
  } catch {
    return fallbackSettings;
  }
}

export function writeSettings(settings: StoredSettings): void {
  localStorage.setItem(
    "room-vj-settings",
    JSON.stringify(storageSchema.parse(settings)),
  );
}
