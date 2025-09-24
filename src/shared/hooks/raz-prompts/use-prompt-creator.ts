// Ruta correcta: src/shared/hooks/raz-prompts/use-prompt-creator.ts
/**
 * @file use-prompt-creator.ts
 * @description Hook "cerebro" para la lógica de creación de prompts.
 * @version 3.1.0 (Sovereign Path Normalization)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createPromptEntryAction } from "@/shared/lib/actions/raz-prompts";
import {
  RaZPromptsSesaTagsSchema,
  PromptParametersSchema,
} from "@/shared/lib/schemas/raz-prompts/atomic.schema";
import { logger } from "@/shared/lib/logging";

export const CreatePromptFormSchema = z.object({
  title: z.string().min(3, "Il titolo è richiesto."),
  promptText: z.string().min(10, "Il prompt è richiesto."),
  negativePrompt: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema,
  parameters: PromptParametersSchema.deepPartial(),
  keywords: z.string().min(1, "Almeno una parola chiave è richiesta."),
});

export type CreatePromptFormData = z.infer<typeof CreatePromptFormSchema>;

export function usePromptCreator() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreatePromptFormData>({
    resolver: zodResolver(CreatePromptFormSchema),
    defaultValues: {
      title: "",
      promptText: "",
      negativePrompt: "",
      tags: { ai: "ideo", sty: "pht", fmt: "16-9", typ: "ui", sbj: "abs" },
      parameters: {
        renderingSpeed: "DEFAULT",
        styleType: "REALISTIC",
        aspectRatio: "16x9",
        numImages: 1,
        size: "1280x768",
      },
      keywords: "",
    },
  });

  const onSubmit = (data: CreatePromptFormData) => {
    logger.startGroup("[usePromptCreator] Tentativo di creazione prompt...");
    startTransition(async () => {
      const result = await createPromptEntryAction({
        title: data.title,
        versions: [
          {
            version: 1,
            promptText: data.promptText,
            negativePrompt: data.negativePrompt,
            parameters: data.parameters as z.infer<
              typeof PromptParametersSchema
            >,
            createdAt: new Date().toISOString(),
          },
        ],
        tags: data.tags,
        keywords: data.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      });

      if (result.success) {
        toast.success("Voce del prompt creata!", {
          description: `ID: ${result.data.promptId}. Copialo per collegare la tua immagine.`,
          duration: 10000,
        });
        logger.success(
          `[usePromptCreator] Prompt creato con successo: ${result.data.promptId}`
        );
        form.reset();
      } else {
        toast.error("Errore nella creazione del prompt", {
          description: result.error,
        });
        logger.error(
          "[usePromptCreator] Fallimento nella creazione del prompt.",
          { error: result.error }
        );
      }
      logger.endGroup();
    });
  };

  return { form, onSubmit, isPending };
}
// Ruta correcta: src/shared/hooks/raz-prompts/use-prompt-creator.ts
