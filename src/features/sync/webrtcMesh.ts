import { z } from "zod";
import type { AudioFeatures, SyncFrame } from "../session/types";
import { emptySyncFrame } from "../session/types";

type DataConnection = import("peerjs").DataConnection;
type PeerInstance = import("peerjs").Peer;

const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hello"),
    peerId: z.string(),
    roomCode: z.string(),
  }),
  z.object({
    type: z.literal("peer-list"),
    peers: z.array(z.string()),
  }),
  z.object({
    type: z.literal("state"),
    peerId: z.string(),
    sentAt: z.number(),
    beatPulse: z.number(),
    hue: z.number(),
    energy: z.number(),
  }),
]);

type MeshMessage = z.infer<typeof messageSchema>;

export interface MeshSync {
  connect(roomCode: string, mode: "host" | "join"): Promise<void>;
  broadcast(audio: AudioFeatures): void;
  getFrame(): SyncFrame;
  dispose(): void;
}

export function createMeshSync(): MeshSync {
  let peer: PeerInstance | undefined;
  let peerId = "";
  let roomCode = "";
  let leader = false;
  let status = "offline";
  let latencyMs = 0;
  let remotePulse = 0;
  let remoteHue = Math.random();
  const connections = new Map<string, DataConnection>();

  const allPeerIds = () =>
    Array.from(connections.keys()).filter((id) => id !== peerId);

  const send = (connection: DataConnection, message: MeshMessage) => {
    if (connection.open) connection.send(message);
  };

  const broadcastMessage = (message: MeshMessage) => {
    for (const connection of connections.values()) send(connection, message);
  };

  const connectToPeer = (targetPeerId: string) => {
    if (!peer || targetPeerId === peerId || connections.has(targetPeerId))
      return;
    const connection = peer.connect(targetPeerId, { reliable: true });
    attachConnection(connection);
  };

  const attachConnection = (connection: DataConnection) => {
    connections.set(connection.peer, connection);
    status = `connected to ${connections.size} peer${connections.size === 1 ? "" : "s"}`;
    connection.on("open", () => {
      send(connection, { type: "hello", peerId, roomCode });
      if (leader) {
        broadcastMessage({
          type: "peer-list",
          peers: [peerId, ...allPeerIds()],
        });
      }
    });
    connection.on("data", (raw) => {
      const parsed = messageSchema.safeParse(raw);
      if (!parsed.success) return;
      const message = parsed.data;
      if (message.type === "hello") {
        if (message.roomCode !== roomCode) return;
        connections.set(message.peerId, connection);
        if (leader)
          broadcastMessage({
            type: "peer-list",
            peers: [peerId, ...allPeerIds()],
          });
      }
      if (message.type === "peer-list") {
        for (const nextPeerId of message.peers) connectToPeer(nextPeerId);
      }
      if (message.type === "state") {
        remotePulse = Math.max(remotePulse, message.beatPulse);
        remoteHue = message.hue;
        latencyMs = Math.max(0, Date.now() - message.sentAt);
      }
    });
    connection.on("close", () => {
      connections.delete(connection.peer);
      status =
        connections.size > 0
          ? `connected to ${connections.size} peer${connections.size === 1 ? "" : "s"}`
          : "online";
    });
    connection.on("error", () => {
      connections.delete(connection.peer);
      status = "peer connection error";
    });
  };

  return {
    async connect(nextRoomCode, mode) {
      roomCode = nextRoomCode;
      leader = mode === "host";
      status = "opening peer";
      const { Peer } = await import("peerjs");
      const hostId = `room-vj-${roomCode.toLowerCase()}-host`;
      const suffix = Math.random().toString(36).slice(2, 8);
      peerId = leader ? hostId : `room-vj-${roomCode.toLowerCase()}-${suffix}`;
      peer = new Peer(peerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
          ],
        },
      });

      await new Promise<void>((resolve, reject) => {
        if (!peer) return reject(new Error("Peer did not initialize"));
        const timeout = window.setTimeout(
          () => reject(new Error("Peer signaling timed out")),
          12000,
        );
        peer.on("open", () => {
          window.clearTimeout(timeout);
          status = leader ? "hosting room" : "joining room";
          if (!leader) connectToPeer(hostId);
          resolve();
        });
        peer.on("connection", attachConnection);
        peer.on("error", (error) => {
          window.clearTimeout(timeout);
          status =
            error.type === "unavailable-id"
              ? "room host already exists"
              : "sync unavailable";
          reject(error);
        });
      });
    },
    broadcast(audio) {
      if (!peer || peer.disconnected || peer.destroyed) return;
      remotePulse = Math.max(0, remotePulse - 0.035);
      const hue =
        (audio.spectralCentroid * 0.45 +
          audio.beatCount * 0.013 +
          remoteHue * 0.08) %
        1;
      broadcastMessage({
        type: "state",
        peerId,
        sentAt: Date.now(),
        beatPulse: audio.beatPulse,
        hue,
        energy: audio.energy,
      });
      if (leader) remoteHue = hue;
    },
    getFrame() {
      return {
        ...emptySyncFrame,
        roomCode,
        peerCount: connections.size,
        leader,
        remotePulse,
        remoteHue,
        latencyMs,
        status,
      };
    },
    dispose() {
      for (const connection of connections.values()) connection.close();
      connections.clear();
      peer?.destroy();
      peer = undefined;
      status = "offline";
    },
  };
}
