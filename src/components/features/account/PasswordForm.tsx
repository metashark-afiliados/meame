// RUTA: components/features/account/PasswordForm.tsx
/**
 * @file PasswordForm.tsx
 * @description Componente de cliente seguro para el formulario de cambio de contraseña.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/Form";
import { UpdatePasswordSchema } from "@/shared/lib/schemas/account/account-forms.schema";
import { updateUserPasswordAction } from "@/shared/lib/actions/account/manage-account.action";
import type { z } from "zod";

type PasswordFormData = z.infer<typeof UpdatePasswordSchema>;

export function PasswordForm(): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const form = useForm<PasswordFormData>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (formData: PasswordFormData) => {
    startTransition(async () => {
      // Creamos un FormData object para enviar a la Server Action
      const formPayload = new FormData();
      formPayload.append("newPassword", formData.newPassword);
      formPayload.append("confirmPassword", formData.confirmPassword);

      const result = await updateUserPasswordAction(formPayload);

      if (result.success) {
        toast.success("¡Contraseña actualizada con éxito!");
        form.reset();
      } else {
        toast.error("Error al actualizar la contraseña", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
        <CardDescription>
          Para tu seguridad, elige una contraseña fuerte y única.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <FormControl>
                    <Input id="newPassword" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <FormControl>
                    <Input id="confirmPassword" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <DynamicIcon
                  name="LoaderCircle"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              )}
              Actualizar Contraseña
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
