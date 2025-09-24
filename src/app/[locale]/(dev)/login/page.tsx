// RUTA: app/[locale]/(dev)/login/page.tsx
/**
 * @file page.tsx
 * @description Página de login para el DCC, ahora integrada con Supabase.
 *              Orquesta la carga de datos i18n y la composición de la UI de élite.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { LoginForm } from "./_components/LoginForm";
import { logger } from "@/shared/lib/logging";
import { notFound } from "next/navigation";
import { DeveloperErrorDisplay } from "@/components/dev";

interface DevLoginPageProps {
  params: { locale: Locale };
}

// SSoT para las imágenes de fondo, ahora en la página que las consume.
const backgroundImages = [
  "/img/dev/login/bg-1.png",
  "/img/dev/login/bg-2.png",
  "/img/dev/login/bg-3.png",
  "/img/dev/login/bg-4.png",
  "/img/dev/login/bg-5.png",
];

export default async function DevLoginPage({
  params: { locale },
}: DevLoginPageProps) {
  logger.info(
    `[DevLoginPage] Renderizando página con autenticación Supabase para locale: ${locale}`
  );

  const { dictionary, error } = await getDictionary(locale);
  const content = dictionary.devLoginPage;
  const headerContent = dictionary.header; // Para el alt text del logo

  if (error || !content || !headerContent) {
    const errorMessage =
      "Fallo al cargar el contenido i18n para la página de Login del DCC.";
    logger.error(`[DevLoginPage] ${errorMessage}`, { error });
    if (process.env.NODE_ENV === "production") {
      return notFound();
    }
    return (
      <DeveloperErrorDisplay
        context="DevLoginPage"
        errorMessage={errorMessage}
        errorDetails={
          error ||
          "Las claves 'devLoginPage' o 'header' faltan en el diccionario."
        }
      />
    );
  }

  const randomBackground =
    backgroundImages[Math.floor(Math.random() * backgroundImages.length)];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 w-full p-6 z-20">
        <Link href={`/${locale}`}>
          <Image
            src={headerContent.logoUrl}
            alt={headerContent.logoAlt}
            width={150}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>
      </header>

      <div className="absolute inset-0 z-0 opacity-20">
        <Image
          src={randomBackground}
          alt="Fondo decorativo de login"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>

      <main className="relative z-10 flex w-full max-w-sm flex-col items-center">
        {/* El LoginForm de cliente ahora recibirá su contenido validado */}
        <LoginForm content={content} locale={locale} />
      </main>
    </div>
  );
}
