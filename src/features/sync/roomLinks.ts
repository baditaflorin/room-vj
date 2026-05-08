import { PAGES_URL } from "../../lib/constants";
import { randomRoomCode } from "../../lib/math";

export function roomCodeFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return (
    params
      .get("room")
      ?.toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 24) || randomRoomCode()
  );
}

export function createRoomUrl(roomCode: string): string {
  const url = new URL(PAGES_URL);
  url.searchParams.set("room", roomCode);
  return url.toString();
}

export function normalizeRoomCode(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}
