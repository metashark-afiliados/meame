// RUTA: src/app/select-language/_components/LanguageSelectorClient.tsx
/**
 * @file LanguageSelectorClient.tsx
 * @description Componente de cliente para la selección de idioma, ahora con
 *              navegación consciente del contexto para una UX sin fisuras.
 * @version 2.0.0 (Context-Aware Navigation & MEA/UX)
 * @author L.I.A. Legacy
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { defaultLocale, type Locale } from "@/shared/lib/i18n/i18n.config";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { logger } from "@/shared/lib/logging";
import type { SelectLanguagePageContent } from "@/shared/lib/schemas/pages/select-language.schema";

interface LanguageSelectorClientProps {
  content: SelectLanguagePageContent;
}

export function LanguageSelectorClient({
  content,
}: LanguageSelectorClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown <= 0) {
      clearInterval(timer);
      logger.warn(
        "[LanguageSelector] Tiempo agotado. Redirigiendo al locale por defecto."
      );
      const returnUrl = searchParams.get("returnUrl") || "/";
      router.replace(`/${defaultLocale}${returnUrl}`);
    }

    return () => clearInterval(timer);
  }, [countdown, router, searchParams]);

  const handleLanguageSelect = (locale: Locale) => {
    const returnUrl = searchParams.get("returnUrl") || "/";
    router.replace(`/${locale}${returnUrl}`);
  };

  const progress = (countdown / 5) * 100;

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {Object.entries(content.languages).map(([code, name]) => (
            <Button
              key={code}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleLanguageSelect(code as Locale)}
            >
              {name}
            </Button>
          ))}
        </div>
        <div className="pt-4 text-center text-sm text-muted-foreground">
          <p>Redirigiendo en {countdown} segundos...</p>
          <div className="w-full bg-muted rounded-full h-2.5 mt-2">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-1000 linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
