// Ruta correcta: src/components/features/dev-tools/utils/component-props.ts
/**
 * @file component-props.ts
 * @description Utilidad para generar props de fallback robustas y estructuradas para
 *              componentes de desarrollo dentro del Developer Command Center (DCC).
 * @version 2.0.0 (Holistic Elite Leveling)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { DynamicIcon } from "@/components/ui";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

/**
 * @function getFallbackProps
 * @description Genera props de fallback completas y tipadas para componentes específicos
 *              del Dev Canvas, asegurando que la estructura esperada por el componente
 *              esté presente para evitar TypeError durante el desarrollo.
 * @param {string} name - Nombre del componente para el cual generar las props de fallback.
 * @returns {Record<string, unknown>} Objeto de props de fallback estructuradas.
 */
export function getFallbackProps(name: string): Record<string, unknown> {
  logger.trace(`[getFallbackProps] Generando props de fallback para: ${name}`);

  // Contratos de datos de fallback para una máxima seguridad de tipos interna
  const fallbackHeaderContent: NonNullable<Dictionary["header"]> = {
    logoUrl: "/img/layout/header/globalfitwell-logo-v2.svg",
    logoAlt: "Logo Global Fitwell Mock",
    navLinks: [{ label: "Mock Link", href: "/dev" }],
    ctaButton: { label: "CTA Mock", href: "/dev" },
  };

  const fallbackDevMenuContent: NonNullable<Dictionary["devRouteMenu"]> = {
    devMenuLabel: "Dev Tools",
    devToolsGroup: "DEV TOOLS",
    campaignPagesGroup: "CAMPAIGN PAGES",
    portalPagesGroup: "PORTAL PAGES",
    legalPagesGroup: "LEGAL PAGES",
  };

  const fallbackDockItems = [
    {
      icon: React.createElement(DynamicIcon, { name: "Gauge", size: 18 }),
      label: "Default Mock Item C",
      onClick: () => logger.info("Default Mock Item C clicked!"),
    },
    {
      icon: React.createElement(DynamicIcon, { name: "Gauge", size: 18 }),
      label: "Default Mock Item D",
      onClick: () => logger.info("Default Mock Item D clicked!"),
    },
  ];

  switch (name) {
    case "Header":
      return {
        content: fallbackHeaderContent,
        devDictionary: fallbackDevMenuContent,
      };

    case "Footer":
      // El contenido del footer es complejo, se puede añadir un mock completo si es necesario.
      return {
        content: {
          newsletter: {
            title: "Newsletter Fallback",
            description: "Suscríbete para recibir noticias.",
            placeholder: "tu@email.com",
            buttonText: "Suscribir",
            buttonAriaLabel: "Suscribir a la newsletter",
          },
          linkColumns: [],
          socialLinks: [],
          copyright: "© 2025 Fallback Copyright",
          disclaimer: "Este es un disclaimer de fallback.",
        },
      };

    case "ScrollingBanner":
      return {
        content: {
          message:
            "Mensaje de banner de fallback: ¡Descuento especial por tiempo limitado!",
        },
      };

    case "Hero":
      return {
        content: {
          title: "Título de fallback para Hero",
          subtitle:
            "Subtítulo de fallback. El contenido real no fue cargado correctamente.",
        },
      };

    case "BenefitsSection":
      return {
        content: {
          eyebrow: "Fallback",
          title: "Beneficios de Fallback",
          subtitle: "Subtítulo de beneficios de fallback.",
          benefits: [],
        },
      };

    case "Dock":
      return {
        items: fallbackDockItems,
        config: {},
      };

    case "LightRays":
      return {
        config: { raysColor: "primary", raysOrigin: "top-center" },
      };

    default:
      logger.warn(
        `[getFallbackProps] No hay props de fallback definidas para: ${name}. Se devuelve un objeto vacío.`
      );
      return {};
  }
}
// Ruta correcta: src/components/features/dev-tools/utils/component-props.ts
