// RUTA: app/[locale]/login/page.tsx
/**
 * @file page.tsx
 * @description Página de Inicio de Sesión para la aplicación.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage(): React.ReactElement {
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <AuthForm />
    </div>
  );
}
