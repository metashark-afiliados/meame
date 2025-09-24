// components/sections/TextSection.tsx
/**
 * @file TextSection.tsx
 * @description Motor de renderizado de contenido estructurado.
 *              - v3.0.0: Refactorizado para ser un renderizador data-driven,
 *                aceptando un array de bloques de contenido y encapsulando
 *                la lógica de renderizado.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/shared/lib/utils/cn";
import { logger } from "@/shared/lib/logging";
import type {
  ContentBlocks,
  ContentBlock,
} from "@/shared/lib/schemas/components/content-block.schema"; // <-- [1] IMPORTAR CONTRATO

interface TextSectionProps {
  content: ContentBlocks; // <-- [2] PROP PRINCIPAL AHORA ES 'content'
  className?: string;
  spacing?: "default" | "compact" | "loose";
  prose?: boolean;
}

export function TextSection({
  content,
  className,
  spacing = "default",
  prose = true, // Por defecto, aplicamos estilos de prosa
}: TextSectionProps): React.ReactElement {
  logger.info("[Observabilidad] Renderizando TextSection (Motor de Contenido)");

  const spacingClasses = {
    default: "py-16 sm:py-24",
    compact: "py-8 sm:py-12",
    loose: "py-24 sm:py-32",
  };

  const sectionClasses = cn(spacingClasses[spacing], className);
  const containerClasses = cn({
    "prose prose-invert lg:prose-xl mx-auto": prose,
  });

  return (
    <section className={sectionClasses}>
      <Container className={containerClasses}>
        {/* --- [3] LÓGICA DE RENDERIZADO ENCAPSULADA --- */}
        {content.map((block: ContentBlock, index: number) => {
          if (block.type === "h2") {
            return <h2 key={index}>{block.text}</h2>;
          }
          // El caso por defecto es un párrafo
          return <p key={index}>{block.text}</p>;
        })}
        {/* --- FIN DE LA LÓGICA DE RENDERIZADO --- */}
      </Container>
    </section>
  );
}
