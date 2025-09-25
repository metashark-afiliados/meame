// RUTA: src/components/features/cogniread/editor/ArticleEditorClient.tsx
/**
 * @file ArticleEditorClient.tsx
 * @description Componente "cerebro" para el editor de CogniRead, gestiona el
 *              estado del formulario y las interacciones del usuario.
 * @version 4.0.0 (Holistic & Data-Driven)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "@/shared/lib/schemas/cogniread/article.schema";
import { createOrUpdateArticleAction } from "@/shared/lib/actions/cogniread";
import { ArticleEditorForm } from "./ArticleEditorForm";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type EditorContent = NonNullable<Dictionary["cogniReadEditor"]>;

interface ArticleEditorClientProps {
  initialData: CogniReadArticle | null;
  content: EditorContent;
}

export function ArticleEditorClient({
  initialData,
  content,
}: ArticleEditorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CogniReadArticle>({
    resolver: zodResolver(CogniReadArticleSchema),
    defaultValues: initialData || {
      status: "draft",
      studyDna: {
        originalTitle: "",
        authors: [],
        institution: "",
        publication: "",
        publicationDate: new Date().toISOString(),
        doi: "",
        fundingSource: "",
        objective: "",
        studyType: "",
        methodologySummary: "",
        mainResults: "",
        authorsConclusion: "",
        limitations: [],
      },
      content: {},
    },
  });

  useEffect(() => {
    // Resetea el formulario si los datos iniciales cambian (ej. al navegar entre artículos)
    form.reset(initialData || form.control._defaultValues);
  }, [initialData, form]);

  const onSubmit = (data: CogniReadArticle) => {
    startTransition(async () => {
      const result = await createOrUpdateArticleAction(data);

      if (result.success) {
        toast.success(
          `Artículo ${initialData ? "actualizado" : "creado"} con éxito!`
        );
        // Redirige a la misma página de edición para evitar re-envíos y
        // actualizar la URL con el ID si es una nueva creación.
        router.push(`?id=${result.data.articleId}`);
        router.refresh(); // Refresca los datos del Server Component
      } else {
        toast.error("Error al guardar el artículo", {
          description: result.error,
        });
      }
    });
  };

  return (
    <ArticleEditorForm
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      isPending={isPending}
      content={content}
    />
  );
}
