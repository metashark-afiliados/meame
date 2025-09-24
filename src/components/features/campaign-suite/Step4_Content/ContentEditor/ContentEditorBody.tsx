// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/ContentEditor/ContentEditorBody.tsx
/**
 * @file ContentEditorBody.tsx
 * @description Cuerpo del editor de contenido, ahora con higiene de código de élite.
 * @version 5.0.0 (Code Hygiene)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  Tabs,
  // --- [INICIO DE CORRECCIÓN] ---
  // Se elimina la importación no utilizada de 'TabsContent'.
  // --- [FIN DE CORRECCIÓN] ---
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { SchemaFieldRenderer } from "@/components/features/form-builder/builder/SchemaFieldRenderer";
import { supportedLocales, type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";

// ... (El resto del componente permanece sin cambios)
interface ContentEditorBodyProps {
  form: UseFormReturn<z.infer<z.ZodObject<z.ZodRawShape>>>;
  activeLocale: Locale;
  setActiveLocale: (locale: Locale) => void;
  sectionSchema: z.ZodObject<z.ZodRawShape>;
  onPersistChange: (field: string, value: unknown) => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  sectionName: string;
}

export function ContentEditorBody({
  form,
  activeLocale,
  setActiveLocale,
  sectionSchema,
  onPersistChange,
  onSubmit,
  sectionName,
}: ContentEditorBodyProps): React.ReactElement {
  logger.trace("[ContentEditorBody v5.0] Renderizando.");
  const fieldsToRender = Object.keys(sectionSchema.shape);

  return (
    <div className="p-6 flex-grow overflow-y-auto">
      <Tabs
        value={activeLocale}
        onValueChange={(value) => setActiveLocale(value as Locale)}
        className="h-full flex flex-col"
      >
        <TabsList>
          {supportedLocales.map((locale) => (
            <TabsTrigger key={locale} value={locale}>
              {locale.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-grow mt-4 overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {fieldsToRender.map((fieldName) => (
                <SchemaFieldRenderer
                  key={`${activeLocale}-${fieldName}`}
                  control={form.control}
                  sectionName={sectionName}
                  fieldName={fieldName}
                  fieldSchema={sectionSchema.shape[fieldName]}
                  onValueChange={onPersistChange}
                />
              ))}
            </form>
          </Form>
        </div>
      </Tabs>
    </div>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step4_Content/ContentEditor/ContentEditorBody.tsx
