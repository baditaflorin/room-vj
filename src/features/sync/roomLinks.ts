import { z } from "zod";
import { PAGES_URL } from "../../lib/constants";
import {
  fallbackSessionSnapshot,
  paletteSchema,
  syncIntentSchema,
  launchModeSchema,
  type SessionSnapshot,
} from "../../lib/storage";
import { clamp, randomRoomCode } from "../../lib/math";

const roomCodeSchema = z.string().min(4).max(24);
const shareParamsSchema = z.object({
  roomCode: roomCodeSchema.optional(),
  palette: paletteSchema.optional(),
  intensity: z.number().min(0.2).max(2).optional(),
  syncIntent: syncIntentSchema.optional(),
  launchMode: launchModeSchema.optional(),
  debug: z.boolean().optional(),
});

export interface ParsedClipboardState {
  kind: "room-code" | "room-link";
  snapshot: SessionSnapshot;
}

export function normalizeRoomCode(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}

export function createShareUrl(snapshot: SessionSnapshot): string {
  const url = createShareUrlBase(PAGES_URL);
  return applySnapshotToUrl(url, snapshot).toString();
}

export function snapshotFromUrl(
  source: URL = new URL(window.location.href),
): SessionSnapshot {
  const params = source.searchParams;
  const roomCode = normalizeRoomCode(
    params.get("room") ??
      params.get("code") ??
      fallbackSessionSnapshot.roomCode,
  );
  const parsed = shareParamsSchema.parse({
    roomCode,
    palette: params.get("palette") ?? undefined,
    intensity: parseIntensity(params.get("intensity")),
    syncIntent: params.get("sync") ?? undefined,
    launchMode: params.get("mode") ?? undefined,
    debug: params.get("debug") === "1" || undefined,
  });

  return {
    ...fallbackSessionSnapshot,
    roomCode:
      parsed.roomCode && parsed.roomCode.length >= 4
        ? parsed.roomCode
        : randomRoomCode(),
    palette: parsed.palette ?? fallbackSessionSnapshot.palette,
    intensity: parsed.intensity ?? fallbackSessionSnapshot.intensity,
    syncIntent: parsed.syncIntent ?? fallbackSessionSnapshot.syncIntent,
    launchMode: parsed.launchMode ?? fallbackSessionSnapshot.launchMode,
    debug: parsed.debug ?? fallbackSessionSnapshot.debug,
  };
}

export function mergeSessionSnapshot(
  baseSnapshot: SessionSnapshot,
  overrideSnapshot: Partial<SessionSnapshot>,
): SessionSnapshot {
  return {
    ...baseSnapshot,
    ...overrideSnapshot,
    version: 1,
    roomCode: normalizeRoomCode(
      overrideSnapshot.roomCode ?? baseSnapshot.roomCode,
    ),
    intensity: clamp(
      overrideSnapshot.intensity ?? baseSnapshot.intensity,
      0.2,
      2,
    ),
  };
}

export function applySnapshotToLocation(snapshot: SessionSnapshot): void {
  const nextUrl = applySnapshotToUrl(new URL(window.location.href), snapshot);
  window.history.replaceState({}, "", nextUrl.toString());
}

export function clearShareStateFromLocation(): void {
  const nextUrl = new URL(window.location.href);
  nextUrl.search = "";
  nextUrl.hash = "";
  window.history.replaceState({}, "", nextUrl.toString());
}

export function parseClipboardState(text: string): ParsedClipboardState {
  const trimmed = text.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const snapshot = snapshotFromUrl(new URL(trimmed));
    return { kind: "room-link", snapshot };
  }

  const roomCode = normalizeRoomCode(trimmed);
  if (roomCode.length >= 4) {
    return {
      kind: "room-code",
      snapshot: {
        ...fallbackSessionSnapshot,
        roomCode,
      },
    };
  }

  throw new Error(
    "Clipboard text is not a Room VJ link or room code. Copy a Room VJ invite link, room code, or session file text.",
  );
}

function applySnapshotToUrl(url: URL, snapshot: SessionSnapshot): URL {
  url.searchParams.set("room", snapshot.roomCode);
  url.searchParams.set("palette", snapshot.palette);
  url.searchParams.set("intensity", snapshot.intensity.toFixed(2));
  if (snapshot.syncIntent !== "idle")
    url.searchParams.set("sync", snapshot.syncIntent);
  else url.searchParams.delete("sync");
  if (snapshot.launchMode !== "idle")
    url.searchParams.set("mode", snapshot.launchMode);
  else url.searchParams.delete("mode");
  if (snapshot.debug) url.searchParams.set("debug", "1");
  else url.searchParams.delete("debug");
  return url;
}

function parseIntensity(rawValue: string | null): number | undefined {
  if (!rawValue) return undefined;
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function createShareUrlBase(baseUrl: string): URL {
  const url = new URL(baseUrl);
  url.search = "";
  url.hash = "";
  return url;
}
