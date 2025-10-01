// RUTA: src/components/features/auth/_components/SignUpForm.tsx
/**
 * @file SignUpForm.tsx
 * @description Componente de presentación puro para el formulario de registro de élite.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, type Variants } from "framer-motion";
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
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import {
  SignUpSchema,
  type SignUpFormData,
} from "@/shared/lib/schemas/auth/signup.schema";
import { signUpAction } from "@/shared/lib/actions/auth/auth.actions";

type AuthFormContent = NonNullable<Dictionary["devLoginPage"]>;

interface SignUpFormProps {
  content: AuthFormContent;
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

export function SignUpForm({ content, onSwitchView }: SignUpFormProps) {
  logger.info("[SignUpForm] Renderizando v1.0.");
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      fullName:
        process.env.NODE_ENV === "development" ? "Super Usuario Dev" : "",
      email:
        process.env.NODE_ENV === "development" ? "superuser@webvork.dev" : "",
      password:
        process.env.NODE_ENV === "development" ? "superuserpassword123" : "",
      confirmPassword:
        process.env.NODE_ENV === "development" ? "superuserpassword123" : "",
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    startTransition(async () => {
      const result = await signUpAction(data);
      if (result.success) {
        toast.success("¡Registro exitoso!", {
          description: "Revisa tu email para confirmar tu cuenta.",
        });
        form.reset();
      } else {
        toast.error("Error de Registro", { description: result.error });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{content.signUpLink}</CardTitle>
        <CardDescription>
          Crea una nueva cuenta para acceder a la suite de desarrollo.
        </CardDescription>
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
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
                    <FormLabel>{content.passwordLabel}</FormLabel>
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
            </motion.div>
            <motion.div variants={fieldVariants}>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Repite la contraseña"
                        {...field}
                        onPaste={(e) => {
                          e.preventDefault();
                          toast.info(
                            "Por seguridad, escribe la contraseña de nuevo."
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={fieldVariants} className="!mt-6">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && (
                  <DynamicIcon
                    name="LoaderCircle"
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                )}
                {isPending ? "Registrando..." : content.signUpLink}
              </Button>
            </motion.div>
          </motion.form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <button
            onClick={onSwitchView}
            className="underline font-semibold text-primary"
          >
            Iniciar Sesión
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
