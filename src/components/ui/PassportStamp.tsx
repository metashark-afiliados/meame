// components/ui/PassportStamp.tsx
/**
 * @file PassportStamp.tsx
 * @description Componente de animación MEA/UX que simula un sello de pasaporte
 *              para celebrar la finalización exitosa de un paso.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "./DynamicIcon";
import { logger } from "@/shared/lib/logging";

interface PassportStampProps {
  label: string;
}

const stampVariants = {
  hidden: { scale: 1.8, opacity: 0, rotate: -25 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 10, // Un ligero ángulo para un look más natural
    transition: { type: "spring", stiffness: 260, damping: 15, delay: 0.2 },
  },
} as const;

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.5 },
  },
} as const;

export function PassportStamp({
  label,
}: PassportStampProps): React.ReactElement {
  logger.trace("[PassportStamp] Renderizando animación MEA/UX (v1.0).");

  return (
    <div
      className="flex flex-col items-center justify-center p-8"
      aria-live="polite"
      aria-label={label}
    >
      <motion.div
        variants={stampVariants}
        initial="hidden"
        animate="visible"
        className="relative w-32 h-32 flex items-center justify-center"
      >
        <DynamicIcon
          name="CircleCheckBig"
          className="w-full h-full text-green-500 opacity-80"
        />
      </motion.div>
      <motion.p
        variants={textVariants}
        initial="hidden"
        animate="visible"
        className="mt-4 text-lg font-semibold text-foreground"
      >
        {label}
      </motion.p>
    </div>
  );
}
// components/ui/PassportStamp.tsx
