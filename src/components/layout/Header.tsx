// RUTA: src/components/layout/Header.tsx
/**
 * @file Header.tsx
 * @description Componente de cabecera principal, ahora con un contrato de
 *              contenido atómico y soberano.
 * @version 32.0.0 (Atomic Content Contract & MEA/UX)
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
import { NotificationBell } from "@/components/features/notifications/NotificationBell/NotificationBell";
import { routes } from "@/shared/lib/navigation";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";

// --- SSoT del Nuevo Contrato de Contenido Unificado ---
interface HeaderContentBundle {
  header: NonNullable<Dictionary["header"]>;
  toggleTheme: NonNullable<Dictionary["toggleTheme"]>;
  languageSwitcher: NonNullable<Dictionary["languageSwitcher"]>;
  cart: NonNullable<Dictionary["cart"]>;
  userNav: NonNullable<Dictionary["userNav"]>;
  notificationBell: NonNullable<Dictionary["notificationBell"]>;
}
interface HeaderProps {
  content: HeaderContentBundle;
  currentLocale: Locale;
  supportedLocales: readonly string[];
}

const headerVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Header({
  content,
  currentLocale,
  supportedLocales,
}: HeaderProps): React.ReactElement {
  logger.info("[Header] Renderizando v32.0 (Atomic Contract).");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- Guardia de Resiliencia Robusta ---
  const {
    header,
    toggleTheme,
    languageSwitcher,
    cart,
    userNav,
    notificationBell,
  } = content;

  if (
    !header ||
    !toggleTheme ||
    !languageSwitcher ||
    !cart ||
    !userNav ||
    !notificationBell
  ) {
    const errorMsg = "El paquete de contenido para el Header está incompleto.";
    logger.error(`[Header] ${errorMsg}`, { receivedContent: content });
    return (
      <DeveloperErrorDisplay
        context="Header"
        errorMessage={errorMsg}
        errorDetails="Una o más claves raíz (header, toggleTheme, etc.) faltan en la prop 'content'."
      />
    );
  }

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
          aria-label={header.logoAlt}
        >
          <Image
            src={header.logoUrl}
            alt={header.logoAlt}
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
          {header.navLinks.map((route: NavLink) => (
            <motion.div key={route.href} whileHover={{ y: -2 }}>
              <Link
                href={`/${currentLocale}${route.href}`.replace("//", "/")}
                className="transition-colors hover:text-primary text-foreground/60"
              >
                {route.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ToggleTheme content={toggleTheme} />
          <LanguageSwitcher
            currentLocale={currentLocale}
            supportedLocales={supportedLocales}
            content={languageSwitcher}
          />
          <Separator orientation="vertical" className="h-6 mx-2" />
          <CartTrigger onClick={() => setIsCartOpen(true)} content={cart} />
          <NotificationBell content={notificationBell} />
          <UserNav content={userNav} />
        </div>
      </motion.header>

      <CartSheet
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        content={cart}
        locale={currentLocale}
      />
    </>
  );
}
