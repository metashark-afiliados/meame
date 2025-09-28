// RUTA: src/components/layout/HeaderClient.tsx
/**
 * @file HeaderClient.tsx
 * @description Componente de Cliente para la cabecera principal.
 * @version 35.0.0 (Module Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
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
import { ToggleTheme } from "../ui/ToggleTheme";
import { CartTrigger } from "./CartTrigger";
import { CartSheet } from "./CartSheet";
import { UserNavClient } from "@/components/features/auth/_components/UserNavClient";
import { NotificationBell } from "@/components/features/notifications/NotificationBell/NotificationBell";

export interface HeaderClientProps {
  user: User | null;
  profile: UserProfileData | null;
  content: {
    header: NonNullable<Dictionary["header"]>;
    toggleTheme: NonNullable<Dictionary["toggleTheme"]>;
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
  content,
  currentLocale,
  supportedLocales,
}: HeaderClientProps): React.ReactElement {
  logger.info("[HeaderClient] Renderizando v35.0 (Module Integrity).");
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);

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
              src={content.header.logoUrl}
              alt={content.header.logoAlt}
              width={150}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {content.header.navLinks.map((link) => (
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
              content={content.languageSwitcher}
            />
            <ToggleTheme content={content.toggleTheme} />
            <CartTrigger
              onClick={() => setIsCartOpen(true)}
              content={content.cart}
            />
            <CartSheet
              isOpen={isCartOpen}
              onOpenChange={setIsCartOpen}
              content={content.cart}
              locale={currentLocale}
            />
            <NotificationBell content={content.notificationBell} />
            <UserNavClient
              user={user}
              profile={profile}
              userNavContent={content.userNav}
              loginContent={content.devLoginPage}
              locale={currentLocale}
            />
            <Button asChild>
              <Link href={`/${currentLocale}${content.header.ctaButton.href}`}>
                {content.header.ctaButton.label}
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </motion.header>
  );
}
