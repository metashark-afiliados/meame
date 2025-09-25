// RUTA: app/[locale]/(dev)/dev/campaign-suite/_components/Step0_Identity/_components/PassportStamp.tsx
/**
 * @file PassportStamp.tsx
 * @description Aparato de UI atómico para la animación del sello de pasaporte (MEA/UX).
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React from "react";
import { motion } from "framer-motion";

interface PassportStampProps {
  isStamped: boolean;
}

export function PassportStamp({
  isStamped,
}: PassportStampProps): React.ReactElement {
  // Las variantes de Framer Motion definen los estados de la animación
  const stampVariants = {
    hidden: { scale: 1.5, opacity: 0, rotate: -30 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: -12, // Una ligera rotación para un aspecto más natural
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 0.1,
      },
    },
  };

  return (
    <motion.div
      aria-hidden="true"
      variants={stampVariants}
      initial="hidden"
      animate={isStamped ? "visible" : "hidden"}
      className="absolute bottom-4 right-4 z-10 pointer-events-none"
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 24 24"
        className="text-green-500/80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7.5 12.5L10.5 15.5L16.5 9.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="12"
          y="6.5"
          fontFamily="monospace"
          fontSize="2.5"
          textAnchor="middle"
          fill="currentColor"
        >
          APPROVED
        </text>
        <text
          x="12"
          y="20"
          fontFamily="monospace"
          fontSize="2.5"
          textAnchor="middle"
          fill="currentColor"
        >
          SDC-v4
        </text>
      </svg>
    </motion.div>
  );
}
