// RUTA: src/shared/hooks/use-cinematic-renderer.ts
/**
 * @file use-cinematic-renderer.ts
 * @description Hook orquestador para el motor "Aether". Compone hooks atómicos
 *              para gestionar la lógica de renderizado cinematográfico.
 * @version 3.0.0 (Atomic Orchestrator)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useRef, useCallback } from "react";
import { useVideoTexture } from "@react-three/drei";
import type { PositionalAudio as PositionalAudioImpl } from "three";
import { usePlaybackControl } from "./aether/use-playback-control";
import { useProgressTracker } from "./aether/use-progress-tracker";
import { useFullscreenManager } from "./aether/use-fullscreen-manager";
import {
  useAetherTelemetry,
  type PlaybackEvent,
} from "./aether/use-aether-telemetry";

interface CinematicRendererProps {
  src: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPlaybackEvent?: (event: PlaybackEvent) => void;
}

export function useCinematicRenderer({
  src,
  containerRef,
  onPlaybackEvent,
}: CinematicRendererProps) {
  const videoTexture = useVideoTexture(src);
  const audioRef = useRef<PositionalAudioImpl>(null);

  // Composición de hooks atómicos
  const { isPlaying, isMuted, togglePlay, toggleMute } = usePlaybackControl({
    videoTexture,
    audioRef,
  });
  const progress = useProgressTracker(videoTexture);
  const { isFullscreen, toggleFullscreen } = useFullscreenManager(containerRef);
  const { dispatchEvent } = useAetherTelemetry(videoTexture, onPlaybackEvent);

  const onSeek = useCallback(
    (time: number) => {
      const video = videoTexture.image as HTMLVideoElement;
      video.currentTime = time;

      const audio = audioRef.current;
      if (audio && audio.isPlaying) {
        audio.stop();
        audio.offset = time;
        audio.play();
      }
      dispatchEvent("seek");
    },
    [videoTexture, dispatchEvent]
  );

  return {
    videoTexture,
    audioRef,
    isPlaying,
    isMuted,
    isFullscreen,
    progress,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    onSeek,
  };
}
