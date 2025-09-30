// RUTA: src/components/layout/Header.tsx
/**
 * @file Header.tsx
 * @description Componente "Server Shell" para la cabecera, con observabilidad de élite.
 * @version 37.0.0 (Elite Observability Injection)
 * @author L.I.A. Legacy
 */
import React from "react";
import { createServerClient } from "@/shared/lib/supabase/server";
import { getCurrentUserProfile_Action } from "@/shared/lib/actions/account/get-current-user-profile.action";
import { getBaviManifest } from "@/shared/lib/bavi";
import { logger } from "@/shared/lib/logging";
import HeaderClient, { type HeaderClientProps } from "./HeaderClient";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";

type HeaderShellProps = Omit<HeaderClientProps, "user" | "profile" | "logoUrl">;

export default async function Header({
  content,
  currentLocale,
  supportedLocales,
}: HeaderShellProps) {
  logger.info(
    "[Observabilidad][SERVIDOR] Renderizando Header Server Shell v37.0."
  );

  let user = null;
  let profile = null;
  let logoUrl = content.header.logoUrl;

  try {
    const supabase = createServerClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    if (sessionUser) {
      user = sessionUser;
      const profileResult = await getCurrentUserProfile_Action();
      if (profileResult.success) profile = profileResult.data;
    }

    const baviManifest = await getBaviManifest();
    const logoAsset = baviManifest.assets.find(
      (a) => a.assetId === "i-sybl-global-fitwell-logo-01"
    );
    const logoVariant = logoAsset?.variants.find((v) => v.state === "orig");
    if (logoVariant?.publicId) {
      logoUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,h_56/${logoVariant.publicId}`;
    }
  } catch (error) {
    logger.error(
      "[Header Shell] Fallo crítico durante la obtención de datos.",
      { error }
    );
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="Header Server Shell"
          errorMessage="No se pudieron obtener los datos para el Header."
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }
  }

  return (
    <HeaderClient
      user={user}
      profile={profile}
      logoUrl={logoUrl}
      content={content}
      currentLocale={currentLocale}
      supportedLocales={supportedLocales}
    />
  );
}
