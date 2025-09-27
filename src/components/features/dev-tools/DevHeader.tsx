// RUTA: src/components/features/dev-tools/DevHeader.tsx
/**
 * @file DevHeader.tsx
 * @description Header de élite para el Developer Command Center (DCC).
 *              v14.0 (Sovereign Path Restoration): Se corrige la ruta de
 *              importación de DevToolsDropdown para alinearse con la ACS,
 *              restaurando la integridad del build del DCC.
 * @version 14.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import { type Locale, supportedLocales } from "@/shared/lib/i18n/i18n.config";
import { Container } from "@/components/ui/Container";
// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
import DevToolsDropdown from "@/components/features/dev-tools/DevToolsDropdown";
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
import { ToggleTheme } from "@/components/ui/ToggleTheme";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface DevHeaderProps {
  locale: Locale;
  centerComponent?: React.ReactNode;
  devThemeSwitcher?: React.ReactNode;
  content: NonNullable<Dictionary["devHeader"]>;
  devMenuContent: NonNullable<Dictionary["devRouteMenu"]>;
  toggleThemeContent: NonNullable<Dictionary["toggleTheme"]>;
  languageSwitcherContent: NonNullable<Dictionary["languageSwitcher"]>;
}

const headerVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function DevHeader({
  locale,
  centerComponent,
  devThemeSwitcher,
  content,
  devMenuContent,
  toggleThemeContent,
  languageSwitcherContent,
}: DevHeaderProps): React.ReactElement {
  logger.info("[DevHeader] Renderizando v14.0 (Sovereign Path Restoration).");

  const headerTitle = content.title ?? "Developer Command Center";

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="py-3 sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-primary/20 shadow-lg"
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 w-1/4">
            <Link
              href={routes.devDashboard.path({ locale })}
              className="flex items-center gap-3 group"
              aria-label={content.homeLinkAriaLabel}
            >
              <Image
                src="/img/layout/header/globalfitwell-logo-v2.svg"
                alt={content.logoAlt}
                width={150}
                height={28}
                className="h-7 w-auto"
                priority
              />
              <span className="font-semibold text-sm text-foreground/80 group-hover:text-primary transition-colors hidden lg:inline">
                {headerTitle}
              </span>
            </Link>
          </div>

          <div className="flex-grow w-1/2 flex items-center justify-center">
            {centerComponent}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0 w-1/4">
            {devThemeSwitcher}
            <ToggleTheme content={toggleThemeContent} />
            <LanguageSwitcher
              currentLocale={locale}
              supportedLocales={supportedLocales}
              content={languageSwitcherContent}
            />
            <DevToolsDropdown dictionary={devMenuContent} />
          </div>
        </div>
      </Container>
    </motion.header>
  );
}
// RUTA: src/components/features/dev-tools/DevHeader.tsx
