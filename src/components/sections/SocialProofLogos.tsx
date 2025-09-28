// RUTA: src/components/sections/SocialProofLogos.tsx
/**
 * @file SocialProofLogos.tsx
 * @description Aparato "Server Shell" para la sección de prueba social.
 * @version 8.0.0 (Server Shell Pattern)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { getBaviManifest } from "@/shared/lib/bavi/manifest.queries";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { SocialProofLogosClient } from "./SocialProofLogosClient";
import type {
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

interface SocialProofLogosProps {
  content?: Dictionary["socialProofLogos"];
}

type ResolvedLogo = {
  alt: string;
  publicId: string;
  width: number;
  height: number;
};

export async function SocialProofLogos({
  content,
}: SocialProofLogosProps): Promise<React.ReactElement | null> {
  // --- [INYECCIÓN DE LOGGING] ---
  logger.info(
    `[SocialProofLogos Shell v8.0] Iniciando obtención de datos para logos.`
  );

  if (!content || !content.logos || content.logos.length === 0) {
    logger.warn(
      "[SocialProofLogos Shell] No se proporcionó contenido o logos. No se renderizará."
    );
    return null;
  }

  // --- [INYECCIÓN DE RESILIENCIA] ---
  try {
    const baviManifest = await getBaviManifest();
    const resolvedLogos: ResolvedLogo[] = content.logos
      .map((logo) => {
        const baviAsset = baviManifest.assets.find(
          (asset: BaviAsset) => asset.assetId === logo.assetId
        );
        if (!baviAsset) {
          logger.warn(
            `[SocialProofLogos Shell] Logo assetId '${logo.assetId}' no encontrado en BAVI.`
          );
          return null;
        }
        const variant = baviAsset.variants.find(
          (v: BaviVariant) => v.state === "orig"
        );
        if (!variant) {
          logger.warn(
            `[SocialProofLogos Shell] Variante 'orig' no encontrada para assetId '${logo.assetId}'.`
          );
          return null;
        }
        return {
          alt: logo.alt,
          publicId: variant.publicId,
          width: variant.dimensions.width,
          height: variant.dimensions.height,
        };
      })
      .filter((logo): logo is ResolvedLogo => logo !== null);

    logger.trace(
      `[SocialProofLogos Shell] Se resolvieron ${resolvedLogos.length} logos desde la BAVI.`
    );

    return (
      <SocialProofLogosClient title={content.title} logos={resolvedLogos} />
    );
  } catch (error) {
    logger.error("[SocialProofLogos Shell] Fallo crítico al renderizar.", {
      error,
    });
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="SocialProofLogos Server Shell"
          errorMessage="No se pudo cargar o procesar el manifiesto de la BAVI."
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }
    return null; // Falla silenciosamente en producción
  }
}
