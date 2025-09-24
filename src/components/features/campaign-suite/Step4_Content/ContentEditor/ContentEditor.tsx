// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/ContentEditor/ContentEditor.tsx
/**
 * @file ContentEditor.tsx
 * @description Orquestador de alto nivel para la edición de contenido de una sección.
 *              Gestiona el estado del formulario, la sincronización con el borrador
 *              y la comunicación con el padre. Ahora pasa el `sectionName` a sus
 *              hijos y limpia el foco al cerrar para habilitar el Modo Enfoque.
 * @version 8.1.0 (Focus Mode Cleanup)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { logger } from "@/shared/lib/logging";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { supportedLocales, type Locale } from "@/shared/lib/i18n/i18n.config";
import { ContentEditorHeader } from "./ContentEditorHeader";
import { ContentEditorBody } from "./ContentEditorBody";
import { ContentEditorFooter } from "./ContentEditorFooter";
import { useFocusStore } from "../../../_context/FocusContext";

type SectionFormData = z.infer<z.ZodObject<z.ZodRawShape>>;

interface ContentEditorProps {
  sectionName: string;
  sectionSchema: z.ZodObject<z.ZodRawShape>;
  draft: CampaignDraft;
  onClose: () => void;
  onUpdateContent: (
    sectionName: string,
    locale: Locale,
    field: string,
    value: unknown
  ) => void;
}

export function ContentEditor({
  sectionName,
  sectionSchema,
  draft,
  onClose,
  onUpdateContent,
}: ContentEditorProps): React.ReactElement {
  const [activeLocale, setActiveLocale] = useState<Locale>(supportedLocales[0]);
  const { clearFocus } = useFocusStore();

  logger.info(
    `[ContentEditor] Orquestando editor para '${sectionName}', locale: '${activeLocale}'`
  );

  const form = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: draft.contentData[sectionName]?.[activeLocale] || {},
  });

  useEffect(() => {
    logger.trace(
      `[ContentEditor] Sincronizando formulario con borrador para locale: ${activeLocale}`
    );
    form.reset(draft.contentData[sectionName]?.[activeLocale] || {});
  }, [activeLocale, draft, sectionName, form]);

  const handlePersistChange = (field: string, value: unknown) => {
    onUpdateContent(sectionName, activeLocale, field, value);
    toast.info("Cambio guardado en el borrador.", {
      description: `El campo '${field}' se actualizó.`,
    });
  };

  const handleClose = () => {
    clearFocus(); // Limpia el foco al cerrar el editor
    onClose();
  };

  const handleSubmit = () => {
    logger.success(`[ContentEditor] Edición finalizada para ${sectionName}.`);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in-0">
      <div className="relative bg-background border rounded-lg shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
        <ContentEditorHeader sectionName={sectionName} onClose={handleClose} />
        <ContentEditorBody
          form={form}
          activeLocale={activeLocale}
          setActiveLocale={setActiveLocale}
          sectionSchema={sectionSchema}
          onPersistChange={handlePersistChange}
          onSubmit={form.handleSubmit(handleSubmit)}
          sectionName={sectionName}
        />
        <ContentEditorFooter onClose={handleClose} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/ContentEditor/ContentEditor.tsx
