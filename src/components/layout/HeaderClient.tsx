// RUTA: src/components/layout/HeaderClient.tsx
/**
 * @file HeaderClient.tsx
 * @description Componente de Cliente para la cabecera principal, ahora cumpliendo
 *              estrictamente con las Reglas de Hooks de React.
 * @version 39.1.0 (React Hooks Compliance)
 * @author L.I.A. Legacy
 */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { logger } from "@/shared/lib/logging";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { type Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { type UserProfileData } from "@/shared/lib/actions/account/get-current-user-profile.action";
import { Container, Button } from "@/components/ui";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/NavigationMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartTrigger } from "./CartTrigger";
import { CartSheet } from "./CartSheet";
import { UserNavClient } from "@/components/features/auth/_components/UserNavClient";
import { NotificationBell } from "@/components/features/notifications/NotificationBell/NotificationBell";
import { DeveloperErrorDisplay } from "../features/dev-tools";

export interface HeaderClientProps {
  user: User | null;
  profile: UserProfileData | null;
  logoUrl: string;
  content: {
    header: NonNullable<Dictionary["header"]>;
    languageSwitcher: NonNullable<Dictionary["languageSwitcher"]>;
    cart: NonNullable<Dictionary["cart"]>;
    userNav: NonNullable<Dictionary["userNav"]>;
    notificationBell: NonNullable<Dictionary["notificationBell"]>;
    devLoginPage: NonNullable<Dictionary["devLoginPage"]>;
  };
  currentLocale: Locale;
  supportedLocales: readonly string[];
}

export default function HeaderClient({
  user,
  profile,
  logoUrl,
  content,
  currentLocale,
  supportedLocales,
}: HeaderClientProps): React.ReactElement {
  logger.info(
    "[Observabilidad][CLIENTE] Renderizando HeaderClient (Público) v39.1."
  );

  // --- INICIO: REFACTORIZACIÓN DE REGLAS DE HOOKS ---
  // Los hooks se mueven al nivel superior, antes de cualquier retorno condicional.
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  // --- FIN: REFACTORIZACIÓN DE REGLAS DE HOOKS ---

  // --- INICIO: GUARDIÁN DE RESILIENCIA ---
  const {
    header,
    languageSwitcher,
    cart,
    userNav,
    notificationBell,
    devLoginPage,
  } = content;
  if (
    !header ||
    !languageSwitcher ||
    !cart ||
    !userNav ||
    !notificationBell ||
    !devLoginPage
  ) {
    const errorMessage =
      "La prop 'content' para HeaderClient es incompleta o inválida.";
    logger.error(`[Guardián de Resiliencia] ${errorMessage}`, {
      receivedContent: content,
    });
    return (
      <DeveloperErrorDisplay
        context="HeaderClient"
        errorMessage={errorMessage}
      />
    );
  }
  // --- FIN: GUARDIÁN DE RESILIENCIA ---

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b"
    >
      <Container>
        <div className="flex h-16 items-center">
          <Link
            href={`/${currentLocale}`}
            className="mr-6 flex items-center space-x-2"
          >
            <Image
              src={logoUrl}
              alt={header.logoAlt}
              width={150}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              {header.navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <Link
                    href={`/${currentLocale}${link.href}`}
                    legacyBehavior
                    passHref
                  >
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={pathname === `/${currentLocale}${link.href}`}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher
              currentLocale={currentLocale}
              supportedLocales={supportedLocales}
              content={languageSwitcher}
            />
            <CartTrigger onClick={() => setIsCartOpen(true)} content={cart} />
            <CartSheet
              isOpen={isCartOpen}
              onOpenChange={setIsCartOpen}
              content={cart}
              locale={currentLocale}
            />
            <NotificationBell content={notificationBell} />
            <UserNavClient
              user={user}
              profile={profile}
              userNavContent={userNav}
              loginContent={devLoginPage}
              locale={currentLocale}
            />
            {!user && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${currentLocale}/login?view=signup`}>
                  {header.signUpButton.label}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </motion.header>
  );
}
