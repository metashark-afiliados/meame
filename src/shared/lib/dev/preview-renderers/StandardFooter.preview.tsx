// lib/dev/preview-renderers/StandardFooter.preview.tsx
/**
 * @file StandardFooter.preview.tsx
 * @description Renderizador de previsualización atómico, internacionalizado y tematizado.
 *              v2.1.0: Alineado con el contrato de tipos `PreviewRenderer` corregido.
 * @version 2.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import * as React from "react";
import type { PreviewRenderResult, PreviewRenderer } from "./_types";
import { getEdgeDictionary } from "@/shared/lib/i18n/i18n.edge";
import { logger } from "@/shared/lib/logging";

export const StandardFooterPreview: PreviewRenderer = async (
  locale
): Promise<PreviewRenderResult | null> => {
  logger.trace(`[StandardFooter.preview] Renderizando para locale: ${locale}`);
  const { dictionary } = await getEdgeDictionary(locale);
  const content = dictionary.footer;

  if (!content) return null;

  return {
    jsx: (
      <div tw="flex flex-col w-full text-foreground bg-muted/40 border border-border rounded-lg p-8">
        <div tw="flex justify-between w-full border-b border-border pb-8">
          <div tw="flex flex-col w-1/3">
            <span tw="font-semibold">{content.newsletter.title}</span>
            <span tw="text-xs text-muted-foreground mt-2">
              {content.newsletter.description}
            </span>
            <div tw="flex mt-4">
              <div tw="flex-grow bg-background h-8 rounded-l-md" />
              <div tw="bg-primary text-primary-foreground h-8 px-4 flex items-center text-xs rounded-r-md">
                {content.newsletter.buttonText}
              </div>
            </div>
          </div>
          <div tw="flex gap-8">
            {content.linkColumns.map((col) => (
              <div key={col.title} tw="flex flex-col">
                <span tw="font-semibold mb-2">{col.title}</span>
                {col.links.map((link) => (
                  <span key={link.label} tw="text-xs text-muted-foreground">
                    {link.label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div tw="flex justify-between w-full pt-4 text-xs text-muted-foreground">
          <span>{content.copyright}</span>
          <div tw="flex gap-4">
            <div tw="w-4 h-4 rounded-full bg-muted" />
            <div tw="w-4 h-4 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    ),
    width: 1200,
    height: 250,
  };
};
// lib/dev/preview-renderers/StandardFooter.preview.tsx
