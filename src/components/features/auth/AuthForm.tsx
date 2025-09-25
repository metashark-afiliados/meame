// RUTA: src/components/features/auth/AuthForm.tsx
/**
 * @file AuthForm.tsx
 * @description Orquestador de UI para autenticación, inyectado con MEA/UX de élite.
 *              Gestiona la vista (login/registro) y renderiza el formulario
 *              correspondiente con animaciones y efecto 3D.
 * @version 2.0.0 (MEA/UX Injection)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, "useState" from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";
import { LoginForm } from "./_components/LoginForm";
import { SignUpForm } from "./_components/SignUpForm";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type AuthFormContent = NonNullable<Dictionary["devLoginPage"]>;

interface AuthFormProps {
  content: AuthFormContent;
  locale: Locale;
}

export function AuthForm({ content, locale }: AuthFormProps) {
  const [view, setView] = useState<"login" | "signup">("login");

  return (
    <TiltCard options={{ max: 5, scale: 1.01, speed: 500, glare: true, "max-glare": 0.1 }}>
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
              onSwitchView={() => setView("signup")}
            />
          ) : (
            <SignUpForm
              content={content}
              locale={locale}
              onSwitchView={() => setView("login")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </TiltCard>
  );
}
