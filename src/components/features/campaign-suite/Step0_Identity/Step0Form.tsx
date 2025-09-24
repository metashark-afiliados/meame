// app/[locale]/(dev)/dev/campaign-suite/_components/Step0_Identity/Step0Form.tsx
/**
 * @file Step0Form.tsx
 * @description Componente de Presentación para el formulario del Paso 0.
 * @version 4.3.0 (Sovereign Type Contract)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { logger } from "@/shared/lib/logging";
import type { Step0Data } from "../../_schemas/step0.schema";
import { CampaignSelectField, VariantInputField } from "../shared";
import { Step0ContentSchema } from "@/shared/lib/schemas/campaigns/steps/step0.schema";
import { z } from "zod";

type Step0Content = z.infer<typeof Step0ContentSchema>;

interface Step0FormProps {
  form: UseFormReturn<Step0Data>;
  content: Step0Content; // <-- Contrato estricto y no opcional
  baseCampaigns: string[];
  onSubmit: (data: Step0Data) => void;
}

export function Step0Form({
  form,
  content,
  baseCampaigns,
  onSubmit,
}: Step0FormProps): React.ReactElement {
  logger.info("Renderizando Step0Form (Presentación Pura - Contrato Soberano)");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            <div className="flex justify-end items-center pt-8 border-t">
              <Button type="submit">Guardar y Continuar</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
// app/[locale]/(dev)/dev/campaign-suite/_components/Step0_Identity/Step0Form.tsx
