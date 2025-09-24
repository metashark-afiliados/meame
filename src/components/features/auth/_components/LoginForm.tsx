// RUTA: app/[locale]/(dev)/login/_components/LoginForm.tsx
/**
 * @file LoginForm.tsx
 * @description Componente de cliente de élite para el formulario de login del DCC,
 *              integrado con Supabase a través de Server Actions.
 * @version 2.0.0 (Elite & Functional)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import {
  LoginSchema,
  type LoginFormData,
} from "@/shared/lib/schemas/auth/login.schema";
import { loginWithPasswordAction } from "@/shared/lib/actions/auth.actions";

type LoginFormContent = NonNullable<Dictionary["devLoginPage"]>;

interface LoginFormProps {
  content: LoginFormContent;
  locale: Locale;
}

export function LoginForm({ content, locale }: LoginFormProps) {
  logger.info("[LoginForm] Renderizando formulario de login con Supabase.");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const result = await loginWithPasswordAction(data);

      if (result.success) {
        toast.success("Login exitoso. Redirigiendo al DCC...");
        router.push(routes.devDashboard.path({ locale }));
      } else {
        toast.error("Error de Login", { description: result.error });
        form.setError("root", { message: result.error });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{content.title}</CardTitle>
        <CardDescription>{content.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{content.emailLabel}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={content.emailPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>{content.passwordLabel}</FormLabel>
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      {content.forgotPasswordLink}
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={content.passwordPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && (
                <DynamicIcon
                  name="LoaderCircle"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              )}
              {isPending ? content.buttonLoadingText : content.buttonText}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {content.signUpPrompt}{" "}
          <Link href="#" className="underline">
            {content.signUpLink}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
