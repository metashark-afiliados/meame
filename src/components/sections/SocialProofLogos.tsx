// RUTA: src/components/sections/SocialProofLogos.tsx
/**
 * @file SocialProofLogos.tsx
 * @description Aparato "Server Shell" para la sección de prueba social.
 * @version 8.1.0 (Elite Error Handling & Type Safety)
 *@author RaZ Podestá - MetaShark Tech - Asistente de Refactorización
 */
import React from "react";
import { getBaviManifest } from "@/shared/lib/bavi";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { SocialProofLogosClient } from "./SocialProofLogosClient";
import type {
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

type SocialProofContent = NonNullable<Dictionary["socialProofLogos"]>;
interface SocialProofLogosProps {
  content?: SocialProofContent;
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
  if (!content || !content.logos || content.logos.length === 0) return null;

  try {
    const baviManifest = await getBaviManifest();
    const resolvedLogos: ResolvedLogo[] = content.logos
      .map((logo) => {
        const baviAsset = baviManifest.assets.find(
          (asset: BaviAsset) => asset.assetId === logo.assetId
        );
        const variant = baviAsset?.variants.find(
          (v: BaviVariant) => v.state === "orig"
        );
        if (!baviAsset || !variant) {
          logger.warn(
            `[SocialProofLogos Shell] Logo assetId '${logo.assetId}' no encontrado en BAVI.`
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

    return (
      <SocialProofLogosClient title={content.title} logos={resolvedLogos} />
    );
  } catch (error) {
    const errorMessage =
      "No se pudo cargar o procesar el manifiesto de la BAVI.";
    logger.error("[SocialProofLogos Shell] Fallo crítico al renderizar.", {
      error,
    });

    if (process.env.NODE_ENV === "development") {
      const errorDetails = error instanceof Error ? error : String(error);
      return (
        <DeveloperErrorDisplay
          context="SocialProofLogos Server Shell"
          errorMessage={errorMessage}
          errorDetails={errorDetails}
        />
      );
    }
    return null;
  }
}
