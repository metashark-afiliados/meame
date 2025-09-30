// RUTA: src/components/features/dev-tools/DevHeaderClient.tsx
/**
 * @file DevHeaderClient.tsx
 * @description Header de élite para el DCC (Client Core).
 * @version 15.0.0 (UI & UX Refinement)
 * @author L.I.A. Legacy
 */
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { type User } from "@supabase/supabase-js";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import { type Locale, supportedLocales } from "@/shared/lib/i18n/i18n.config";
import type { UserProfileData } from "@/shared/lib/actions/account/get-current-user-profile.action";
import { Container } from "@/components/ui/Container";
import { ToggleTheme } from "@/components/ui/ToggleTheme";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { UserNavClient } from "@/components/features/auth/_components/UserNavClient";
import { NotificationBell } from "@/components/features/notifications/NotificationBell/NotificationBell";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

export interface DevHeaderClientProps {
  user: User | null;
  profile: UserProfileData | null;
  locale: Locale;
  centerComponent?: React.ReactNode;
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
  /* ... sin cambios ... */
};

export default function DevHeaderClient({
  user,
  profile,
  locale,
  centerComponent,
  devThemeSwitcher,
  content,
}: DevHeaderClientProps): React.ReactElement {
  logger.info("[DevHeaderClient] Renderizando v15.0.");

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
            {centerComponent}
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
