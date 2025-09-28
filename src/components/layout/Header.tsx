// RUTA: src/components/layout/Header.tsx
/**
 * @file Header.tsx
 * @description Componente "Server Shell" para la cabecera principal, ahora
 *              inyectado con resiliencia y observabilidad de élite.
 * @version 35.0.0 (Elite & Resilient Shell Pattern)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { createServerClient } from "@/shared/lib/supabase/server";
import { getCurrentUserProfile_Action } from "@/shared/lib/actions/account/get-current-user-profile.action";
import { logger } from "@/shared/lib/logging";
import HeaderClient, { type HeaderClientProps } from "./HeaderClient";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

type HeaderShellProps = Omit<HeaderClientProps, "user" | "profile">;

export default async function Header({
  content,
  currentLocale,
  supportedLocales,
}: HeaderShellProps) {
  // --- [INYECCIÓN DE LOGGING] ---
  logger.info(
    "[Header Shell v35.0] Iniciando obtención de datos de sesión y perfil."
  );

  let user = null;
  let profile = null;

  // --- [INYECCIÓN DE RESILIENCIA] ---
  try {
    const supabase = createServerClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    if (sessionUser) {
      user = sessionUser;
      logger.trace(
        `[Header Shell] Usuario autenticado encontrado: ${user.email}`
      );
      const profileResult = await getCurrentUserProfile_Action();
      if (profileResult.success) {
        profile = profileResult.data;
        logger.trace(`[Header Shell] Perfil de usuario cargado exitosamente.`);
      } else {
        // No se lanza error, se registra y se continúa.
        logger.warn(
          "[Header Shell] Sesión de usuario encontrada, pero no se pudo cargar el perfil.",
          { error: profileResult.error }
        );
      }
    } else {
      logger.trace("[Header Shell] No se encontró sesión de usuario activa.");
    }
  } catch (error) {
    logger.error(
      "[Header Shell] Fallo crítico durante la obtención de datos de sesión.",
      { error }
    );
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="Header Server Shell"
          errorMessage="No se pudieron obtener los datos de la sesión del usuario."
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }
  }

  return (
    <HeaderClient
      user={user}
      profile={profile}
      content={content}
      currentLocale={currentLocale}
      supportedLocales={supportedLocales}
    />
  );
}
