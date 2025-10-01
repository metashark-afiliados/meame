// RUTA: src/components/features/auth/_components/LoginForm.tsx
/**
 * @file LoginForm.tsx
 * @description Componente de presentación puro para el formulario de login.
 *              v5.1.0 (Build Integrity Restoration): Corrige una ruta de importación
 *              rota, restaurando la integridad arquitectónica y del build.
 * @version 5.1.0
 *@author RaZ Podestá - MetaShark Tech - Asistente de Refactorización
 */
"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, type Variants, AnimatePresence } from "framer-motion";
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
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { logger } from "@/shared/lib/logging";
import { routes } from "@/shared/lib/navigation";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import {
  LoginSchema,
  type LoginFormData,
} from "@/shared/lib/schemas/auth/login.schema";
import { loginWithPasswordAction } from "@/shared/lib/actions/auth/auth.actions";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

type LoginFormContent = NonNullable<Dictionary["devLoginPage"]>;

interface LoginFormProps {
  content: LoginFormContent;
  locale: Locale;
  onSwitchView: () => void;
}

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function LoginForm({ content, locale, onSwitchView }: LoginFormProps) {
  logger.info("[LoginForm] Renderizando v5.1 (Build Integrity Restoration).");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email:
        process.env.NODE_ENV === "development" ? "superuser@webvork.dev" : "",
      password:
        process.env.NODE_ENV === "development" ? "superuserpassword123" : "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const result = await loginWithPasswordAction(data);
      if (result.success) {
        toast.success("Login exitoso. Redirigiendo...");
        const redirectTo = searchParams.get("redirectedFrom");
        const destination = redirectTo || routes.devDashboard.path({ locale });
        logger.info(
          `[LoginForm] Redirección post-login. Destino: ${destination}`
        );
        router.push(destination);
      } else {
        toast.error("Error de Login", { description: result.error });
        form.setError("root", { message: result.error });
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{content.title}</CardTitle>
          <CardDescription>{content.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <motion.form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              variants={formVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fieldVariants}>
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
              </motion.div>
              <motion.div variants={fieldVariants}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>{content.passwordLabel}</FormLabel>
                        <button
                          type="button"
                          onClick={() => setIsForgotPasswordOpen(true)}
                          className="ml-auto inline-block text-sm underline"
                        >
                          {content.forgotPasswordLink}
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={content.passwordPlaceholder}
                            className="pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                              showPassword
                                ? content.hidePasswordAriaLabel
                                : content.showPasswordAriaLabel
                            }
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={showPassword ? "eye-off" : "eye"}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.15 }}
                              >
                                <DynamicIcon
                                  name={showPassword ? "EyeOff" : "Eye"}
                                  className="h-4 w-4"
                                />
                              </motion.div>
                            </AnimatePresence>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
              <motion.div variants={fieldVariants} className="!mt-6">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && (
                    <DynamicIcon
                      name="LoaderCircle"
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                  )}
                  {isPending ? content.buttonLoadingText : content.buttonText}
                </Button>
              </motion.div>
            </motion.form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {content.signUpPrompt}{" "}
            <button
              onClick={onSwitchView}
              className="underline font-semibold text-primary"
            >
              {content.signUpLink}
            </button>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
      >
        <DialogContent>
          <ForgotPasswordForm
            content={content.forgotPassword}
            onSuccess={() => setIsForgotPasswordOpen(false)}
            onCancel={() => setIsForgotPasswordOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
