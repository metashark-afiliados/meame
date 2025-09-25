// RUTA: src/components/forms/OrderForm.tsx
/**
 * @file OrderForm.tsx
 * @description Formulario de pedido de élite, "Guardián de la Conversión".
 *              Replicando la funcionalidad de sumisión del productor (Webvork),
 *              este aparato utiliza validación de cliente para una UX superior,
 *              orquesta la lógica de tracking y está inyectado con MEA/UX para
 *              una experiencia de usuario memorable. Cumple con los 7 Pilares de Calidad.
 * @version 8.0.0 (Holistic Elite Leveling & MEA/UX Injection)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, type Variants } from "framer-motion";
import { getProducerConfig } from "@/shared/lib/config/producer.config";
import { logger } from "@/shared/lib/logging";
import { useProducerLogic } from "@/shared/hooks/use-producer-logic";
import { HiddenFormFields } from "@/components/features/commerce/HiddenFormFields";
import { FormInput } from "@/components/ui/FormInput";
import { Button, DynamicIcon } from "@/components/ui";

// --- SSoT de Contratos y Animaciones ---

const OrderFormSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio"),
  phone: z
    .string()
    .min(9, "Il numero de telefono non è valido")
    .regex(/^\+?[0-9\s-()]+$/, "Formato de telefone inválido"),
});

type OrderFormData = z.infer<typeof OrderFormSchema>;

interface OrderFormProps {
  content: {
    nameInputLabel: string;
    nameInputPlaceholder: string;
    phoneInputLabel: string;
    phoneInputPlaceholder: string;
    submitButtonText: string;
    submitButtonLoadingText: string;
  };
}

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

// --- Componente de Élite ---

export function OrderForm({ content }: OrderFormProps): React.ReactElement {
  logger.info("[OrderForm] Renderizando v8.0 (Elite & MEA/UX).");

  const formRef = useRef<HTMLFormElement>(null);
  const producerConfig = getProducerConfig(); // Obtiene la config de forma segura

  // Activa el orquestador de tracking para asegurar que los scripts (webvork.js) se carguen
  useProducerLogic();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(OrderFormSchema),
  });

  const onSubmit: SubmitHandler<OrderFormData> = (data) => {
    logger.success(
      "[OrderForm] Validación del cliente exitosa. Procediendo con el envío nativo del formulario...",
      { action: producerConfig.ACTION_URL, data }
    );
    // Permite que el evento de submit nativo del <form> continúe
    formRef.current?.submit();
  };

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      action={producerConfig.ACTION_URL}
      method="POST"
      className="space-y-4 wv_order-form"
      noValidate
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fieldVariants}>
        <FormInput
          id="name"
          label={content.nameInputLabel}
          icon="User"
          placeholder={content.nameInputPlaceholder}
          {...register("name")}
          error={errors.name?.message}
          aria-invalid={!!errors.name}
          autoComplete="name"
        />
      </motion.div>

      <motion.div variants={fieldVariants}>
        <FormInput
          id="phone"
          label={content.phoneInputLabel}
          icon="Phone"
          type="tel"
          placeholder={content.phoneInputPlaceholder}
          {...register("phone")}
          error={errors.phone?.message}
          aria-invalid={!!errors.phone}
          autoComplete="tel"
        />
      </motion.div>

      <HiddenFormFields />

      <motion.div variants={fieldVariants} className="!mt-6 pt-2">
        <Button
          type="submit"
          size="lg"
          variant="default"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <DynamicIcon
              name="LoaderCircle"
              className="mr-2 h-4 w-4 animate-spin"
            />
          )}
          {isSubmitting
            ? content.submitButtonLoadingText
            : content.submitButtonText}
        </Button>
      </motion.div>
    </motion.form>
  );
}
