import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { clamp, randomRoomCode } from "../lib/math";
import {
  clearSessionSnapshot,
  createSessionExport,
  fallbackSessionSnapshot,
  parseSessionImport,
  readSessionSnapshot,
  writeSessionSnapshot,
  type SessionSnapshot,
} from "../lib/storage";
import {
  applySnapshotToLocation,
  clearShareStateFromLocation,
  createShareUrl,
  mergeSessionSnapshot,
  normalizeRoomCode,
  parseClipboardState,
  snapshotFromUrl,
} from "../features/sync/roomLinks";
import {
  createRoomSession,
  type RoomSession,
} from "../features/session/roomSession";
import {
  emptyAudioFeatures,
  emptyPersonFrame,
  emptySurfaceFrame,
  emptySyncFrame,
  type PaletteName,
  type RuntimeStatus,
} from "../features/session/types";

const initialStatus: RuntimeStatus = {
  mode: "idle",
  renderer: "not started",
  fps: 0,
  camera: "idle",
  microphone: "idle",
  vision: "idle",
  sync: emptySyncFrame,
  message: "Ready",
  recommendedAction: "Start live mode or use demo mode.",
  sessionConfidence: 0,
  warnings: [],
  audio: emptyAudioFeatures,
  person: emptyPersonFrame,
  surface: emptySurfaceFrame,
};

export interface SessionNotice {
  tone: "info" | "success" | "error";
  text: string;
}

export interface UseRoomVjControllerArgs {
  visualCanvasRef: RefObject<HTMLCanvasElement | null>;
  overlayCanvasRef: RefObject<HTMLCanvasElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function useRoomVjController({
  visualCanvasRef,
  overlayCanvasRef,
  videoRef,
}: UseRoomVjControllerArgs) {
  const [session, setSession] = useState<RoomSession>();
  const [status, setStatus] = useState(initialStatus);
  const [snapshot, setSnapshot] = useState(() => resolveInitialSnapshot());
  const [notice, setNotice] = useState<SessionNotice | null>(() =>
    resolveInitialNotice(),
  );
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedState, setCopiedState] = useState(false);
  const importedOnceRef = useRef(false);

  const inviteUrl = useMemo(() => createShareUrl(snapshot), [snapshot]);

