// RUTA: src/app/[locale]/login/page.tsx
/**
 * @file page.tsx
 * @description Página de login para el DCC, con flujo de redirección contextual
 *              y código de élite sin variables o importaciones no utilizadas.
 * @version 6.1.0 (Elite Code Hygiene)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
// --- [INICIO DE REFACTORIZACIÓN DE HIGIENE] ---
// Se elimina la importación no utilizada de 'redirect'.
import { notFound } from "next/navigation";
// --- [FIN DE REFACTORIZACIÓN DE HIGIENE] ---
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { AuthForm } from "@/components/features/auth/AuthForm";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import { getBaviManifest } from "@/shared/lib/bavi";
import { routes } from "@/shared/lib/navigation";
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
  logger.info(`[DevLoginPage] Renderizando v6.1 (Elite Code Hygiene)`);

  // --- [INICIO DE REFACTORIZACIÓN DE HIGIENE] ---
  // La lógica para obtener el usuario y redirigir ha sido eliminada de este
  // Server Component, ya que ahora es manejada por el cliente. Las variables
  // 'supabase' y 'user' ya no son necesarias aquí.
  // --- [FIN DE REFACTORIZACIÓN DE HIGIENE] ---

  const [{ dictionary, error }, baviManifest] = await Promise.all([
    getDictionary(locale),
    getBaviManifest().catch((err) => {
      logger.error("[DevLoginPage] No se pudo cargar el manifiesto BAVI.", {
        error: err,
      });
      return null;
    }),
  ]);

  const content = dictionary.devLoginPage;
  const headerContent = dictionary.header;

  if (error || !content || !headerContent) {
    const errorMessage =
      "Fallo al cargar el contenido i18n para la página de Login del DCC.";
    logger.error(`[DevLoginPage] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="DevLoginPage"
        errorMessage={errorMessage}
        errorDetails={
          error ||
          "Las claves 'devLoginPage' o 'header' faltan en el diccionario."
        }
      />
    );
  }

  let backgroundImageUrl = "/img/dev/login/bg-1.png";
  if (baviManifest && content.backgroundImageAssetId) {
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
        `[DevLoginPage] Asset ID '${content.backgroundImageAssetId}' no encontrado en BAVI. Usando fallback.`
      );
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 w-full p-6 z-20">
        <Link href={routes.home.path({ locale })}>
          <Image
            src={headerContent.logoUrl}
            alt={headerContent.logoAlt}
            width={150}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>
      </header>
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
}
