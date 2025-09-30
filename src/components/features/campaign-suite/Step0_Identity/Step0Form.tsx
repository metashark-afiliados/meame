// RUTA: src/components/features/campaign-suite/Step0_Identity/Step0Form.tsx
/**
 * @file Step0Form.tsx
 * @description Componente de Presentación para el formulario del Paso 0, ahora
 *              con selectores de proveedor y tipo de campaña.
 * @version 7.2.0 (Holistic & Elite Compliance)
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
import { CampaignSelectField, VariantInputField } from "../_components/shared";
import { WizardNavigation } from "@/components/features/campaign-suite/_components/WizardNavigation";
import { producersConfig } from "@/shared/lib/config/campaign-suite/producers.config";

// SSoT de Tipos para Props
type Step0Content = z.infer<typeof Step0ContentSchema>;

interface Step0FormProps {
  form: UseFormReturn<Step0Data>;
  content: Step0Content;
  baseCampaigns: string[];
  onSubmit: (data: Step0Data) => void;
}

export function Step0Form({
  form,
  content,
  baseCampaigns,
  onSubmit,
}: Step0FormProps): React.ReactElement {
  // Pilar III (Observabilidad)
  logger.info("Renderizando Step0Form v7.2 (Holistic).");

  // Lógica de UI para el selector dependiente
  const selectedProducer = form.watch("producer");
  const campaignTypeOptions =
    producersConfig.find((p) => p.id === selectedProducer)
      ?.supportedCampaignTypes || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {/* Selector de Proveedor */}
            <CampaignSelectField
              control={form.control}
              name="producer"
              label={content.producerLabel}
              placeholder={content.producerPlaceholder}
              options={producersConfig.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
            />
            {/* Selector de Tipo de Campaña (dependiente) */}
            <CampaignSelectField
              control={form.control}
              name="campaignType"
              label={content.campaignTypeLabel}
              placeholder={content.campaignTypePlaceholder}
              options={campaignTypeOptions.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />
            {/* Campos originales */}
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
            {/* El botón "Atrás" se deshabilita en el primer paso */}
            <WizardNavigation
              onNext={form.handleSubmit(onSubmit)}
              onBack={() => {}}
            />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
