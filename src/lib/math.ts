export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * clamp(amount);
}

export function smooth(previous: number, next: number, amount: number): number {
  return Number.isFinite(previous) ? lerp(previous, next, amount) : next;
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp((value - min) / (max - min));
}

export function randomRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const values = new Uint8Array(6);
  crypto.getRandomValues(values);
  for (const value of values) code += alphabet[value % alphabet.length];
  return code;
}
