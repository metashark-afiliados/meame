// RUTA: components/layout/LanguageSwitcher.tsx
/**
 * @file LanguageSwitcher.tsx
 * @description Componente de UI de élite para cambiar el idioma del portal.
 *              v5.2.0 (Code Hygiene & Props Sovereignty): Resuelve el error de
 *              variable no utilizada al consumir la prop `supportedLocales` en
 *              lugar de la constante importada, haciendo el componente más puro
 *              y desacoplado.
 * @version 5.2.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { cn } from "@/shared/lib/utils/cn";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  supportedLocales: readonly string[]; // Esta prop ahora será la SSoT para este componente
  content: NonNullable<Dictionary["languageSwitcher"]>;
}

export function LanguageSwitcher({
  currentLocale,
  supportedLocales, // Se consumirá esta prop
  content,
}: LanguageSwitcherProps): React.ReactElement {
  logger.info("[LanguageSwitcher] Renderizando v5.2 (Props Sovereignty).");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLanguageChange = useCallback(
    (newLocale: string) => {
      const segments = pathname.split("/");
      // La lógica ahora utiliza la prop `supportedLocales`
      const localeIndex = segments.findIndex((segment) =>
        supportedLocales.includes(segment as Locale)
      );

      if (localeIndex !== -1) {
        segments[localeIndex] = newLocale;
      } else {
        segments.splice(1, 0, newLocale);
      }

      const newPathname = segments.join("/");
      const currentSearchParams = new URLSearchParams(
        Array.from(searchParams.entries())
      );
      const newUrl = `${newPathname}?${currentSearchParams.toString()}`;

      router.push(newUrl);
    },
    [pathname, searchParams, router, supportedLocales]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={content.ariaLabel}
          className="relative"
        >
          <FlagIcon
            locale={currentLocale}
            className="w-5 h-5 rounded-sm transition-transform duration-300 group-hover:scale-110"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* El mapeo ahora utiliza la prop `supportedLocales` */}
        {supportedLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              currentLocale === locale && "bg-muted font-semibold"
            )}
          >
            <FlagIcon
              locale={locale as Locale}
              className="w-5 h-5 rounded-sm"
            />
            <span>
              {content.languages[locale as keyof typeof content.languages]}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
