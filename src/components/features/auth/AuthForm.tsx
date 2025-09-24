// RUTA: components/features/auth/AuthForm.tsx
/**
 * @file AuthForm.tsx
 * @description Componente de cliente para el formulario de inicio de sesión y registro.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import { createClient } from "@/shared/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";

const AuthSchema = z.object({
  email: z.string().email("Por favor, introduce un email válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});
type AuthFormData = z.infer<typeof AuthSchema>;

export function AuthForm(): React.ReactElement {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(AuthSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (formData: AuthFormData) => {
    setAuthError(null);
    startTransition(async () => {
      let error = null;
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp(formData);
        error = signUpError;
        // Podríamos mostrar un mensaje de "revisa tu email para confirmar"
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword(formData);
        error = signInError;
      }

      if (error) {
        logger.warn("Fallo de autenticación.", { message: error.message });
        setAuthError(error.message);
      } else {
        router.refresh(); // Crucial para recargar la sesión en los componentes de servidor
        const redirectTo =
          searchParams.get("redirectedFrom") || "/creator/campaign-suite";
        router.push(redirectTo);
      }
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          {isSignUp ? "Crear una Cuenta" : "Iniciar Sesión"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Introduce tus datos para registrarte."
            : "Bienvenido de nuevo."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <DynamicIcon name="AlertTriangle" className="h-4 w-4" />
              <AlertTitle>Error de Autenticación</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && (
              <DynamicIcon
                name="LoaderCircle"
                className="mr-2 h-4 w-4 animate-spin"
              />
            )}
            {isSignUp ? "Registrarse" : "Iniciar Sesión"}
          </Button>
          <Button
            variant="link"
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "¿Ya tienes una cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
