// app/[locale]/(dev)/cogniread/editor/_components/ArticleEditorClient.tsx
/**
 * @file ArticleEditorClient.tsx
 * @description Componente "cerebro" para el editor de CogniRead, con layout de pestañas.
 * @version 3.0.0 (Tabbed Layout & Full Article State)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CogniReadArticleSchema,
  type CogniReadArticle,
} from "@/shared/lib/schemas/cogniread/article.schema";
import { createOrUpdateArticleAction } from "@/shared/lib/actions/cogniread/createOrUpdateArticle.action";
import { ArticleEditorForm } from "./ArticleEditorForm";
import { useRouter } from "next/navigation";

interface ArticleEditorClientProps {
  initialData: CogniReadArticle | null;
}

export function ArticleEditorClient({ initialData }: ArticleEditorClientProps) {
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
      relatedPromptIds: [],
    },
  });

  useEffect(() => {
    form.reset(initialData || {});
  }, [initialData, form]);

  const onSubmit = (data: CogniReadArticle) => {
    startTransition(async () => {
      // El payload ahora es el objeto 'data' completo
      const result = await createOrUpdateArticleAction(data);

      if (result.success) {
        toast.success(
          `Artículo ${initialData ? "actualizado" : "creado"} con éxito!`
        );
        // Redirige a la misma página de edición para evitar re-envíos y actualizar la URL con el ID
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
    />
  );
}
// app/[locale]/(dev)/cogniread/editor/_components/ArticleEditorClient.tsx
