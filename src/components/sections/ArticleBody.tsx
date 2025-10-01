// RUTA: src/components/sections/ArticleBody.tsx
/**
 * @file ArticleBody.tsx
 * @description Componente de presentación de élite para renderizar el cuerpo de un artículo.
 *              v2.0.0 (Secure Markdown Rendering): Reemplaza `dangerouslySetInnerHTML`
 *              con `react-markdown` y `rehype-sanitize` para un renderizado seguro,
 *              robusto y con soporte completo para Markdown, eliminando vulnerabilidades XSS.
 * @version 2.0.0
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Container } from "@/components/ui";
import { logger } from "@/shared/lib/logging";

interface ArticleBodyProps {
  content: string; // El contenido ahora se espera que sea un string de Markdown.
}

export function ArticleBody({ content }: ArticleBodyProps): React.ReactElement {
  const traceId = logger.startTrace("ArticleBody_Render_v2.0");
  logger.info(
    "[ArticleBody] Renderizando contenido Markdown de forma segura.",
    { traceId }
  );

  return (
    <Container className="max-w-4xl py-12">
      <article className="prose dark:prose-invert lg:prose-xl mx-auto">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {content}
        </ReactMarkdown>
      </article>
    </Container>
  );
}
