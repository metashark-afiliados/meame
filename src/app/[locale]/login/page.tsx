// RUTA: src/app/[locale]/login/page.tsx
/**
 * @file page.tsx
 * @description Página de login para el DCC, con resiliencia de datos, logging
 *              verboso y una UX más limpia y enfocada.
 * @version 7.0.0 (Resilient & UX-Aligned)
 * @author L.I.A. Legacy
 */
import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { AuthForm } from "@/components/features/auth/AuthForm";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { getBaviManifest } from "@/shared/lib/bavi";
import type {
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

interface DevLoginPageProps {
  params: { locale: Locale };
}

export default async function DevLoginPage({
  params: { locale },
}: DevLoginPageProps) {
  const traceId = logger.startTrace("DevLoginPage_Render_v7.0");
  logger.startGroup(`[DevLoginPage] Renderizando v7.0 para locale: ${locale}`);

  let backgroundImageUrl = "/img/dev/login/bg-1.png"; // Fallback estático robusto

  try {
    logger.traceEvent(
      traceId,
      "Iniciando obtención de datos en paralelo (i18n y BAVI)..."
    );
    const [{ dictionary, error: dictError }, baviManifest] = await Promise.all([
      getDictionary(locale),
      getBaviManifest(),
    ]);
    logger.traceEvent(traceId, "Obtención de datos completada.");

    const content = dictionary.devLoginPage;
    if (dictError || !content) {
      throw new Error(
        "Fallo al cargar el contenido i18n para la página de Login del DCC."
      );
    }
    logger.traceEvent(traceId, "Contenido i18n validado.");

    if (content.backgroundImageAssetId) {
      logger.traceEvent(
        traceId,
        `Buscando assetId '${content.backgroundImageAssetId}' en BAVI...`
      );
      const asset = baviManifest.assets.find(
        (a: BaviAsset) => a.assetId === content.backgroundImageAssetId
      );
      const publicId = asset?.variants.find(
        (v: BaviVariant) => v.state === "orig"
      )?.publicId;

      if (publicId) {
        backgroundImageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_1920/${publicId}`;
        logger.success(
          `[DevLoginPage] URL de fondo de BAVI resuelta con éxito.`,
          { traceId }
        );
      } else {
        logger.warn(
          `[DevLoginPage] Asset ID '${content.backgroundImageAssetId}' no encontrado en BAVI. Usando fallback estático.`,
          { traceId }
        );
      }
    }

    logger.traceEvent(traceId, "Renderizando UI...");
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src={backgroundImageUrl}
            alt="Fondo decorativo de login"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        </div>
        <main className="relative z-10 flex w-full max-w-sm flex-col items-center">
          <AuthForm content={content} locale={locale} />
        </main>
      </div>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error(
      "[DevLoginPage] Fallo crítico durante el renderizado del Server Shell.",
      { error: errorMessage, traceId }
    );

    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="DevLoginPage Server Shell"
          errorMessage="No se pudo renderizar la página de login."
          errorDetails={error instanceof Error ? error : errorMessage}
        />
      );
    }
    return notFound();
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
