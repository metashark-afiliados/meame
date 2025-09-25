// RUTA: src/components/features/campaign-suite/Step0_Identity/Step0Form.tsx
/**
 * @file Step0Form.tsx
 * @description Componente de Presentación para el formulario del Paso 0.
 * @version 5.1.0 (Module Resolution Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { Form } from "@/components/ui/Form";
import { logger } from "@/shared/lib/logging";
import {
  type Step0Data,
  type Step0ContentSchema,
} from "@/shared/lib/schemas/campaigns/steps/step0.schema";
// --- [INICIO DE CORRECCIÓN ARQUITECTÓNICA] ---
import { CampaignSelectField, VariantInputField } from "../_components/shared";
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---
import { WizardNavigation } from "@/components/features/campaign-suite/_components/WizardNavigation";

type Step0Content = z.infer<typeof Step0ContentSchema>;

interface Step0FormProps {
  form: UseFormReturn<Step0Data>;
  content: Step0Content;
  baseCampaigns: string[];
  onSubmit: (data: Step0Data) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step0Form({
  form,
  content,
  baseCampaigns,
  onSubmit,
  onBack,
  onNext,
}: Step0FormProps): React.ReactElement {
  logger.info("Renderizando Step0Form (v5.1 - Module Resolution Fix)");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <CampaignSelectField
              control={form.control}
              name="baseCampaignId"
              label={content.baseCampaignLabel}
              placeholder={content.baseCampaignPlaceholder}
              description={content.baseCampaignDescription}
              options={baseCampaigns.map((id) => ({
                value: id,
                label: `Campaña ${id}`,
              }))}
            />
            <VariantInputField
              control={form.control}
              name="variantName"
              label={content.variantNameLabel}
              placeholder={content.variantNamePlaceholder}
            />
            <VariantInputField
              control={form.control}
              name="seoKeywords"
              label={content.seoKeywordsLabel}
              placeholder={content.seoKeywordsPlaceholder}
              description={content.seoKeywordsDescription}
            />
          </CardContent>
          <CardFooter>
            <WizardNavigation onBack={onBack} onNext={onNext} />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
// RUTA: src/components/features/campaign-suite/Step0_Identity/Step0Form.tsx
