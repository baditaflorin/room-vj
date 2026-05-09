import {
  Clipboard,
  Copy,
  FolderUp,
  Link as LinkIcon,
  Play,
  Radio,
  RotateCcw,
  Save,
  Square,
  Unplug,
  WandSparkles,
} from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import type { PaletteName, RuntimeStatus } from "../features/session/types";
import type { SessionSnapshot } from "../lib/storage";
import { paletteClass } from "./palette";
import type { SessionNotice } from "./useRoomVjController";

interface ControlDockProps {
  copiedInvite: boolean;
  copiedState: boolean;
  inviteUrl: string;
  notice: SessionNotice | null;
  onConnectSync(mode: "host" | "join"): Promise<void>;
  onCopyInvite(): Promise<void>;
  onCopyState(): Promise<void>;
  onDisconnectSync(): void;
  onDownloadDiagnostics(): void;
  onDownloadState(): void;
  onImportStateFile(file: File): Promise<void>;
  onPasteClipboard(): Promise<void>;
  onResetSession(): void;
  onSetIntensity(value: number): void;
  onSetPalette(palette: PaletteName): void;
  onSetRoomCode(value: string): void;
  onStartDemo(): Promise<void>;
  onStartLive(): Promise<void>;
  onStop(): void;
  onToggleDebug(): void;
  sessionReady: boolean;
  snapshot: SessionSnapshot;
  status: RuntimeStatus;
}

export function ControlDock({
  copiedInvite,
  copiedState,
  inviteUrl,
  notice,
  onConnectSync,
  onCopyInvite,
  onCopyState,
  onDisconnectSync,
  onDownloadDiagnostics,
  onDownloadState,
  onImportStateFile,
  onPasteClipboard,
  onResetSession,
  onSetIntensity,
  onSetPalette,
  onSetRoomCode,
  onStartDemo,
  onStartLive,
  onStop,
  onToggleDebug,
  sessionReady,
  snapshot,
  status,
}: ControlDockProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    await onImportStateFile(file);
    input.value = "";
  };

  return (
    <section className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 lg:grid-cols-[1.1fr_1fr_1.35fr]">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void onStartLive()}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!sessionReady}
            >
              <Play size={17} aria-hidden="true" />
              Start Live
            </button>
            <button
              type="button"
              onClick={() => void onStartDemo()}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!sessionReady}
            >
              <WandSparkles size={17} aria-hidden="true" />
              Demo
            </button>
            <button
              type="button"
              onClick={onStop}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-black/35 px-3 text-sm font-semibold text-white hover:bg-white/12"
            >
              <Square size={16} aria-hidden="true" />
              Stop
            </button>
            <button
              type="button"
              onClick={onResetSession}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-black/35 px-3 text-sm font-semibold text-white hover:bg-white/12"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Start Fresh
            </button>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-center gap-3">
            <div
              className="flex items-center gap-2"
              role="group"
              aria-label="Palette"
            >
              {(["prism", "thermal", "noir"] as PaletteName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-label={`${name} palette`}
                  aria-pressed={snapshot.palette === name}
                  onClick={() => onSetPalette(name)}
                  className={`h-9 w-9 rounded-md border ${
                    snapshot.palette === name
                      ? "border-white"
                      : "border-white/20"
                  } ${paletteClass(name)}`}
                />
              ))}
            </div>
            <label className="flex items-center gap-3 text-xs text-white/70">
              Intensity
              <input
                type="range"
                min="0.2"
                max="2"
                step="0.05"
                value={snapshot.intensity}
                onChange={(event) =>
                  onSetIntensity(Number(event.currentTarget.value))
                }
                className="w-full accent-cyan-200"
              />
            </label>
          </div>
          {notice ? (
            <div
              className={`rounded-md border px-3 py-2 text-xs ${
                notice.tone === "error"
                  ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
                  : notice.tone === "success"
                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                    : "border-white/12 bg-white/7 text-white/75"
              }`}
            >
              {notice.text}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2">
          <div className="flex gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3">
              <LinkIcon
                size={16}
                aria-hidden="true"
                className="shrink-0 text-white/65"
              />
              <input
                value={snapshot.roomCode}
                onChange={(event) => onSetRoomCode(event.currentTarget.value)}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold uppercase text-white outline-none"
                aria-label="WebRTC room code"
              />
            </label>
            <button
              type="button"
              onClick={() => void onConnectSync("host")}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-emerald-200/25 bg-emerald-300/14 px-3 text-sm font-semibold text-emerald-50 hover:bg-emerald-300/22"
            >
              <Radio size={16} aria-hidden="true" />
              Host
            </button>
            <button
              type="button"
              onClick={() => void onConnectSync("join")}
              className="inline-flex h-11 items-center rounded-md border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/18"
            >
              Join
            </button>
          </div>
          <p className="text-xs text-white/55">
            Host keeps the room open for nearby devices. Join follows a shared
            room link and retries until the host appears.
          </p>
          <div className="flex min-w-0 items-center gap-2 text-xs text-white/60">
            <span className="truncate">{inviteUrl}</span>
            <button
              type="button"
              onClick={() => void onCopyInvite()}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2 text-white hover:bg-white/18"
            >
              <Copy size={14} aria-hidden="true" />
              {copiedInvite ? "Copied" : "Copy Link"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onPasteClipboard()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/18"
            >
              <Clipboard size={14} aria-hidden="true" />
              Paste Link / State
            </button>
            <button
              type="button"
              onClick={onDisconnectSync}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-white/15 bg-black/35 px-3 text-xs font-semibold text-white hover:bg-white/12"
            >
              <Unplug size={14} aria-hidden="true" />
              Disconnect
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="rounded-md border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Session State
                </h2>
                <p className="mt-1 text-xs text-white/60">
                  Save this room, move it to another device, or export
                  diagnostics when something feels off.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={snapshot.debug}
                  onChange={onToggleDebug}
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                />
                Debug overlay
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onDownloadState}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/18"
              >
                <Save size={14} aria-hidden="true" />
                Download State
              </button>
              <button
                type="button"
                onClick={() => void onCopyState()}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/18"
              >
                <Copy size={14} aria-hidden="true" />
                {copiedState ? "State Copied" : "Copy State"}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/18"
              >
                <FolderUp size={14} aria-hidden="true" />
                Import State
              </button>
              <button
                type="button"
                onClick={onDownloadDiagnostics}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/18"
              >
                <Save size={14} aria-hidden="true" />
                Export Diagnostics
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(event) => void handleFileChange(event)}
              />
            </div>
            <dl className="mt-3 grid gap-1 text-xs text-white/60 sm:grid-cols-2">
              <div>
                <dt className="text-white/40">Launch intent</dt>
                <dd className="capitalize">{snapshot.launchMode}</dd>
              </div>
              <div>
                <dt className="text-white/40">Sync intent</dt>
                <dd className="capitalize">{snapshot.syncIntent}</dd>
              </div>
              <div>
                <dt className="text-white/40">Current room</dt>
                <dd>{snapshot.roomCode}</dd>
              </div>
              <div>
                <dt className="text-white/40">Status</dt>
                <dd>{status.sync.status}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
