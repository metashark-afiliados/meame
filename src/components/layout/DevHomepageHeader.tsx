// components/layout/DevHomepageHeader.tsx
/**
 * @file DevHomepageHeader.tsx
 * @description Header de desarrollo para la página de inicio.
 *              v8.0.0 (Holistic Refactor): Sincronizado con el contrato de `getDictionary`.
 *              Ahora desestructura la respuesta, es resiliente a contenido faltante y
 *              utiliza tokens de theming semánticos.
 * @version 8.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { usePathname } from "next/navigation";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";
import { routes } from "@/shared/lib/navigation";
import DevToolsDropdown from "../dev/DevToolsDropdown";

interface DevHomepageHeaderProps {
  dictionary: Dictionary["devHomepageHeader"];
  devRouteMenuDictionary: Dictionary["devRouteMenu"];
}

export function DevHomepageHeader({
  dictionary,
  devRouteMenuDictionary,
}: DevHomepageHeaderProps): React.ReactElement | null {
  logger.info(
    "[Observabilidad][DevHomepageHeader] Renderizando DevHomepageHeader (DEV-ONLY)"
  );
  const pathname = usePathname();
  const currentLocale = getCurrentLocaleFromPathname(pathname);

  // --- [INICIO] REFACTORIZACIÓN HOLÍSTICA ---
  // 1. Manejo de contenido potencialmente nulo.
  if (!dictionary || !devRouteMenuDictionary) {
    logger.warn(
      "[DevHomepageHeader] No se proporcionó contenido completo. El header no se renderizará para evitar errores."
    );
    return null; // Renderizado resiliente
  }
  // --- [FIN] REFACTORIZACIÓN HOLÍSTICA ---

  return (
    <header className="py-3 sticky top-0 z-50 bg-destructive/90 backdrop-blur-lg border-b border-destructive/50">
      <Container>
        <div className="flex h-16 items-center justify-between gap-8">
          <nav className="flex items-center gap-4">
            <Link
              href={routes.home.path({ locale: currentLocale })}
              className="text-destructive-foreground hover:text-destructive-foreground/80 transition-colors px-3 py-2 rounded-md bg-destructive/50"
            >
              {dictionary.homeLink}
            </Link>
            <Link
              href={routes.about.path({ locale: currentLocale })}
              className="text-destructive-foreground hover:text-destructive-foreground/80 transition-colors px-3 py-2 rounded-md bg-destructive/50"
            >
              {dictionary.aboutLink}
            </Link>
            <Link
              href={routes.store.path({ locale: currentLocale })}
              className="text-destructive-foreground hover:text-destructive-foreground/80 transition-colors px-3 py-2 rounded-md bg-destructive/50"
            >
              {dictionary.storeLink}
            </Link>
            <Link
              href={routes.news.path({ locale: currentLocale })}
              className="text-destructive-foreground hover:text-destructive-foreground/80 transition-colors px-3 py-2 rounded-md bg-destructive/50"
            >
              {dictionary.blogLink}
            </Link>
          </nav>

          <div className="ml-auto">
            <DevToolsDropdown dictionary={devRouteMenuDictionary} />
          </div>
        </div>
      </Container>
    </header>
  );
}
// components/layout/DevHomepageHeader.tsx
