// RUTA: src/components/sections/Hero.tsx
/**
 * @file Hero.tsx
 * @description Aparato "Server Shell" para la sección Hero.
 * @version 12.0.0 (Elite & Resilient Shell Pattern)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { getBaviManifest } from "@/shared/lib/bavi";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { HeroClient } from "./HeroClient";
import type {
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

type HeroContent = NonNullable<Dictionary["hero"]>;
interface HeroProps {
  content: HeroContent;
}

export async function Hero({
  content,
}: HeroProps): Promise<React.ReactElement | null> {
  // --- [INYECCIÓN DE LOGGING] ---
  logger.info(`[Hero Shell v12.0] Iniciando obtención de datos para Hero.`);

  if (!content) {
    logger.warn("[Hero Shell] No se proporcionó contenido. No se renderizará.");
    return null;
  }

  let backgroundImageUrl = "";

  // --- [INYECCIÓN DE RESILIENCIA] ---
  if (content.backgroundImageAssetId) {
    try {
      const baviManifest = await getBaviManifest();
      const asset = baviManifest.assets.find(
        (a: BaviAsset) => a.assetId === content.backgroundImageAssetId
      );
      const publicId = asset?.variants.find(
        (v: BaviVariant) => v.state === "orig"
      )?.publicId;
      if (publicId) {
        backgroundImageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1920/${publicId}`;
        logger.trace(
          `[Hero Shell] URL de imagen de fondo resuelta: ${backgroundImageUrl}`
        );
      } else {
        logger.warn(
          `[Hero Shell] Asset ID '${content.backgroundImageAssetId}' no encontrado en BAVI.`
        );
      }
    } catch (error) {
      logger.error("[Hero Shell] Fallo crítico al cargar datos de BAVI.", {
        error,
      });
      if (process.env.NODE_ENV === "development") {
        return (
          <DeveloperErrorDisplay
            context="Hero Server Shell"
            errorMessage="No se pudo cargar la imagen de fondo desde la BAVI."
            errorDetails={error instanceof Error ? error : String(error)}
          />
        );
      }
    }
  }

  return (
    <HeroClient content={content} backgroundImageUrl={backgroundImageUrl} />
  );
}
