import { Camera, Mic, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { RuntimeStatus } from "../features/session/types";

interface StatusPanelProps {
  debug: boolean;
  status: RuntimeStatus;
}

export function StatusPanel({ debug, status }: StatusPanelProps) {
  return (
    <aside className="absolute right-4 top-24 z-10 grid w-[min(23rem,calc(100vw-2rem))] gap-2 rounded-md border border-white/10 bg-black/45 p-3 text-sm text-white/80 backdrop-blur-xl">
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
          label="BPM"
          value={
            status.audio.bpm > 0
              ? `${status.audio.bpm.toFixed(0)} · ${Math.round(status.audio.tempoConfidence * 100)}%`
              : "—"
          }
        />
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
        <Metric
          label="Room"
          value={status.sync.roomCode ? status.sync.roomCode : "not linked"}
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
              <span className="flex items-start gap-2">
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                <span>{warning}</span>
              </span>
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