  useEffect(() => {
    const visualCanvas = visualCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!visualCanvas || !overlayCanvas || !video) return;
    const nextSession = createRoomSession({
      visualCanvas,
      overlayCanvas,
      video,
      onStatus: setStatus,
    });
    setSession(nextSession);
    return () => nextSession.stop();
  }, [overlayCanvasRef, videoRef, visualCanvasRef]);

  useEffect(() => {
    writeSessionSnapshot(snapshot);
    session?.setPalette(snapshot.palette);
    session?.setIntensity(snapshot.intensity);
  }, [session, snapshot]);

  useEffect(() => {
    if (!session || importedOnceRef.current) return;
    importedOnceRef.current = true;
    void resumeSnapshot(session, snapshot, setNotice);
  }, [session, snapshot]);

  const updateSnapshot = (updates: Partial<SessionSnapshot>) => {
    setSnapshot((current) => {
      const next = mergeSessionSnapshot(current, updates);
      return {
        ...next,
        roomCode:
          next.roomCode === fallbackSessionSnapshot.roomCode
            ? randomRoomCode()
            : next.roomCode,
      };
    });
  };

  const startDemo = async () => {
    await session?.startDemo();
    updateSnapshot({ launchMode: "demo" });
    setNotice({
      tone: "success",
      text: "Demo mode is running. You can save or share this setup now.",
    });
  };

  const startLive = async () => {
    await session?.startLive();
    updateSnapshot({ launchMode: "live" });
    setNotice({
      tone: "info",
      text: "Live mode is active. If camera or mic access is weak, export diagnostics for support.",
    });
  };

  const stop = () => {
    session?.stop();
    updateSnapshot({ launchMode: "idle" });
    setNotice({
      tone: "info",
      text: "Playback stopped. Your current room setup is still saved locally.",
    });
  };

  const connectSync = async (mode: "host" | "join") => {
    if (!session) return;
    await session.connectSync(snapshot.roomCode, mode);
    updateSnapshot({ syncIntent: mode });
    setNotice({
      tone: "success",
      text:
        mode === "host"
          ? `Hosting room ${snapshot.roomCode}. Share the copied link with nearby devices.`
          : `Joining room ${snapshot.roomCode}. If the host is not online yet, the app will keep retrying.`,
    });
  };

  const disconnectSync = () => {
    session?.disconnectSync();
    updateSnapshot({ syncIntent: "idle" });
    setNotice({
      tone: "info",
      text: "Room sync disconnected. Visuals continue locally.",
    });
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      setNotice({
        tone: "success",
        text: "Share link copied. Another device can open it and inherit this room setup.",
      });
      window.setTimeout(() => setCopiedInvite(false), 1600);
    } catch {
      setNotice({
        tone: "error",
        text: "Share link copy failed because clipboard access was blocked. You can still select and copy the link manually.",
      });
    }
  };

  const copyState = async () => {
    try {
      const payload = JSON.stringify(createSessionExport(snapshot), null, 2);
      await navigator.clipboard.writeText(payload);
      setCopiedState(true);
      setNotice({
        tone: "success",
        text: "Session JSON copied. You can paste it back into Room VJ later.",
      });
      window.setTimeout(() => setCopiedState(false), 1600);
    } catch {
      setNotice({
        tone: "error",
        text: "Session copy failed because clipboard access was blocked. Download the state file instead.",
      });
    }
  };

  const importStateText = async (rawText: string) => {
    try {
      const imported = parseSessionImport(rawText);
      await applyImportedSnapshot(imported);
      setNotice({
        tone: "success",
        text: "Session import applied. Palette, intensity, room code, and link state are restored.",
      });
      return true;
    } catch {
      try {
        const parsed = parseClipboardState(rawText);
        await applyImportedSnapshot(parsed.snapshot);
        setNotice({
          tone: "success",
          text:
            parsed.kind === "room-link"
              ? "Shared link applied from the clipboard."
              : "Room code applied from the clipboard.",
        });
        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Clipboard import failed. Try a Room VJ link, room code, or session export.";
        setNotice({
          tone: "error",
          text: message,
        });
        return false;
      }
    }
  };

  const pasteClipboard = async () => {
    if (!navigator.clipboard?.readText) {
      setNotice({
        tone: "error",
        text: "Clipboard read is unavailable here. Paste a Room VJ link or session file into your clipboard and try on a supported browser.",
      });
      return;
    }
    try {
      const rawText = await navigator.clipboard.readText();
      await importStateText(rawText);
    } catch {
      setNotice({
        tone: "error",
        text: "Clipboard access was blocked. Allow clipboard permissions or use Import State instead.",
      });
    }
  };

  const importStateFile = async (file: File) => {
    const rawText = await file.text();
    await importStateText(rawText);
  };

  const downloadState = () => {
    downloadJson(
      `room-vj-session-${snapshot.roomCode.toLowerCase()}.json`,
      createSessionExport(snapshot),
    );
    setNotice({
      tone: "success",
      text: "Session file downloaded. Import it later to restore this setup.",
    });
  };

  const downloadDiagnostics = () => {
    downloadJson(
      `room-vj-diagnostics-${snapshot.roomCode.toLowerCase()}.json`,
      {
        snapshot,
        diagnostics: status.diagnostics ?? null,
        status: {
          message: status.message,
          recommendedAction: status.recommendedAction,
          sessionConfidence: status.sessionConfidence,
        },
        exportedAt: new Date().toISOString(),
      },
    );
    setNotice({
      tone: "success",
      text: "Diagnostics JSON downloaded. This captures the current session state and runtime analysis.",
    });
  };

  const resetSession = () => {
    try {
      session?.disconnectSync();
      session?.stop();
      clearSessionSnapshot();
      clearShareStateFromLocation();
      const fresh = {
        ...fallbackSessionSnapshot,
        roomCode: randomRoomCode(),
      };
      setSnapshot(fresh);
      setNotice({
        tone: "success",
        text: "Room VJ is reset. Old local and URL state have been cleared.",
      });
    } catch (error) {
      setNotice({
        tone: "error",
        text:
          error instanceof Error
            ? `Reset failed: ${error.message}. Reload the page and try again.`
            : "Reset failed. Reload the page and try again.",
      });
    }
  };

  const setPalette = (palette: PaletteName) => {
    updateSnapshot({ palette });
  };

  const setIntensity = (value: number) => {
    updateSnapshot({ intensity: clamp(value, 0.2, 2) });
  };

  const setRoomCode = (value: string) => {
    const normalized = normalizeRoomCode(value);
    if (!normalized) return;
    updateSnapshot({ roomCode: normalized });
  };

  const toggleDebug = () => {
    const nextDebug = !snapshot.debug;
    const nextSnapshot = mergeSessionSnapshot(snapshot, { debug: nextDebug });
    setSnapshot(nextSnapshot);
    applySnapshotToLocation(nextSnapshot);
  };

  async function applyImportedSnapshot(imported: SessionSnapshot) {
    const nextSnapshot = mergeSessionSnapshot(snapshot, imported);
    setSnapshot(nextSnapshot);
    applySnapshotToLocation(nextSnapshot);
    if (!session) return;
    await resumeSnapshot(session, nextSnapshot, setNotice);
  }

  return {
    copiedInvite,
    copiedState,
    debug: snapshot.debug,
    disconnectSync,
    downloadDiagnostics,
    downloadState,
    importStateFile,
    inviteUrl,
    notice,
    pasteClipboard,
    copyInvite,
    copyState,
    resetSession,
    session,
    setIntensity,
    setPalette,
    setRoomCode,
    snapshot,
    startDemo,
    startLive,
    status,
    stop,
    toggleDebug,
    connectSync,
  };
}

