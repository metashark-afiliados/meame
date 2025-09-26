// RUTA: src/app/[locale]/login/page.tsx
/**
 * @file page.tsx
 * @description Página de login para el DCC, optimizada con guardia de
 *              redirección para usuarios autenticados y fondo dinámico desde BAVI.
 * @version 5.0.0 (Authenticated User Redirect Guard & SSoT Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { createServerClient } from "@/shared/lib/supabase/server";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { AuthForm } from "@/components/features/auth/AuthForm";
import { logger } from "@/shared/lib/logging";
import { notFound } from "next/navigation";
import { DeveloperErrorDisplay } from "@/components/dev";
import { getBaviManifest } from "@/shared/lib/bavi";
import { routes } from "@/shared/lib/navigation";

interface DevLoginPageProps {
  params: { locale: Locale };
}

export default async function DevLoginPage({
  params: { locale },
}: DevLoginPageProps) {
  logger.info(`[DevLoginPage] Renderizando v5.0 (Redirect Guard)`);

  // --- [INICIO DE OPTIMIZACIÓN DE ÉLITE: GUARDIA DE REDIRECCIÓN] ---
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    logger.info(
      `Usuario ya autenticado (${user.email}). Redirigiendo al dashboard.`
    );
    return redirect(routes.devDashboard.path({ locale }));
  }
  // --- [FIN DE OPTIMIZACIÓN DE ÉLITE] ---

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

  // --- Lógica de BAVI para Fondo Dinámico ---
  let backgroundImageUrl = "/img/dev/login/bg-1.png"; // Fallback resiliente
  if (baviManifest && content.backgroundImageAssetId) {
    const asset = baviManifest.assets.find(
      (a) => a.assetId === content.backgroundImageAssetId
    );
    const publicId = asset?.variants.find((v) => v.state === "orig")?.publicId;
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
        {/* --- OPTIMIZACIÓN: Uso de SSoT de Rutas --- */}
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
        {/* --- OPTIMIZACIÓN: Uso de Orquestador AuthForm --- */}
        <AuthForm content={content} locale={locale} />
      </main>
    </div>
  );
}
