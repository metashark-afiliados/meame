// RUTA: src/components/features/campaign-suite/Step0_Identity/Step0Client.tsx
/**
 * @file Step0Client.tsx
 * @description Componente Contenedor de Cliente para el Paso 0. Gestiona el
 *              estado del formulario, incluyendo la selección de proveedor.
 * @version 9.2.1 (Sovereign Path Restoration)
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AnimatePresence,
  motion,
  type Variants,
  type Transition,
} from "framer-motion";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
// --- [INICIO DE REFACTORIZACIÓN DE RUTA SOBERANA] ---
import {
  step0Schema,
  type Step0Data,
  type Step0ContentSchema,
} from "@/shared/lib/schemas/campaigns/steps/step0.schema";
// --- [FIN DE REFACTORIZACIÓN DE RUTA SOBERANA] ---
import { useWizard } from "@/components/features/campaign-suite/_context/WizardContext";
import { Step0Form } from "./Step0Form";
import { PassportStamp } from "@/components/ui/PassportStamp";
import { Card, CardContent } from "@/components/ui/Card";
import { useDraftMetadataStore } from "@/shared/hooks/campaign-suite/use-draft-metadata.store";
import { useStep0IdentityStore } from "@/shared/hooks/campaign-suite/use-step0-identity.store";

type Step0Content = z.infer<typeof Step0ContentSchema>;

interface Step0ClientProps {
  content: Step0Content;
  baseCampaigns: string[];
}

export function Step0Client({
  content,
  baseCampaigns,
}: Step0ClientProps): React.ReactElement {
  logger.info("Renderizando Step0Client v9.2.1 (Path Restoration).");

  const {
    baseCampaignId,
    variantName,
    seoKeywords,
    setMetadata,
    completeStep,
  } = useDraftMetadataStore();
  const { producer, campaignType, setStep0Data } = useStep0IdentityStore();
  const { goToNextStep } = useWizard();
  const [submissionState, setSubmissionState] = useState<
    "form" | "stamping" | "complete"
  >("form");

  const form = useForm<Step0Data>({
    resolver: zodResolver(step0Schema),
    defaultValues: {
      baseCampaignId: baseCampaignId ?? baseCampaigns[0] ?? "",
      variantName: variantName ?? "",
      seoKeywords: seoKeywords ?? "",
      producer: producer ?? "",
      campaignType: campaignType ?? "",
    },
  });

  useEffect(() => {
    if (submissionState === "stamping") {
      const timer = setTimeout(() => setSubmissionState("complete"), 2000);
      return () => clearTimeout(timer);
    }
    if (submissionState === "complete") {
      goToNextStep();
    }
  }, [submissionState, goToNextStep]);

  const onSubmit = (data: Step0Data) => {
    logger.startGroup("[Step0Client] Procesando envío de formulario...");
    setMetadata({
      baseCampaignId: data.baseCampaignId,
      variantName: data.variantName,
      seoKeywords: data.seoKeywords,
    });
    setStep0Data({
      producer: data.producer,
      campaignType: data.campaignType,
    });
    completeStep(0);
    logger.success(
      "[Step0Client] Stores atómicos actualizados. Iniciando animación MEA/UX."
    );
    setSubmissionState("stamping");
    logger.endGroup();
  };

  const transitionConfig: Transition = { duration: 0.3, ease: "easeInOut" };
  const animationVariants: Variants = {
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
          transition={transitionConfig}
        >
          <Step0Form
            form={form}
            content={content}
            baseCampaigns={baseCampaigns}
            onSubmit={onSubmit}
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
          transition={transitionConfig}
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
