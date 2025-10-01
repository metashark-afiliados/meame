// RUTA: src/components/features/auth/AuthForm.tsx
/**
 * @file AuthForm.tsx
 * @description Orquestador de UI para autenticación, inyectado con MEA/UX de élite,
 *              observabilidad y un guardián de resiliencia de contrato.
 * @version 3.0.0 (Elite Observability & Resilience Guardian)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";
import { LoginForm } from "./components/LoginForm";
import { SignUpForm } from "./components/SignUpForm";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type AuthFormContent = NonNullable<Dictionary["devLoginPage"]>;

interface AuthFormProps {
  content: AuthFormContent;
  locale: Locale;
}

export function AuthForm({ content, locale }: AuthFormProps) {
  logger.info("[AuthForm] Renderizando orquestador v3.0 (Elite).");
  const [view, setView] = useState<"login" | "signup">("login");

  // --- [INICIO] GUARDIÁN DE RESILIENCIA DE CONTRATO ---
  if (!content) {
    const errorMsg =
      "Contrato de UI violado: La prop 'content' para AuthForm es requerida.";
    logger.error(`[Guardián] ${errorMsg}`);
    return (
      <DeveloperErrorDisplay
        context="AuthForm"
        errorMessage={errorMsg}
        errorDetails="El Server Shell que renderiza este componente no proporcionó los datos de i18n necesarios."
      />
    );
  }
  // --- [FIN] GUARDIÁN DE RESILIENCIA DE CONTRATO ---

  const handleSwitchView = (newView: "login" | "signup") => {
    logger.trace(`[AuthForm] El usuario cambió la vista a: '${newView}'.`);
    setView(newView);
  };

  return (
    <TiltCard
      options={{
        max: 5,
        scale: 1.01,
        speed: 500,
        glare: true,
        "max-glare": 0.1,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: view === "login" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: view === "login" ? 20 : -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {view === "login" ? (
            <LoginForm
              content={content}
              locale={locale}
              onSwitchView={() => handleSwitchView("signup")}
            />
          ) : (
            <SignUpForm
              content={content}
              locale={locale}
              onSwitchView={() => handleSwitchView("login")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </TiltCard>
  );
}
