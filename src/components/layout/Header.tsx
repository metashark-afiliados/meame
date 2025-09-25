// RUTA: src/components/layout/Header.tsx
/**
 * @file Header.tsx
 * @description Componente de cabecera principal, ahora con contratos de contenido atómicos.
 * @version 31.0.0 (Atomic Content Contracts)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Separator } from "@/components/ui/Separator";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { NavLink } from "@/shared/lib/schemas/components/header.schema";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { ToggleTheme } from "@/components/ui/ToggleTheme";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartTrigger } from "./CartTrigger";
import { CartSheet } from "./CartSheet";
import { UserNav } from "@/components/features/auth/UserNav";
import { NotificationBell } from "@/components/features/notifications/NotificationBell";
import { routes } from "@/shared/lib/navigation";

// --- SSoT de Contratos de Datos ---
type HeaderContent = NonNullable<Dictionary["header"]>;
type ToggleThemeContent = NonNullable<Dictionary["toggleTheme"]>;
type LanguageSwitcherContent = NonNullable<Dictionary["languageSwitcher"]>;
type CartContent = NonNullable<Dictionary["cart"]>;
type UserNavContent = NonNullable<Dictionary["userNav"]>;
type NotificationBellContent = NonNullable<Dictionary["notificationBell"]>;

interface HeaderProps {
  content?: HeaderContent;
  toggleThemeContent?: ToggleThemeContent;
  languageSwitcherContent?: LanguageSwitcherContent;
  cartContent?: CartContent;
  userNavContent?: UserNavContent;
  notificationBellContent?: NotificationBellContent;
  currentLocale: Locale;
  supportedLocales: readonly string[];
}

// --- SSoT de Animaciones (MEA/UX) ---
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

export default function Header({
  content,
  toggleThemeContent,
  languageSwitcherContent,
  cartContent,
  userNavContent,
  notificationBellContent,
  currentLocale,
  supportedLocales,
}: HeaderProps): React.ReactElement {
  logger.info("[Header] Renderizando v31.0 (Atomic Content Contracts).");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- Guardia de Resiliencia ---
  if (!content) {
    logger.error(
      "[Header] Contenido principal no proporcionado. Renderizando un estado de error seguro."
    );
    return (
      <header className="h-16 border-b border-destructive bg-destructive/10" />
    );
  }

  const { logoUrl, logoAlt, navLinks } = content;

  return (
    <>
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between bg-background/80 px-4 backdrop-blur-sm md:px-6 border-b border-border"
      >
        <Link
          href={routes.home.path({ locale: currentLocale })}
          className="mr-6 flex items-center"
          aria-label={logoAlt}
        >
          <Image
            src={logoUrl}
            alt={logoAlt}
            width={150}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>
        <nav
          className="hidden md:flex md:items-center md:gap-6 text-sm font-medium"
          aria-label="Navegación Principal"
        >
          {navLinks.map((route: NavLink) => (
            <Link
              key={route.href}
              href={`/${currentLocale}${route.href}`.replace("//", "/")}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {toggleThemeContent && <ToggleTheme content={toggleThemeContent} />}
          {languageSwitcherContent && (
            <LanguageSwitcher
              currentLocale={currentLocale}
              supportedLocales={supportedLocales}
              content={languageSwitcherContent}
            />
          )}
          <Separator orientation="vertical" className="h-6 mx-2" />
          {cartContent && (
            <CartTrigger
              onClick={() => setIsCartOpen(true)}
              content={cartContent}
            />
          )}

          {notificationBellContent && (
            <NotificationBell content={notificationBellContent} />
          )}
          {userNavContent && <UserNav content={userNavContent} />}
        </div>
      </motion.header>

      {cartContent && (
        <CartSheet
          isOpen={isCartOpen}
          onOpenChange={setIsCartOpen}
          content={cartContent}
          locale={currentLocale}
        />
      )}
    </>
  );
}
// RUTA: src/components/layout/Header.tsx
