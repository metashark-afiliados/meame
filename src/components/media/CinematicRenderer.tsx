// RUTA: src/components/media/CinematicRenderer.tsx
/**
 * @file CinematicRenderer.tsx
 * @description Fachada pública para "Aether", ahora con un contrato de API completo para audio.
 * @version 2.0.0 (API Contract Expansion)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React, { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useCinematicRenderer,
  type PlaybackEvent,
  type CinematicRendererHook,
} from "@/shared/hooks/use-cinematic-renderer";
import { logger } from "@/shared/lib/logging";
import { cn } from "@/shared/lib/utils/cn";
import {
  Frame,
  BrandLogo,
  ControlsBar,
} from "@/components/ui/cinematic-controls";
import { VideoPlane } from "./VideoPlane";

// --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
interface CinematicRendererProps {
  src: string;
  audioSrc?: string; // La prop ahora es parte oficial del contrato.
  className?: string;
}
// --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---

export function CinematicRenderer({
  src,
  audioSrc, // Se recibe la nueva prop.
  className,
}: CinematicRendererProps): React.ReactElement {
  logger.info(
    "[CinematicRenderer] Componente renderizado (v2.0 - API Expanded)."
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const handlePlaybackEvent = useCallback((event: PlaybackEvent) => {
    logger.info(`[Aether Telemetry] Evento de Reproducción`, event);
  }, []);

  const hookState = useCinematicRenderer({
    src,
    audioSrc,
    containerRef,
    onPlaybackEvent: handlePlaybackEvent,
  });

  type ControlsBarProps = Pick<
    CinematicRendererHook,
    | "isPlaying"
    | "togglePlay"
    | "isMuted"
    | "toggleMute"
    | "isFullscreen"
    | "toggleFullscreen"
    | "progress"
    | "onSeek"
  >;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden group",
        className
      )}
    >
      <Canvas>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} />
        {hookState.videoTexture && (
          <VideoPlane
            texture={hookState.videoTexture}
            audioRef={hookState.audioRef}
            audioSrc={audioSrc} // Se pasa la prop al componente de la escena.
          />
        )}
      </Canvas>
      <Frame>
        <BrandLogo />
        <ControlsBar {...(hookState as ControlsBarProps)} />
      </Frame>
    </div>
  );
}
