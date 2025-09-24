// RUTA: app/[locale]/account/page.tsx
/**
 * @file page.tsx
 * @description Página de Gestión de Cuenta del Usuario.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/features/account/ProfileForm";
import { PasswordForm } from "@/components/features/account/PasswordForm";
import { DeleteAccountZone } from "@/components/features/account/DeleteAccountZone";

export default async function AccountPage(): Promise<React.ReactElement> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de la Cuenta
        </h1>
        <p className="text-muted-foreground mt-1">
          Actualiza tu perfil, cambia tu contraseña y gestiona la seguridad de
          tu cuenta.
        </p>
      </header>

      <div className="space-y-12">
        <ProfileForm user={user} />
        <PasswordForm />
        <DeleteAccountZone />
      </div>
    </div>
  );
}
