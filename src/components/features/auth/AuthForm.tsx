// RUTA: src/components/features/auth/AuthForm.tsx
/**
 * @file AuthForm.tsx
 * @description Orquestador de UI para autenticación, inyectado con MEA/UX de élite,
 *              observabilidad y un guardián de resiliencia de contrato.
 *              v4.0.0 (Elite Observability & Data Propagation): Refactorizado para
 *              propagar correctamente el contenido a los componentes hijos.
 * @version 4.0.0
 * @author L.I.A. Legacy
 */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";
import { LoginForm } from "./components/LoginForm";
import { SignUpForm } from "./components/SignUpForm";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type AuthFormContent = NonNullable<Dictionary["devLoginPage"]>;
type OAuthButtonsContent = NonNullable<Dictionary["oAuthButtons"]>;

interface AuthFormProps {
  content: AuthFormContent;
  oAuthContent: OAuthButtonsContent;
  locale: Locale;
}

export function AuthForm({ content, oAuthContent, locale }: AuthFormProps) {
  const traceId = useMemo(
    () => logger.startTrace("AuthForm_Lifecycle_v4.0"),
    []
  );
  useEffect(() => {
    logger.info("[AuthForm] Orquestador montado.", { traceId });
    return () => logger.endTrace(traceId);
  }, [traceId]);

  const [view, setView] = useState<"login" | "signup">("login");

  // --- Pilar de Resiliencia: Guardián de Contrato ---
  if (!content || !oAuthContent) {
    const errorMsg =
      "Contrato de UI violado: Faltan las props 'content' u 'oAuthContent'.";
    logger.error(`[Guardián] ${errorMsg}`, { traceId });
    return <DeveloperErrorDisplay context="AuthForm" errorMessage={errorMsg} />;
  }

  const handleSwitchView = (newView: "login" | "signup") => {
    logger.traceEvent(
      traceId,
      `Acción de usuario: Cambiando vista a '${newView}'.`
    );
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
              oAuthContent={oAuthContent}
              locale={locale}
              onSwitchView={() => handleSwitchView("signup")}
            />
          ) : (
            <SignUpForm
              content={content}
              oAuthContent={oAuthContent}
              locale={locale}
              onSwitchView={() => handleSwitchView("login")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </TiltCard>
  );
}
