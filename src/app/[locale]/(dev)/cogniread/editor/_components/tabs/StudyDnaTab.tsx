// app/[locale]/(dev)/cogniread/editor/_components/tabs/StudyDnaTab.tsx
/**
 * @file StudyDnaTab.tsx
 * @description Componente de presentación para la pestaña "ADN del Estudio".
 *              v3.0.0 (Definitive Type Safety): Erradica el uso de 'any',
 *              estableciendo un contrato de tipos estricto con el formulario
 *              padre y eliminando lógica de actualización redundante.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui";
import { SchemaFieldRenderer } from "@/components/features/form-builder/builder/SchemaFieldRenderer";
import {
  StudyDnaSchema,
  type CogniReadArticle,
  type StudyDna,
} from "@/shared/lib/schemas/cogniread/article.schema";
import { logger } from "@/shared/lib/logging";

/**
 * @interface StudyDnaTabProps
 * @description Contrato de props que ahora espera el tipo de formulario completo
 *              para una seguridad de tipos de extremo a extremo.
 */
interface StudyDnaTabProps {
  form: UseFormReturn<CogniReadArticle>;
}

export function StudyDnaTab({ form }: StudyDnaTabProps): React.ReactElement {
  logger.info("[StudyDnaTab] Renderizando v3.0 (Definitive Type-Safe).");
  const dnaFields = Object.keys(StudyDnaSchema.shape) as (keyof StudyDna)[];

  return (
    <Form {...form}>
      <div className="space-y-8">
        {dnaFields.map((fieldName) => (
          <SchemaFieldRenderer
            key={fieldName}
            control={form.control}
            sectionName="studyDna"
            // El 'name' ahora se construye de forma segura. TypeScript sabe que
            // `studyDna.${fieldName}` es una ruta válida en `CogniReadArticle`.
            fieldName={`studyDna.${fieldName}`}
            fieldSchema={StudyDnaSchema.shape[fieldName]}
            // onValueChange se elimina; la persistencia se gestiona en el editor principal.
            onValueChange={() => {}}
          />
        ))}
      </div>
    </Form>
  );
}
// app/[locale]/(dev)/cogniread/editor/_components/tabs/StudyDnaTab.tsx
