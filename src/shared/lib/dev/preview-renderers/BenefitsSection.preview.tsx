// shared/lib/dev/preview-renderers/BenefitsSection.preview.tsx
/**
 * @file BenefitsSection.preview.tsx
 * @description Renderizador de previsualización atómico, ahora purificado y
 *              desacoplado de la lógica de theming, consumiendo la SSoT de estilos.
 * @version 3.0.0 (Decoupled & Pure)
 * @author RaZ Podestá - MetaShark Tech
 */
import * as React from "react";
import type { PreviewRenderResult, PreviewRenderer } from "./_types";
import { getEdgeDictionary } from "@/shared/lib/i18n/i18n.edge";
import { logger } from "@/shared/lib/logging";
import { getStyleFromTheme } from "./_utils";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";

export const BenefitsSectionPreview: PreviewRenderer = async (
  locale,
  theme: AssembledTheme
): Promise<PreviewRenderResult | null> => {
  logger.trace(
    `[BenefitsSection.preview] Renderizando para locale: ${locale} (v3.0)`
  );
  const { dictionary } = await getEdgeDictionary(locale);
  const content = dictionary.benefitsSection;

  if (!content) return null;

  // El componente invoca a la SSoT de transformación de estilos.
  const styles = getStyleFromTheme(theme);

  return {
    jsx: (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          padding: "2rem",
          // Se aplican estilos desde la SSoT.
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontFamily: styles.fontFamily,
          border: `1px solid ${styles.borderColor}`,
          borderRadius: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            paddingRight: "2rem",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              color: styles.primaryColor,
              fontWeight: "700",
              letterSpacing: "0.05em",
            }}
          >
            {content.eyebrow}
          </span>
          <span
            style={{
              fontSize: "2.25rem",
              fontWeight: "700",
              marginTop: "0.5rem",
            }}
          >
            {content.title}
          </span>
          <span
            style={{
              fontSize: "1.125rem",
              color: styles.mutedForegroundColor,
              marginTop: "1rem",
            }}
          >
            {content.subtitle}
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            width: "50%",
          }}
        >
          {content.benefits.map((benefit) => (
            <div
              key={benefit.title}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "1rem",
                backgroundColor: styles.mutedBackgroundColor,
                borderRadius: "0.375rem",
                border: `1px solid ${styles.borderColor}`,
              }}
            >
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "9999px",
                  backgroundColor: styles.primaryColor,
                  marginBottom: "0.75rem",
                }}
              />
              <span style={{ fontWeight: "600", fontSize: "0.875rem" }}>
                {benefit.title}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: styles.mutedForegroundColor,
                  marginTop: "0.25rem",
                }}
              >
                {benefit.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    width: 1200,
    height: 675,
  };
};
// shared/lib/dev/preview-renderers/BenefitsSection.preview.tsx
