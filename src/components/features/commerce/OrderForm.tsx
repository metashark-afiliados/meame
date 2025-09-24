// Ruta correcta: src/components/features/commerce/OrderForm.tsx
/**
 * @file OrderForm.tsx
 * @description Formulario de pedido final, refactorizado para replicar 100%
 *              la funcionalidad de sumisión del productor (Webvork). Utiliza
 *              validación de cliente para una UX de élite, pero realiza un
 *              envío POST tradicional al endpoint del afiliado.
 * @version 7.0.0 (Holistic Integrity Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { producerConfig } from "@/shared/lib/config/producer.config";
import { logger } from "@/shared/lib/logging";
import { useProducerLogic } from "@/shared/hooks/use-producer-logic";
import { HiddenFormFields } from "./HiddenFormFields";
import { FormInput } from "@/components/ui/FormInput";
import { Button, DynamicIcon } from "@/components/ui";

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

export function OrderForm({ content }: OrderFormProps): React.ReactElement {
  logger.info("[OrderForm] Renderizando v7.0 (Holistic Integrity Restoration)");
  const formRef = useRef<HTMLFormElement>(null);

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
    formRef.current?.submit();
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      action={producerConfig.ACTION_URL}
      method="POST"
      className="space-y-4 wv_order-form"
      noValidate
    >
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

      <HiddenFormFields />

      <Button
        type="submit"
        size="lg"
        // ANTERIOR: variant="accent"
        // NUEVO: Se utiliza la variante 'default' que representa la acción primaria.
        variant="default"
        className="w-full !mt-6"
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
    </form>
  );
}
// Ruta correcta: src/components/features/commerce/OrderForm.tsx
