// components/sections/comments/CommentForm.tsx
/**
 * @file CommentForm.tsx
 * @description Componente de presentación para el formulario de envío de comentarios.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage, Textarea, Button, DynamicIcon } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { logger } from "@/shared/lib/logging";

const CommentFormSchema = z.object({
  commentText: z.string().min(3, "El comentario debe tener al menos 3 caracteres.").max(2000),
});
type CommentFormData = z.infer<typeof CommentFormSchema>;

interface CommentFormProps {
  isAuthenticated: boolean;
  userAvatarUrl?: string | null;
  userName?: string;
  onSubmit: (data: CommentFormData) => void;
  isPending: boolean;
}

export function CommentForm({ isAuthenticated, userAvatarUrl, userName, onSubmit, isPending }: CommentFormProps) {
  logger.trace("[CommentForm] Renderizando.");

  const form = useForm<CommentFormData>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: { commentText: "" },
  });

  const handleFormSubmit = (data: CommentFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={userAvatarUrl ?? undefined} alt={userName || "Avatar de usuario"} />
        <AvatarFallback>
          <DynamicIcon name="User" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        {isAuthenticated ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="relative">
              <FormField
                control={form.control}
                name="commentText"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Añade tu comentario..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending && <DynamicIcon name="LoaderCircle" className="mr-2 h-4 w-4 animate-spin" />}
                  Publicar Comentario
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="border rounded-lg p-6 text-center bg-muted/50">
            <p className="text-muted-foreground">
              Debes <Link href="/dev/login" className="font-bold text-primary hover:underline">iniciar sesión</Link> para unirte a la conversación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
// components/sections/comments/CommentForm.tsx
