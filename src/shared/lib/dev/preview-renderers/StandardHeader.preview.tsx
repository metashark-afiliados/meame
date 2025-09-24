// shared/lib/dev/preview-renderers/StandardFooter.preview.tsx
/**
 * @file StandardFooter.preview.tsx
 * @description Renderizador de previsualización atómico, purificado y desacoplado.
 *              Consume la utilidad SSoT `getStyleFromTheme` para su estilizado.
 * @version 3.0.0 (Decoupled & Pure)
 * @author RaZ Podestá - MetaShark Tech
 */
import * as React from "react";
import type { PreviewRenderResult, PreviewRenderer } from "./_types";
import { getEdgeDictionary } from "@/shared/lib/i18n/i18n.edge";
import { logger } from "@/shared/lib/logging";
import { getStyleFromTheme } from "./_utils";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";

export const StandardFooterPreview: PreviewRenderer = async (
  locale,
  theme: AssembledTheme
): Promise<PreviewRenderResult | null> => {
  logger.trace(
    `[StandardFooter.preview] Renderizando para locale: ${locale} (v3.0)`
  );
  const { dictionary } = await getEdgeDictionary(locale);
  const content = dictionary.footer;

  if (!content) return null;

  // El componente ahora solo invoca a la SSoT de transformación de estilos.
  const styles = getStyleFromTheme(theme);

  return {
    jsx: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          // --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
          fontFamily: styles.fontFamily,
          backgroundColor: styles.mutedBackgroundColor,
          color: styles.mutedForegroundColor,
          border: `1px solid ${styles.borderColor}`,
          // --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
          borderRadius: "0.5rem",
          padding: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            borderBottom: `1px solid ${styles.borderColor}`,
            paddingBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: "33.33%" }}>
            <span style={{ fontWeight: "600", color: styles.color }}>
              {content.newsletter.title}
            </span>
            <span style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
              {content.newsletter.description}
            </span>
            <div style={{ display: "flex", marginTop: "1rem" }}>
              <div
                style={{
                  flexGrow: 1,
                  backgroundColor: styles.backgroundColor,
                  height: "2rem",
                  borderRadius: "0.375rem 0 0 0.375rem",
                }}
              />
              <div
                style={{
                  backgroundColor: styles.primaryColor,
                  color: styles.primaryForegroundColor,
                  height: "2rem",
                  padding: "0 1rem",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.75rem",
                  borderRadius: "0 0.375rem 0.375rem 0",
                }}
              >
                {content.newsletter.buttonText}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2rem" }}>
            {content.linkColumns.map((col) => (
              <div key={col.title} style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    color: styles.color,
                  }}
                >
                  {col.title}
                </span>
                {col.links.map((link) => (
                  <span key={link.label} style={{ fontSize: "0.75rem" }}>
                    {link.label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "1rem",
            fontSize: "0.75rem",
          }}
        >
          <span>{content.copyright}</span>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div
              style={{
                width: "1rem",
                height: "1rem",
                borderRadius: "9999px",
                backgroundColor: styles.mutedBackgroundColor,
              }}
            />
            <div
              style={{
                width: "1rem",
                height: "1rem",
                borderRadius: "9999px",
                backgroundColor: styles.mutedBackgroundColor,
              }}
            />
          </div>
        </div>
      </div>
    ),
    width: 1200,
    height: 250,
  };
};
// shared/lib/dev/preview-renderers/StandardFooter.preview.tsx
