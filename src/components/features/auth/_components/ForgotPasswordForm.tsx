// RUTA: src/components/features/auth/_components/ForgotPasswordForm.tsx
/**
 * @file ForgotPasswordForm.tsx
 * @description Componente de cliente puro para el formulario modal de recuperación de contraseña.
 * @version 1.2.0 (Build Integrity Restoration)
 * @author L.I.A. Legacy - Asistente de Refactorización
 */
"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
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
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import {
  ForgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/shared/lib/schemas/auth/forgot-password.schema";
import { sendPasswordResetAction } from "@/shared/lib/actions/auth/auth.actions";

type ForgotPasswordContent = NonNullable<
  NonNullable<Dictionary["devLoginPage"]>["forgotPassword"]
>;

interface ForgotPasswordFormProps {
  content: ForgotPasswordContent;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ForgotPasswordForm({
  content,
  onSuccess,
  onCancel,
}: ForgotPasswordFormProps) {
  logger.info("[ForgotPasswordForm] Renderizando v1.2.");
  const [isPending, startTransition] = useTransition();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email:
        process.env.NODE_ENV === "development" ? "superuser@webvork.dev" : "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      const result = await sendPasswordResetAction(data);
      if (result.success) {
        toast.success(content.successToastTitle, {
          description: content.successToastDescription,
        });
        onSuccess();
      } else {
        toast.error("Error", { description: result.error });
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{content.modalTitle}</DialogTitle>
        <DialogDescription>{content.modalDescription}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          id="forgot-password-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 py-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          {content.cancelButton}
        </Button>
        <Button
          type="submit"
          form="forgot-password-form"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending && (
            <DynamicIcon
              name="LoaderCircle"
              className="mr-2 h-4 w-4 animate-spin"
            />
          )}
          {isPending ? content.submitButtonLoading : content.submitButton}
        </Button>
      </DialogFooter>
    </>
  );
}
