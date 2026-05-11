/**
 * TURN credential fetcher for room-vj.
 *
 * room-vj uses PeerJS for signaling (peerjs.com cloud by default). We don't
 * replace PeerJS — instead we ADD a TURN relay path to the iceServers so peers
 * behind symmetric NAT / mobile carrier networks / corporate firewalls can
 * actually connect when STUN-only fails (which is most real-world cases).
 *
 * Default token endpoint: https://turn.0docker.com/credentials
 * Default relay:          turn:turn.0docker.com:3479
 *
 *  • https://github.com/baditaflorin/turn-token-server  (HMAC, 1h TTL)
 *  • https://github.com/baditaflorin/coturn-hetzner     (the relay)
 *
 * Override with VITE_TURN_TOKEN_URL at build time or with localStorage at
 * runtime. Set the value to an empty string to disable TURN (STUN-only).
 */

const DEFAULT_TURN_TOKEN_URL = "https://turn.0docker.com/credentials";

export const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

export type IceServer = { urls: string; username?: string; credential?: string };

type TurnCredentialResponse = {
  username: string;
  password: string;
  ttl: number;
  uris: string[];
};

function loadTurnTokenUrl(): string {
  if (typeof localStorage === "undefined") return DEFAULT_TURN_TOKEN_URL;
  const stored = localStorage.getItem("room-vj:turnTokenUrl");
  if (stored !== null) return stored; // explicit "" disables
  return (
    ((import.meta as ImportMeta).env?.VITE_TURN_TOKEN_URL as string | undefined) ??
    DEFAULT_TURN_TOKEN_URL
  );
}

export async function fetchIceServers(): Promise<IceServer[]> {
  const tokenUrl = loadTurnTokenUrl();
  if (!tokenUrl) return STUN_SERVERS;
  try {
    const res = await fetch(tokenUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cred = (await res.json()) as TurnCredentialResponse;
    if (!Array.isArray(cred.uris) || cred.uris.length === 0) {
      throw new Error("token server returned no TURN URIs");
    }
    return [
      ...STUN_SERVERS,
      ...cred.uris.map((u) => ({
        urls: u,
        username: cred.username,
        credential: cred.password,
      })),
    ];
  } catch (err) {
    console.warn("[turn] credential fetch failed, falling back to STUN-only:", err);
    return STUN_SERVERS;
  }
}
