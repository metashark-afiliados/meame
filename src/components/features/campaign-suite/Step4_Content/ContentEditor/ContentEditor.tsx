// RUTA: src/components/features/campaign-suite/Step4_Content/ContentEditor/ContentEditor.tsx
/**
 * @file ContentEditor.tsx
 * @description Orquestador del editor de contenido. Gestiona el estado del
 *              formulario, la lógica de guardado y la comunicación con el exterior.
 * @version 6.0.0 (Holistic & Production Ready)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { defaultLocale, type Locale } from "@/shared/lib/i18n/i18n.config";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import { logger } from "@/shared/lib/logging";
import { ContentEditorHeader } from "./ContentEditorHeader";
import { ContentEditorBody } from "./ContentEditorBody";
import { ContentEditorFooter } from "./ContentEditorFooter";

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
  logger.info(`[ContentEditor] Editor abierto para: ${sectionName}`);

  const [activeLocale, setActiveLocale] = useState<Locale>(defaultLocale);

  const form = useForm<z.infer<typeof sectionSchema>>({
    resolver: zodResolver(sectionSchema),
    defaultValues: draft.contentData[sectionName]?.[activeLocale] || {},
    mode: "onBlur",
  });

  const handlePersistChange = (field: string, value: unknown) => {
    onUpdateContent(sectionName, activeLocale, field, value);
  };

  const onSubmit = () => {
    logger.success(
      `[ContentEditor] Contenido para ${sectionName} guardado. Cerrando panel.`
    );
    onClose();
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-2xl bg-background border-l shadow-2xl z-50 flex flex-col"
    >
      <ContentEditorHeader sectionName={sectionName} onClose={onClose} />
      <ContentEditorBody
        form={form}
        activeLocale={activeLocale}
        setActiveLocale={setActiveLocale}
        sectionSchema={sectionSchema}
        onPersistChange={handlePersistChange}
        onSubmit={form.handleSubmit(onSubmit)}
        sectionName={sectionName}
      />
      <ContentEditorFooter
        onClose={onClose}
        onSubmit={form.handleSubmit(onSubmit)}
      />
    </motion.div>
  );
}
