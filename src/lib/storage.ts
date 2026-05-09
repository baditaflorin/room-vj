import { z } from "zod";

export const paletteSchema = z.enum(["prism", "thermal", "noir"]);
export const syncIntentSchema = z.enum(["idle", "host", "join"]);
export const launchModeSchema = z.enum(["idle", "demo", "live"]);

const sessionSnapshotSchema = z.object({
  version: z.literal(1),
  roomCode: z.string().min(4).max(24),
  palette: paletteSchema.default("prism"),
  intensity: z.number().min(0.2).max(2).default(1),
  syncIntent: syncIntentSchema.default("idle"),
  launchMode: launchModeSchema.default("idle"),
  debug: z.boolean().default(false),
});

const sessionExportSchema = z.object({
  type: z.literal("room-vj-session"),
  version: z.literal(1),
  exportedAt: z.string().datetime({ offset: true }),
  snapshot: sessionSnapshotSchema,
});

const legacySettingsSchema = z.object({
  roomCode: z.string().min(4).max(24).optional(),
  palette: paletteSchema.default("prism"),
  intensity: z.number().min(0.2).max(2).default(1),
});

export type SessionSnapshot = z.infer<typeof sessionSnapshotSchema>;
export type SessionExport = z.infer<typeof sessionExportSchema>;

const storageKey = "room-vj-session";
const legacyStorageKey = "room-vj-settings";

export const fallbackSessionSnapshot: SessionSnapshot = {
  version: 1,
  roomCode: "ROOMVJ",
  palette: "prism",
  intensity: 1,
  syncIntent: "idle",
  launchMode: "idle",
  debug: false,
};

export function parseSessionSnapshot(
  input: unknown,
): SessionSnapshot | undefined {
  const parsed = sessionSnapshotSchema.safeParse(input);
  return parsed.success ? parsed.data : undefined;
}

export function migrateLegacySettings(input: unknown): SessionSnapshot {
  const legacy = legacySettingsSchema.parse(input);
  return {
    ...fallbackSessionSnapshot,
    roomCode: legacy.roomCode ?? fallbackSessionSnapshot.roomCode,
    palette: legacy.palette,
    intensity: legacy.intensity,
  };
}

export function readSessionSnapshot(): SessionSnapshot {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = parseSessionSnapshot(JSON.parse(raw));
      if (parsed) return parsed;
    }

    const legacyRaw = localStorage.getItem(legacyStorageKey);
    if (legacyRaw) {
      const migrated = migrateLegacySettings(JSON.parse(legacyRaw));
      writeSessionSnapshot(migrated);
      localStorage.removeItem(legacyStorageKey);
      return migrated;
    }
  } catch {
    // Invalid persisted data falls back to defaults.
  }

  return fallbackSessionSnapshot;
}

export function writeSessionSnapshot(snapshot: SessionSnapshot): void {
  localStorage.setItem(
    storageKey,
    JSON.stringify(sessionSnapshotSchema.parse(snapshot)),
  );
}

export function clearSessionSnapshot(): void {
  localStorage.removeItem(storageKey);
  localStorage.removeItem(legacyStorageKey);
}

export function createSessionExport(
  snapshot: SessionSnapshot,
  exportedAt = new Date().toISOString(),
): SessionExport {
  return sessionExportSchema.parse({
    type: "room-vj-session",
    version: 1,
    exportedAt,
    snapshot,
  });
}

export function parseSessionImport(raw: string): SessionSnapshot {
  const parsedJson = JSON.parse(raw) as unknown;
  const exportPayload = sessionExportSchema.safeParse(parsedJson);
  if (exportPayload.success) return exportPayload.data.snapshot;

  const snapshot = parseSessionSnapshot(parsedJson);
  if (snapshot) return snapshot;

  throw new Error(
    "This file is not a valid Room VJ session export. Export a session from Room VJ and try again.",
  );
}
