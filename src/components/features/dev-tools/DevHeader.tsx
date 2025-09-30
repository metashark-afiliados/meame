// RUTA: src/components/features/dev-tools/DevHeader.tsx
/**
 * @file DevHeader.tsx
 * @description Header de élite para el DCC, ahora con cumplimiento estricto de las
 *              Reglas de Hooks de React y observabilidad completa.
 * @version 19.1.0 (React Hooks Compliance)
 * @author L.I.A. Legacy
 */
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import { type Locale, supportedLocales } from "@/shared/lib/i18n/i18n.config";
import { useAuth } from "@/shared/hooks/use-auth";
import { Container } from "@/components/ui/Container";
import { ToggleTheme } from "@/components/ui/ToggleTheme";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { UserNavClient } from "@/components/features/auth/_components/UserNavClient";
import { NotificationBell } from "@/components/features/notifications/NotificationBell/NotificationBell";
import { WizardHeader } from "@/components/features/campaign-suite/_components/WizardHeader";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { DeveloperErrorDisplay } from "./DeveloperErrorDisplay";

interface DevHeaderProps {
  locale: Locale;
  devThemeSwitcher?: React.ReactNode;
  content: {
    devHeader: NonNullable<Dictionary["devHeader"]>;
    toggleTheme: NonNullable<Dictionary["toggleTheme"]>;
    languageSwitcher: NonNullable<Dictionary["languageSwitcher"]>;
    userNav: NonNullable<Dictionary["userNav"]>;
    notificationBell: NonNullable<Dictionary["notificationBell"]>;
    devLoginPage: NonNullable<Dictionary["devLoginPage"]>;
  };
}

const headerVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function DevHeader({
  locale,
  devThemeSwitcher,
  content,
}: DevHeaderProps): React.ReactElement {
  logger.info("[Observabilidad][CLIENTE] Renderizando DevHeader v19.1.");

  // --- INICIO: REFACTORIZACIÓN DE REGLAS DE HOOKS ---
  // Los hooks se mueven al nivel superior, ANTES de cualquier retorno condicional.
  const { user, profile } = useAuth();
  const pathname = usePathname();
  // --- FIN: REFACTORIZACIÓN DE REGLAS DE HOOKS ---

  // --- INICIO: GUARDIÁN DE RESILIENCIA ---
  const {
    devHeader,
    toggleTheme,
    languageSwitcher,
    userNav,
    notificationBell,
    devLoginPage,
  } = content;
  if (
    !devHeader ||
    !toggleTheme ||
    !languageSwitcher ||
    !userNav ||
    !notificationBell ||
    !devLoginPage
  ) {
    const errorMessage =
      "La prop 'content' para DevHeader es incompleta o inválida.";
    logger.error(`[Guardián de Resiliencia] ${errorMessage}`, {
      receivedContent: content,
    });
    return (
      <DeveloperErrorDisplay context="DevHeader" errorMessage={errorMessage} />
    );
  }
  // --- FIN: GUARDIÁN DE RESILIENCIA ---

  const isCampaignSuite = pathname.includes("/creator/campaign-suite");

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="py-3 sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-primary/20 shadow-lg"
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 w-1/3">
            <Link
              href={routes.devDashboard.path({ locale })}
              className="flex items-center gap-3 group"
            >
              <Image
                src="/img/layout/header/globalfitwell-logo-v2.svg"
                alt={content.devHeader.logoAlt}
                width={150}
                height={28}
                priority
              />
              <span className="font-semibold text-sm text-foreground/80 group-hover:text-primary transition-colors hidden lg:inline">
                {content.devHeader.title}
              </span>
            </Link>
          </div>
          <div className="flex-grow w-1/3 flex items-center justify-center">
            {isCampaignSuite && <WizardHeader />}
          </div>
          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0 w-1/3">
            {devThemeSwitcher}
            <ToggleTheme content={content.toggleTheme} />
            <LanguageSwitcher
              currentLocale={locale}
              supportedLocales={supportedLocales}
              content={content.languageSwitcher}
            />
            <NotificationBell content={content.notificationBell} />
            <UserNavClient
              user={user}
              profile={profile}
              userNavContent={content.userNav}
              loginContent={content.devLoginPage}
              locale={locale}
            />
          </div>
        </div>
      </Container>
    </motion.header>
  );
}
