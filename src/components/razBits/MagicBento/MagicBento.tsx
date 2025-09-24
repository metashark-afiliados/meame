// components/razBits/MagicBento/MagicBento.tsx
/**
 * @file MagicBento.tsx
 * @description Componente orquestador para la sección interactiva MagicBento.
 *              v3.0.0 (Naming Convention Fix): Se alinea la importación del
 *              hook con la convención de nomenclatura kebab-case.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useRef } from "react";
import { twMerge } from "tailwind-merge";
// --- [INICIO DE CORRECCIÓN DE RUTA] ---
import { useBentoGridInteraction } from "@/components/razBits/MagicBento/use-bento-grid-interaction";
// --- [FIN DE CORRECCIÓN DE RUTA] ---
import { BentoCard } from "./BentoCard";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import {
  type BentoCardData,
  MagicBentoConfigSchema,
} from "./magic-bento.schema";
import { logger } from "@/shared/lib/logging";

interface MagicBentoProps {
  content: Dictionary["magicBento"];
  className?: string;
}

export function MagicBento({
  content,
  className,
}: MagicBentoProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando orquestador MagicBento v3.0");
  const gridRef = useRef<HTMLDivElement | null>(null);

  const configForHook = MagicBentoConfigSchema.parse(content?.config || {});

  const { initializeCardInteractions } = useBentoGridInteraction(
    gridRef,
    configForHook
  );

  if (!content) {
    logger.warn("[MagicBento] No se proporcionó contenido. No se renderizará.");
    return null;
  }

  const { config, cards } = content;

  return (
    <div
      ref={gridRef}
      className={twMerge(
        `bento-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[250px] gap-4 max-w-7xl mx-auto p-4`,
        className
      )}
      style={
        {
          "--glow-color-rgb": `var(--${config.glowColor}-rgb)`,
        } as React.CSSProperties
      }
    >
      {cards.map((card: BentoCardData, index: number) => (
        <BentoCard
          key={card.title}
          card={card}
          cardRef={initializeCardInteractions}
          textAutoHide={config.textAutoHide}
          className={twMerge(
            index === 2 && "lg:col-span-2 lg:row-span-2",
            index === 3 && "lg:col-span-2"
          )}
        />
      ))}
    </div>
  );
}
// components/razBits/MagicBento/MagicBento.tsx
