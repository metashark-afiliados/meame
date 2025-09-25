// RUTA: src/shared/hooks/aether/use-progress-tracker.ts
/**
 * @file use-progress-tracker.ts
 * @description Hook atómico para rastrear el progreso de reproducción del vídeo.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect } from "react";
import type { VideoTexture } from "three";

export interface ProgressState {
  currentTime: number;
  duration: number;
}

export function useProgressTracker(videoTexture: VideoTexture) {
  const [progress, setProgress] = useState<ProgressState>({
    currentTime: 0,
    duration: 0,
  });

  useEffect(() => {
    const video = videoTexture.image as HTMLVideoElement;
    const handleTimeUpdate = () =>
      setProgress((p) => ({ ...p, currentTime: video.currentTime }));
    const handleDurationChange = () => {
      if (!isNaN(video.duration)) {
        setProgress((p) => ({ ...p, duration: video.duration }));
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    if (video.duration) handleDurationChange();

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
    };
  }, [videoTexture]);

  return progress;
}