function resolveInitialSnapshot(): SessionSnapshot {
  const stored = readSessionSnapshot();
  const search = new URL(window.location.href).searchParams;
  if (search.size === 0) {
    return stored.roomCode === fallbackSessionSnapshot.roomCode
      ? { ...stored, roomCode: randomRoomCode() }
      : stored;
  }

  return mergeSessionSnapshot(stored, snapshotFromUrl());
}

function resolveInitialNotice(): SessionNotice | null {
  const search = new URL(window.location.href).searchParams;
  if (search.size > 0) {
    return {
      tone: "info",
      text: "Shared room state loaded from the current link.",
    };
  }

  if (localStorage.getItem("room-vj-session")) {
    return {
      tone: "info",
      text: "Your last Room VJ session has been restored locally.",
    };
  }

  return {
    tone: "info",
    text: "Start live mode for your room, or use demo mode to test visuals without permissions.",
  };
}

async function resumeSnapshot(
  session: RoomSession,
  snapshot: SessionSnapshot,
  setNotice: (notice: SessionNotice) => void,
) {
  session.setPalette(snapshot.palette);
  session.setIntensity(snapshot.intensity);

  if (snapshot.launchMode === "demo") {
    await session.startDemo();
  }

  if (snapshot.syncIntent === "join") {
    await session.connectSync(snapshot.roomCode, "join");
    setNotice({
      tone: "info",
      text: `Joining room ${snapshot.roomCode} from restored session state.`,
    });
    return;
  }

  if (snapshot.syncIntent === "host") {
    setNotice({
      tone: "info",
      text: `Room ${snapshot.roomCode} is restored. Tap Host to reopen it for other devices.`,
    });
    return;
  }

  if (snapshot.launchMode === "live") {
    setNotice({
      tone: "info",
      text: "Live mode was your last choice. Tap Start Live to grant devices again.",
    });
  }
}

function downloadJson(fileName: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
