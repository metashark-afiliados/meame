// RUTA: src/components/layout/Header.tsx
/**
 * @file Header.tsx
 * @description "Server Shell" soberano para la cabecera, forjado con un Guardián de Resiliencia
 *              holístico y observabilidad de élite para una robustez de nivel de producción.
 * @version 42.0.0 (Elite Observability & Resilience Guardian)
 *@author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import React from "react";
import { createServerClient } from "@/shared/lib/supabase/server";
import { getCurrentUserProfile_Action } from "@/shared/lib/actions/account/get-current-user-profile.action";
import { getBaviManifest } from "@/shared/lib/bavi";
import { getCart } from "@/shared/lib/commerce";
import { reshapeCartForStore } from "@/shared/lib/commerce/shapers";
import { logger } from "@/shared/lib/logging";
import HeaderClient, { type HeaderClientProps } from "./HeaderClient";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import type {
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

type HeaderShellProps = Omit<
  HeaderClientProps,
  "user" | "profile" | "logoUrl" | "initialCart"
>;

export default async function Header({
  content,
  currentLocale,
  supportedLocales,
  centerComponent,
  rightComponent,
}: HeaderShellProps) {
  const traceId = logger.startTrace("Header_Shell_v42.0");
  logger.startGroup(
    `[Header Shell] Orquestando obtención de datos para cabecera...`,
    traceId
  );

  // Define un fallback robusto en caso de que la BAVI falle.
  const defaultLogoUrl = content.header.logoUrl;
  let logoUrl = defaultLogoUrl;

  try {
    logger.traceEvent(
      traceId,
      "Iniciando obtención de datos en paralelo (Supabase Auth, Profile, BAVI, Shopify Cart)..."
    );

    // --- Obtención de Datos Holística ---
    const supabase = createServerClient();
    const [userSession, profileResult, baviManifest, initialApiCart] =
      await Promise.all([
        supabase.auth.getUser(),
        getCurrentUserProfile_Action(),
        getBaviManifest(),
        getCart(),
      ]);

    logger.success("[Header Shell] Todas las fuentes de datos respondieron.", {
      traceId,
    });

    // --- Procesamiento y Transformación de Datos ---
    const user = userSession.data.user;
    const profile = user && profileResult.success ? profileResult.data : null;

    logger.traceEvent(
      traceId,
      "Transformando datos del carrito para el store de cliente..."
    );
    const initialCartForStore = reshapeCartForStore(initialApiCart);
    logger.traceEvent(
      traceId,
      `Transformación completada: ${initialCartForStore.length} items procesados.`
    );

    // --- Resolución de Activos con Fallback (Guardián de Resiliencia a Nivel de Activo) ---
    logger.traceEvent(traceId, "Resolviendo URL del logo desde la BAVI...");
    const logoAsset = baviManifest.assets.find(
      (a: BaviAsset) => a.assetId === "i-sybl-global-fitwell-logo-01"
    );
    const logoVariant = logoAsset?.variants.find(
      (v: BaviVariant) => v.state === "orig"
    );
    if (logoVariant?.publicId) {
      logoUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,h_56/${logoVariant.publicId}`;
      logger.traceEvent(
        traceId,
        "URL del logo resuelta desde la BAVI con éxito."
      );
    } else {
      logger.warn(
        "[Header Shell] Activo del logo no encontrado en la BAVI. Usando URL de fallback estática.",
        { assetId: "i-sybl-global-fitwell-logo-01", traceId }
      );
    }

    logger.success(
      "[Header Shell] Ensamblaje de datos completado. Delegando a HeaderClient...",
      { traceId }
    );
    return (
      <HeaderClient
        user={user}
        profile={profile}
        logoUrl={logoUrl}
        content={content}
        currentLocale={currentLocale}
        supportedLocales={supportedLocales}
        centerComponent={centerComponent}
        rightComponent={rightComponent}
        initialCart={initialCartForStore}
      />
    );
  } catch (error) {
    // --- GUARDIÁN DE RESILIENCIA HOLÍSTICO ---
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido durante la obtención de datos del header.";
    logger.error(
      "[Header Shell] Fallo crítico durante la obtención de datos.",
      { error: errorMessage, traceId }
    );

    // En desarrollo, muestra un error detallado y bloqueante.
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="Header Server Shell"
          errorMessage="No se pudieron obtener los datos necesarios para renderizar la cabecera. Una o más fuentes de datos (Supabase, BAVI, Shopify) fallaron."
          errorDetails={error instanceof Error ? error : errorMessage}
        />
      );
    }

    // En producción, renderiza una versión degradada pero funcional del Header.
    logger.warn(
      "[Header Shell] Renderizando en modo degradado debido a un error de obtención de datos.",
      { traceId }
    );
    return (
      <HeaderClient
        user={null}
        profile={null}
        logoUrl={defaultLogoUrl} // Usa el logo de fallback
        content={content}
        currentLocale={currentLocale}
        supportedLocales={supportedLocales}
        centerComponent={centerComponent}
        rightComponent={rightComponent}
        initialCart={[]} // Pasa un carrito vacío
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
