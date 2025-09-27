// RUTA: src/components/sections/SocialProofLogos.tsx
/**
 * @file SocialProofLogos.tsx
 * @description Aparato "Server Shell" para la sección de prueba social. Su única
 *              responsabilidad es obtener los datos y delegar el renderizado
 *              al componente de cliente. Cumple con los 7 Pilares de Calidad.
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
  logger.info("[SocialProofLogos Shell] Renderizando v8.0 (Server Shell).");

  if (!content || !content.logos || content.logos.length === 0) {
    return null;
  }

  try {
    const baviManifest = await getBaviManifest();

    const resolvedLogos: ResolvedLogo[] = content.logos
      .map((logo) => {
        const baviAsset = baviManifest.assets.find(
          (asset: BaviAsset) => asset.assetId === logo.assetId
        );
        if (!baviAsset) {
          logger.warn(
            `[BAVI] Activo no encontrado en manifiesto: ${logo.assetId}`
          );
          return null;
        }
        const variant = baviAsset.variants.find(
          (v: BaviVariant) => v.state === "orig"
        );
        if (!variant) return null;

        return {
          alt: logo.alt,
          publicId: variant.publicId,
          width: variant.dimensions.width,
          height: variant.dimensions.height,
        };
      })
      .filter((logo): logo is ResolvedLogo => logo !== null);

    // Delega el renderizado al componente de cliente, pasando los datos como props.
    return (
      <SocialProofLogosClient title={content.title} logos={resolvedLogos} />
    );
  } catch (error) {
    logger.error("[SocialProofLogos Shell] Fallo al renderizar.", { error });
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="SocialProofLogos"
          errorMessage="No se pudo cargar el manifiesto de la BAVI."
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }
    return null;
  }
}
