// components/ui/DigitalConfetti.tsx

'use client'; // Este componente necesita ejecutarse en el cliente

import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

/**
 * @author RaZ Podestá - MetaShark Tech
 * @description Un aparato de élite para renderizar una celebración de confeti digital.
 * Está diseñado para activarse, ejecutarse durante un tiempo y luego autodestruirse.
 * Utiliza el hook `useWindowSize` para llenar toda la pantalla.
 *
 * @param isActive Controla si la animación de confeti está activa.
 * @param onComplete Una función de callback que se ejecuta cuando la animación termina.
 * @param duration La duración en milisegundos durante la cual el confeti caerá. Por defecto 5000ms.
 * @param colors Un array de strings con los colores del confeti.
 */
interface DigitalConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
  colors?: string[];
}

const DigitalConfetti: React.FC<DigitalConfettiProps> = ({
  isActive,
  onComplete,
  duration = 5000,
  colors = ['#FFC700', '#FF0000', '#2E3192', '#41BBC4'], // Colores de ejemplo
}) => {
  const { width, height } = useWindowSize();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsRunning(true);
      const timer = setTimeout(() => {
        setIsRunning(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);

      // Limpieza del temporizador si el componente se desmonta
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  if (!isActive) {
    return null;
  }

  return (
    <ReactConfetti
      width={width ?? 0}
      height={height ?? 0}
      numberOfPieces={isRunning ? 200 : 0}
      gravity={0.1}
      recycle={false} // Importante: no reciclar para que desaparezca
      colors={colors}
    />
  );
};

export default DigitalConfetti;
