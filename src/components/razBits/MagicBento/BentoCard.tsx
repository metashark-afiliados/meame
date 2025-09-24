// src/components/razBits/MagicBento/BentoCard.tsx
/**
 * @file BentoCard.tsx
 * @description Componente de presentación puro para una tarjeta individual
 *              dentro de la cuadrícula MagicBento.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { twMerge } from "tailwind-merge";
import type { z } from "zod";
import type { BentoCardSchema } from "./magic-bento.schema";

type BentoCardData = z.infer<typeof BentoCardSchema>;

interface BentoCardProps {
  card: BentoCardData;
  cardRef: (node: HTMLDivElement | null) => void;
  className?: string;
  textAutoHide?: boolean;
}

/**
 * @component BentoCard
 * @description Renderiza una única tarjeta, aplicando los estilos y asignando la
 *              ref necesaria para que el hook de interacciones funcione.
 * @returns {React.ReactElement} El elemento JSX de la tarjeta.
 */
export function BentoCard({
  card,
  cardRef,
  className,
  textAutoHide,
}: BentoCardProps): React.ReactElement {
  // La observabilidad se maneja en el orquestador para evitar ruido en la consola.

  return (
    <div
      ref={cardRef}
      className={twMerge(
        `group card flex flex-col justify-between relative aspect-square md:aspect-[4/3] min-h-[200px] p-5 rounded-3xl border border-white/10
         bg-black/30 backdrop-blur-sm overflow-hidden transition-all duration-300
         ease-in-out hover:-translate-y-1`,
        className
      )}
    >
      <div className="card-header flex justify-between items-center relative z-10">
        <span className="text-sm font-semibold text-primary">{card.label}</span>
      </div>
      <div className="card-content flex flex-col relative z-10 transition-opacity duration-300">
        <h3
          className={twMerge(
            "card-title font-bold text-lg text-foreground m-0 mb-1",
            textAutoHide && "group-hover:opacity-0"
          )}
        >
          {card.title}
        </h3>
        <p
          className={twMerge(
            "card-description text-sm text-muted-foreground leading-snug",
            textAutoHide && "group-hover:opacity-0"
          )}
        >
          {card.description}
        </p>
      </div>
      {/* Elemento para el efecto de brillo de borde, controlado por el hook vía JS y CSS variables */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none
                   bg-[radial-gradient(var(--glow-radius)_circle_at_var(--glow-x)_var(--glow-y),_rgba(var(--glow-color),_calc(var(--glow-intensity)_*_0.25)),_transparent_40%)]
                   opacity-[var(--glow-intensity)] transition-opacity duration-300"
        style={
          {
            "--glow-x": "50%",
            "--glow-y": "50%",
            "--glow-intensity": 0,
            "--glow-radius": "400px",
            "--glow-color": "var(--primary-rgb)",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
// src/components/razBits/MagicBento/BentoCard.tsx
