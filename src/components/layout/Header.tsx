// RUTA: src/components/layout/Header.tsx
/**
 * @file Header.tsx
 * @description Componente "Server Shell" para la cabecera principal.
 *              v34.0 (Module Contract Hardening): Se corrige la sintaxis de
 *              importación para alinearse con la exportación por defecto de
 *              su componente de cliente, resolviendo un error crítico TS2614.
 * @version 34.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { createServerClient } from "@/shared/lib/supabase/server";
import { getCurrentUserProfile_Action } from "@/shared/lib/actions/account/get-current-user-profile.action";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
// Se utiliza la importación por defecto para el componente y nombrada para el tipo.
import HeaderClient, { type HeaderClientProps } from "./HeaderClient";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---

// Se crea un tipo de props específico para el Server Shell, omitiendo las que se obtienen aquí.
type HeaderShellProps = Omit<HeaderClientProps, "user" | "profile">;

export default async function Header({
  content,
  currentLocale,
  supportedLocales,
}: HeaderShellProps) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileResult = user ? await getCurrentUserProfile_Action() : null;
  const profile =
    profileResult && profileResult.success ? profileResult.data : null;

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
// RUTA: src/components/layout/Header.tsx
