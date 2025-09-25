// RUTA: src/components/ui/DigitalConfetti.tsx
/**
 * @file DigitalConfetti.tsx
 * @description Aparato de élite para renderizar una celebración de confeti digital.
 *              Soberano, tematizado dinámicamente e inyectado con MEA/UX (feedback auditivo).
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";
import { useTheme } from "next-themes";
import { logger } from "@/shared/lib/logging";
import { useSound } from "@/shared/hooks/use-sound";

/**
 * @interface DigitalConfettiProps
 * @description Contrato de props para el componente de confeti de élite.
 */
interface DigitalConfettiProps {
  /** Controla si la animación de confeti está activa. */
  isActive: boolean;
  /** Callback que se ejecuta cuando la animación de caída termina. */
  onComplete?: () => void;
  /** Duración en milisegundos de la animación. Por defecto 5000ms. */
  duration?: number;
  /** Array de claves de color semánticas (ej. 'primary', 'accent') a usar. */
  semanticColors?: string[];
  /** Número de partículas de confeti a renderizar. */
  particleCount?: number;
  /** Si se debe reproducir un sonido al iniciar. */
  playSound?: boolean;
}

/**
 * @function getCssVariableValue
 * @description Helper de cliente para obtener el valor HSL de una variable CSS.
 * @private
 */
const getCssVariableValue = (variable: string): string | null => {
  if (typeof window === "undefined") return null;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

/**
 * @component DigitalConfetti
 * @description Orquesta una celebración visual y auditiva de confeti.
 */
export function DigitalConfetti({
  isActive,
  onComplete,
  duration = 5000,
  semanticColors = ["--primary", "--secondary", "--accent"],
  particleCount = 200,
  playSound = true,
}: DigitalConfettiProps): React.ReactElement | null {
  logger.trace("[DigitalConfetti] Renderizando componente v2.0.");

  const { width, height } = useWindowSize();
  const { theme } = useTheme(); // Para detectar cambios de tema (light/dark)
  const [isRunning, setIsRunning] = useState(false);
  const playPopSound = useSound("/sounds/confetti-pop.mp3", 0.3);

  // Resuelve los colores semánticos a valores HSL/Hex reales.
  // Se memoiza y recalcula solo cuando el tema o los colores semánticos cambian.
  const resolvedColors = useMemo(() => {
    logger.trace("[DigitalConfetti] Resolviendo colores semánticos a HSL.");
    return semanticColors
      .map((variable) => {
        const hslValue = getCssVariableValue(variable);
        return hslValue ? `hsl(${hslValue})` : null;
      })
      .filter((color): color is string => color !== null);
  }, [semanticColors, theme]); // Depende del `theme` para re-evaluar en cambio de modo

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      logger.info("[DigitalConfetti] Activado. Iniciando celebración.");
      if (playSound) {
        playPopSound();
      }
      setIsRunning(true);
      timer = setTimeout(() => {
        logger.info(
          "[DigitalConfetti] Duración completada. Finalizando animación."
        );
        setIsRunning(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [isActive, duration, onComplete, playSound, playPopSound]);

  if (!isActive || !width || !height) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      <ReactConfetti
        width={width}
        height={height}
        numberOfPieces={isRunning ? particleCount : 0}
        gravity={0.1}
        recycle={false}
        colors={resolvedColors}
      />
    </div>
  );
}
