// RUTA: src/shared/hooks/aether/use-playback-control.ts
/**
 * @file use-playback-control.ts
 * @description Hook atómico para gestionar el estado de reproducción y volumen
 *              del motor "Aether".
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { logger } from "@/shared/lib/logging";
import type {
  VideoTexture,
  PositionalAudio as PositionalAudioImpl,
} from "three";

interface UsePlaybackControlProps {
  videoTexture: VideoTexture;
  audioRef: React.RefObject<PositionalAudioImpl>;
}

export function usePlaybackControl({
  videoTexture,
  audioRef,
}: UsePlaybackControlProps) {
  logger.trace("[usePlaybackControl] Hook inicializado.");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = useCallback(() => setIsPlaying((prev) => !prev), []);
  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);

  useEffect(() => {
    const videoElement = videoTexture.image as HTMLVideoElement;
    const audioObject = audioRef.current;

    if (isPlaying) {
      videoElement
        .play()
        .catch((e) => logger.warn("Autoplay de vídeo bloqueado.", { e }));
      if (audioObject?.source && !audioObject.isPlaying) {
        audioObject.play();
      }
    } else {
      videoElement.pause();
      if (audioObject?.isPlaying) {
        audioObject.pause();
      }
    }

    if (audioObject) {
      audioObject.setVolume(isMuted ? 0 : 1);
    }
    videoElement.muted = true; // El vídeo siempre está muteado para delegar al audio 3D.
  }, [isPlaying, isMuted, videoTexture, audioRef]);

  return { isPlaying, isMuted, togglePlay, toggleMute };
}
