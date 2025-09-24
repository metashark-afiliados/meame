// Ruta correcta: src/components/dev/DevToolsDropdown.tsx
/**
 * @file DevToolsDropdown.tsx
 * @description Orquestador de datos para el DevRouteMenu.
 *              v5.0.0 (Sovereign Path Fix): Se corrige la ruta de importación del
 *              generador de menú para que apunte a su SSoT canónica, resolviendo
 *              un error crítico de build.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { usePathname } from "next/navigation";
import { logger } from "@/shared/lib/logging";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";
import { type Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { generateDevRoutes } from "@/components/features/dev-tools/utils/route-menu.generator";
import { DevRouteMenu } from "./DevRouteMenu";

interface DevToolsDropdownProps {
  dictionary: NonNullable<Dictionary["devRouteMenu"]>;
}

export default function DevToolsDropdown({
  dictionary,
}: DevToolsDropdownProps): React.ReactElement | null {
  logger.info(
    "[Observabilidad][DevToolsDropdown] Renderizando orquestador smart (v5.0)."
  );
  const pathname = usePathname();
  const currentLocale = getCurrentLocaleFromPathname(pathname);

  if (!dictionary) {
    logger.warn(
      "[DevToolsDropdown] Diccionario no proporcionado. No se renderizará el menú."
    );
    return null;
  }

  logger.trace(
    `[DevToolsDropdown] Orquestando menú para locale: ${currentLocale}`
  );

  const routeGroups = generateDevRoutes(dictionary, currentLocale);
  const buttonLabel = dictionary.devMenuLabel;

  return <DevRouteMenu routeGroups={routeGroups} buttonLabel={buttonLabel} />;
}
