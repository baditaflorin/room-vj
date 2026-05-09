import { useQuery } from "@tanstack/react-query";
import {
  BadgeDollarSign,
  Camera,
  Copy,
  GitFork,
  Link as LinkIcon,
  Mic,
  Play,
  Radio,
  Square,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import {
  APP_COMMIT,
  APP_NAME,
  APP_VERSION,
  GITHUB_API_MAIN_BRANCH,
  PAYPAL_URL,
  REPO_URL,
} from "../lib/constants";
import { clamp } from "../lib/math";
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
import {
  createRoomUrl,
  normalizeRoomCode,
  roomCodeFromUrl,
} from "../features/sync/roomLinks";

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

function AppView() {
  const debug =
    new URLSearchParams(window.location.search).get("debug") === "1";
  const visualCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [session, setSession] = useState<RoomSession>();
  const [status, setStatus] = useState(initialStatus);
  const [roomCode, setRoomCode] = useState(roomCodeFromUrl);
  const [palette, setPalette] = useState<PaletteName>("prism");
  const [intensity, setIntensity] = useState(1);
  const [copied, setCopied] = useState(false);
  const inviteUrl = useMemo(() => createRoomUrl(roomCode), [roomCode]);

  const commitQuery = useQuery({
    queryKey: ["github-main-commit"],
    enabled: window.location.hostname.endsWith("github.io"),
    queryFn: async () => {
      const response = await fetch(GITHUB_API_MAIN_BRANCH);
      if (!response.ok) throw new Error("GitHub metadata unavailable");
      const payload = (await response.json()) as { sha?: string };
      return payload.sha?.slice(0, 12) ?? APP_COMMIT;
    },
  });

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
    const stored = nextSession.getSettings();
    setPalette(stored.palette);
    setIntensity(stored.intensity);
    if (stored.roomCode) setRoomCode(stored.roomCode);
    setSession(nextSession);
    return () => nextSession.stop();
  }, []);

  const updatePalette = (nextPalette: PaletteName) => {
    setPalette(nextPalette);
    session?.setPalette(nextPalette);
  };

  const updateIntensity = (value: number) => {
    const nextIntensity = clamp(value, 0.2, 2);
    setIntensity(nextIntensity);
    session?.setIntensity(nextIntensity);
  };

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090d] text-white">
      <canvas
        ref={visualCanvasRef}
        className="absolute inset-0 h-full w-full"
        aria-label="Live shader canvas"
      />
      <video
        ref={videoRef}
        className="pointer-events-none absolute bottom-4 left-4 hidden aspect-video w-44 rounded-md border border-white/15 object-cover opacity-55 shadow-2xl md:block"
        playsInline
        muted
      />
      <canvas
        ref={overlayCanvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
      />

      <div className="absolute inset-x-0 top-0 z-10 border-b border-white/10 bg-black/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold tracking-normal">
              {APP_NAME}
            </h1>
            <p className="text-xs text-white/62">
              v{APP_VERSION} · commit {commitQuery.data ?? APP_COMMIT}
            </p>
          </div>
          <nav
            className="flex flex-wrap items-center gap-2"
            aria-label="Project links"
          >
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 text-sm font-medium text-white hover:bg-white/18"
            >
              <GitFork size={17} aria-hidden="true" />
              Star on GitHub
            </a>
            <a
              href={PAYPAL_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-cyan-200/25 bg-cyan-300/16 px-3 text-sm font-medium text-cyan-50 hover:bg-cyan-300/24"
            >
              <BadgeDollarSign size={17} aria-hidden="true" />
              PayPal
            </a>
          </nav>
        </div>
      </div>

      <section className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 lg:grid-cols-[1.2fr_1fr_1.25fr]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void session?.startLive()}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!session}
            >
              <Play size={17} aria-hidden="true" />
              Start Live
            </button>
            <button
              type="button"
              onClick={() => void session?.startDemo()}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!session}
            >
              <WandSparkles size={17} aria-hidden="true" />
              Demo
            </button>
            <button
              type="button"
              onClick={() => session?.stop()}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 bg-black/35 px-3 text-sm font-semibold text-white hover:bg-white/12"
            >
              <Square size={16} aria-hidden="true" />
              Stop
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
                  aria-pressed={palette === name}
                  onClick={() => updatePalette(name)}
                  className={`h-9 w-9 rounded-md border ${
                    palette === name ? "border-white" : "border-white/20"
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
                value={intensity}
                onChange={(event) =>
                  updateIntensity(Number(event.currentTarget.value))
                }
                className="w-full accent-cyan-200"
              />
            </label>
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
                  value={roomCode}
                  onChange={(event) =>
                    setRoomCode(normalizeRoomCode(event.currentTarget.value))
                  }
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold uppercase text-white outline-none"
                  aria-label="WebRTC room code"
                />
              </label>
              <button
                type="button"
                onClick={() => void session?.connectSync(roomCode, "host")}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-emerald-200/25 bg-emerald-300/14 px-3 text-sm font-semibold text-emerald-50 hover:bg-emerald-300/22"
              >
                <Radio size={16} aria-hidden="true" />
                Host
              </button>
              <button
                type="button"
                onClick={() => void session?.connectSync(roomCode, "join")}
                className="inline-flex h-11 items-center rounded-md border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/18"
              >
                Join
              </button>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-xs text-white/60">
              <span className="truncate">{inviteUrl}</span>
              <button
                type="button"
                onClick={() => void copyInvite()}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2 text-white hover:bg-white/18"
              >
                <Copy size={14} aria-hidden="true" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className="absolute right-4 top-24 z-10 grid w-[min(22rem,calc(100vw-2rem))] gap-2 rounded-md border border-white/10 bg-black/45 p-3 text-sm text-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-white">{status.message}</span>
          <span className="rounded-md bg-white/10 px-2 py-1 text-xs">
            {Math.round(status.fps)} FPS
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Metric
            icon={<Camera size={14} />}
            label="Camera"
            value={status.camera}
          />
          <Metric
            icon={<Mic size={14} />}
            label="Mic"
            value={status.microphone}
          />
          <Metric label="Renderer" value={status.renderer} />
          <Metric label="Vision" value={status.vision} />
          <Metric
            label="Confidence"
            value={`${Math.round(status.sessionConfidence * 100)}%`}
          />
          <Metric label="Energy" value={status.audio.energy.toFixed(2)} />
          <Metric
            label="Audio"
            value={
              status.diagnostics?.analysis.audioAssessment.classification ??
              "unknown"
            }
          />
          <Metric
            label="Person"
            value={
              status.diagnostics?.analysis.personAssessment.classification ??
              status.person.source
            }
          />
          <Metric label="Edges" value={status.surface.edgeEnergy.toFixed(2)} />
          <Metric
            label="Room"
            value={
              status.diagnostics?.analysis.roomAssessment.classification ??
              "unknown"
            }
          />
          <Metric
            label="Peers"
            value={`${status.sync.peerCount} · ${status.sync.status}`}
          />
        </div>
        <div className="rounded-md border border-cyan-300/15 bg-cyan-300/8 px-3 py-2 text-xs text-cyan-50/90">
          {status.recommendedAction}
        </div>
        {status.warnings.length > 0 ? (
          <div className="grid gap-1 text-xs text-amber-100/85">
            {status.warnings.slice(0, 3).map((warning) => (
              <div
                key={warning}
                className="rounded-md border border-amber-300/15 bg-amber-200/8 px-2 py-1"
              >
                {warning}
              </div>
            ))}
          </div>
        ) : null}
        {debug && status.diagnostics ? (
          <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-black/35 p-2 text-[10px] leading-4 text-white/70">
            {JSON.stringify(
              {
                state: status.diagnostics.state,
                audio: status.diagnostics.analysis.audioAssessment,
                room: status.diagnostics.analysis.roomAssessment,
                person: status.diagnostics.analysis.personAssessment,
                sync: status.diagnostics.analysis.syncAssessment,
              },
              null,
              2,
            )}
          </pre>
        ) : null}
      </aside>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-md border border-white/10 bg-white/7 px-2 py-2">
      <div className="flex items-center gap-1 text-white/45">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 truncate font-medium text-white">{value}</div>
    </div>
  );
}

function paletteClass(name: PaletteName): string {
  if (name === "thermal")
    return "bg-[linear-gradient(135deg,#090a13,#f23b2f,#ffe28a)]";
  if (name === "noir")
    return "bg-[linear-gradient(135deg,#05070a,#9ee8ff,#ff4f99)]";
  return "bg-[linear-gradient(135deg,#30e8bf,#fffb7d,#ff4f99)]";
}

export function App() {
  return (
    <ErrorBoundary>
      <AppView />
    </ErrorBoundary>
  );
}
