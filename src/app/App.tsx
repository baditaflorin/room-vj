import { useRef } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AppHeader } from "./AppHeader";
import { ControlDock } from "./ControlDock";
import { StatusPanel } from "./StatusPanel";
import { useRoomVjController } from "./useRoomVjController";

function AppView() {
  const visualCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controller = useRoomVjController({
    visualCanvasRef,
    overlayCanvasRef,
    videoRef,
  });

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

      <AppHeader />
      <ControlDock
        copiedInvite={controller.copiedInvite}
        copiedState={controller.copiedState}
        inviteUrl={controller.inviteUrl}
        notice={controller.notice}
        onConnectSync={controller.connectSync}
        onCopyInvite={controller.copyInvite}
        onCopyState={controller.copyState}
        onDisconnectSync={controller.disconnectSync}
        onDownloadDiagnostics={controller.downloadDiagnostics}
        onDownloadState={controller.downloadState}
        onImportStateFile={controller.importStateFile}
        onPasteClipboard={controller.pasteClipboard}
        onResetSession={controller.resetSession}
        onSetIntensity={controller.setIntensity}
        onSetPalette={controller.setPalette}
        onSetRoomCode={controller.setRoomCode}
        onStartDemo={controller.startDemo}
        onStartLive={controller.startLive}
        onStop={controller.stop}
        onToggleDebug={controller.toggleDebug}
        sessionReady={Boolean(controller.session)}
        snapshot={controller.snapshot}
        status={controller.status}
      />
      <StatusPanel debug={controller.debug} status={controller.status} />
    </main>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppView />
    </ErrorBoundary>
  );
}
