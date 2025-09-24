// RUTA: components/layout/PageHeader.tsx
/**
 * @file PageHeader.tsx
 * @description Componente de élite para encabezados de página. Orquesta una
 *              animación de entrada y es 100% data-driven y resiliente.
 * @version 3.0.0 (Holistic Elite Leveling & MEA/UX Injection)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { LightRays } from "@/components/razBits/LightRays/LightRays";
import { logger } from "@/shared/lib/logging";
import { DeveloperErrorDisplay } from "@/components/dev";
import type { PageHeaderContentSchema } from "@/shared/lib/schemas/components/page-header.schema";
import type { z } from "zod";

// --- SSoT de Tipos ---
type PageHeaderContent = z.infer<typeof PageHeaderContentSchema>;

/**
 * @interface PageHeaderProps
 * @description Contrato de props para el componente PageHeader. Es 100%
 *              data-driven, consumiendo un único objeto de contenido.
 */
export interface PageHeaderProps {
  content?: PageHeaderContent; // Prop hecha opcional para la guardia de resiliencia.
}

// --- SSoT de Animaciones (MEA/UX) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 15, stiffness: 100 },
  },
};

/**
 * @component PageHeader
 * @description Renderiza la sección de cabecera principal de una página. Es
 *              resiliente a la falta de contenido y presenta una animación de entrada.
 * @param {PageHeaderProps} props - Las propiedades del componente.
 * @returns {React.ReactElement} El elemento JSX del encabezado.
 */
export function PageHeader({ content }: PageHeaderProps): React.ReactElement {
  // --- Pilar III: Guardia de Resiliencia y Observabilidad ---
  if (!content) {
    const errorMessage =
      "Componente 'PageHeader' renderizado sin la prop 'content' requerida. El contrato de la API no se está cumpliendo en el componente padre.";
    logger.error(`[PageHeader] ${errorMessage}`);

    // En desarrollo, mostramos un error claro para facilitar la depuración.
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="PageHeader"
          errorMessage={errorMessage}
          errorDetails="Asegúrate de que la página que llama a <PageHeader /> esté pasando la prop 'content' con el formato correcto, derivado de 'page-header.schema.ts'."
        />
      );
    }
    return <></>; // En producción, falla silenciosamente para no romper la UI.
  }

  logger.info("[PageHeader] Renderizando v3.0 (Elite & MEA).");
  const { title, subtitle, lightRays } = content;

  return (
    <div className="relative bg-muted/20 py-24 sm:py-32 text-center overflow-hidden">
      {lightRays && (
        <LightRays
          config={lightRays}
          className="absolute inset-0 z-0 opacity-20"
        />
      )}
      <Container className="relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold tracking-tight text-primary sm:text-5xl"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </Container>
    </div>
  );
}
