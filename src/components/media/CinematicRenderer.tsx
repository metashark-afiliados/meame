// components/media/CinematicRenderer.tsx
/**
 * @file CinematicRenderer.tsx
 * @description Fachada pública para "Aether".
 *              v1.5.0: Soporte para audio espacial 3D.
 * @version 1.5.0
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
import { Frame } from "@/components/ui/cinematic-controls/Frame";
import { BrandLogo } from "@/components/ui/cinematic-controls/BrandLogo";
import { ControlsBar } from "@/components/ui/cinematic-controls/ControlsBar";
import { VideoPlane } from "./VideoPlane";

interface CinematicRendererComponentProps {
  src: string;
  audioSrc?: string;
  className?: string;
}

export function CinematicRenderer({
  src,
  audioSrc,
  className,
}: CinematicRendererComponentProps): React.ReactElement {
  logger.info("[CinematicRenderer] Componente renderizado (v1.5 - Audio 3D).");

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

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden group",
        className
      )}
    >
      <Canvas>
        {/* El componente Listener es necesario para que PositionalAudio funcione */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} />
        {hookState.videoTexture && (
          <VideoPlane
            texture={hookState.videoTexture}
            audioRef={hookState.audioRef}
            audioSrc={audioSrc}
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

// Sub-tipo para asegurar el contrato de ControlsBar
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
// components/media/CinematicRenderer.tsx
