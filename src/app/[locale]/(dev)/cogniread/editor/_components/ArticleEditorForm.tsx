// app/[locale]/(dev)/cogniread/editor/_components/ArticleEditorForm.tsx
/**
 * @file ArticleEditorForm.tsx
 * @description Componente de presentación para el formulario del editor de artículos.
 * @version 5.0.0 (Full i18n Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Button,
  DynamicIcon,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import { StudyDnaTab, ContentTab, EcosystemTab } from "./tabs";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema"; // Importar Dictionary

type EditorContent = NonNullable<Dictionary["cogniReadEditor"]>;

interface ArticleEditorFormProps {
  form: UseFormReturn<CogniReadArticle>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  content: EditorContent; // Recibir content
}

export function ArticleEditorForm({
  form,
  onSubmit,
  isPending,
  content, // Recibir content
}: ArticleEditorFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="dna" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dna">{content.tabs.dna}</TabsTrigger>{" "}
              {/* Consume i18n */}
              <TabsTrigger value="content">
                {content.tabs.content}
              </TabsTrigger>{" "}
              {/* Consume i18n */}
              <TabsTrigger value="ecosystem">
                {content.tabs.ecosystem}
              </TabsTrigger>{" "}
              {/* Consume i18n */}
            </TabsList>

            <TabsContent value="dna" className="mt-6">
              <StudyDnaTab form={form} />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <ContentTab form={form} content={content.contentTab} />{" "}
              {/* Pasa contentTab */}
            </TabsContent>

            <TabsContent value="ecosystem" className="mt-6">
              <EcosystemTab form={form} content={content.ecosystemTab} />{" "}
              {/* Pasa content para EcosystemTab */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="flex justify-end mt-6">
        {form.formState.errors.root && ( // Muestra error general del formulario si existe
          <p className="text-sm font-medium text-destructive mr-4 flex items-center">
            <DynamicIcon name="TriangleAlert" className="mr-2 h-4 w-4" />
            {String(form.formState.errors.root.message)}
          </p>
        )}
        <Button type="submit" disabled={isPending} size="lg">
          {isPending && (
            <DynamicIcon
              name="LoaderCircle"
              className="mr-2 h-4 w-4 animate-spin"
            />
          )}
          {isPending ? content.saveButtonLoading : content.saveButton}{" "}
          {/* Consume i18n */}
        </Button>
      </div>
    </form>
  );
}
