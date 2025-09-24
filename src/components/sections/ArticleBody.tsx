// components/sections/ArticleBody.tsx
/**
 * @file ArticleBody.tsx
 * @description Componente de presentación puro para renderizar el cuerpo de un artículo.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { Container } from "@/components/ui";
import { logger } from "@/shared/lib/logging";

interface ArticleBodyProps {
  content: string; // El contenido en formato Markdown
}

export function ArticleBody({ content }: ArticleBodyProps): React.ReactElement {
  logger.trace("[ArticleBody] Renderizando contenido Markdown.");

  // En una app de producción, aquí usaríamos una librería como react-markdown
  // para convertir de forma segura el Markdown a HTML.
  // Por simplicidad, lo renderizamos dentro de un div con estilos de prosa.
  return (
    <Container className="max-w-4xl py-12">
      <div
        className="prose prose-invert lg:prose-xl mx-auto"
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br />") }} // Simulación simple
      />
    </Container>
  );
}
// components/sections/ArticleBody.tsx
