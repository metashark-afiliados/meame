// RUTA: src/shared/hooks/raz-prompts/use-prompt-creator.ts
/**
 * @file use-prompt-creator.ts
 * @description Hook "cerebro" para la lógica de creación de prompts.
 * @version 5.0.0 (Code Hygiene & Elite Compliance)
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

export const CreatePromptFormSchema = z.object({
  title: z.string().min(3, "El título es requerido."),
  promptText: z.string().min(10, "El prompt es requerido."),
  negativePrompt: z.string().optional(),
  tags: RaZPromptsSesaTagsSchema,
  parameters: PromptParametersSchema.deepPartial(),
  keywords: z.string().min(1, "Al menos una palabra clave es requerida."),
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
      tags: { ai: "ideo", sty: "pht", fmt: "16x9", typ: "ui", sbj: "abs" },
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
        toast.success("Genoma de Prompt creado!", {
          description: `ID: ${result.data.promptId}. Ahora puedes vincularlo a un activo en BAVI.`,
          duration: 10000,
        });
        form.reset();
      } else {
        toast.error("Error en la creación", { description: result.error });
      }
    });
  };

  return { form, onSubmit, isPending };
}
// RUTA: src/shared/hooks/raz-prompts/use-prompt-creator.ts
