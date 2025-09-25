// RUTA: src/components/features/campaign-suite/Step0_Identity/Step0Client.tsx
/**
 * @file Step0Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 0, con flujo de UX gamificado.
 * @version 4.0.0 (Holistic Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import {
  step0Schema,
  type Step0Data,
  type Step0ContentSchema,
} from "@/shared/lib/schemas/campaigns/steps/step0.schema";
import { useCampaignDraft } from "@/shared/hooks/campaign-suite/use-campaign-draft";
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { Step0Form } from "./Step0Form";
import { PassportStamp } from "@/components/ui/PassportStamp";
import { Card, CardContent } from "@/components/ui/Card";

type Step0Content = z.infer<typeof Step0ContentSchema>;

interface Step0ClientProps {
  content?: Step0Content;
  baseCampaigns: string[];
}

export function Step0Client({
  content,
  baseCampaigns,
}: Step0ClientProps): React.ReactElement {
  logger.info("Renderizando Step0Client (v4.0 - Holistic Integrity)");

  const { draft, updateDraft } = useCampaignDraft();
  const { goToNextStep, goToPrevStep } = useWizard();
  const [submissionState, setSubmissionState] = useState<
    "form" | "stamping" | "complete"
  >("form");

  const form = useForm<Step0Data>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      baseCampaignId: draft.baseCampaignId ?? baseCampaigns[0] ?? "",
      variantName: draft.variantName ?? "Test Variant",
      seoKeywords: draft.seoKeywords ?? "test, keywords, for, seo",
      affiliateNetwork: draft.affiliateNetwork ?? "webvork",
      affiliateUrl: draft.affiliateUrl ?? "https://example.com/offer/123",
    },
  });

  useEffect(() => {
    if (submissionState === "stamping") {
      const timer = setTimeout(() => {
        setSubmissionState("complete");
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (submissionState === "complete") {
      goToNextStep();
    }
  }, [submissionState, goToNextStep]);

  if (!content) {
    logger.error("[Step0Client] El contenido para el Paso 0 es indefinido.");
    return (
      <div className="text-destructive p-8">
        Error: Faltan datos de contenido para este paso.
      </div>
    );
  }

  const onSubmit = (data: Step0Data) => {
    logger.startGroup("[Step0Client] Procesando envío de formulario...");
    updateDraft(data);
    logger.success(
      "[Step0Client] Borrador actualizado. Iniciando animación de sello."
    );
    setSubmissionState("stamping");
    logger.endGroup();
  };

  const animationVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <AnimatePresence mode="wait">
      {submissionState === "form" && (
        <motion.div
          key="form"
          variants={animationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Step0Form
            form={form}
            content={content}
            baseCampaigns={baseCampaigns}
            onSubmit={onSubmit}
            onBack={goToPrevStep}
            onNext={goToNextStep}
          />
        </motion.div>
      )}

      {submissionState === "stamping" && (
        <motion.div
          key="stamping"
          variants={animationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Card>
            <CardContent className="pt-6 min-h-[500px] flex items-center justify-center">
              <PassportStamp label={content.passportStampLabel} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
