// RUTA: src/components/sections/Hero.tsx
/**
 * @file Hero.tsx
 * @description Server Component "Shell" para la sección Hero. Su única
 *              responsabilidad es obtener los datos y delegar el renderizado
 *              al componente de cliente.
 * @version 11.0.0 (Elite Shell Pattern & MEA Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { getBaviManifest } from "@/shared/lib/bavi"; // <-- Importación corregida
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
  logger.info("[Hero Shell] Renderizando v11.0 (Server).");

  if (!content) {
    logger.warn("[Hero Shell] No se proporcionó contenido.");
    return null;
  }

  let backgroundImageUrl = "";

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
      } else {
        logger.warn(
          `[Hero Shell] Asset ID '${content.backgroundImageAssetId}' no encontrado en la BAVI.`
        );
      }
    } catch (error) {
      logger.error("[Hero Shell] Fallo al cargar datos de BAVI.", { error });
      if (process.env.NODE_ENV === "development") {
        return (
          <DeveloperErrorDisplay
            context="Hero"
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
