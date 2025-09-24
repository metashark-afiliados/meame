// RUTA: components/layout/SectionAnimator.tsx
/**
 * @file SectionAnimator.tsx
 * @description Componente de cliente que orquesta la animación en cascada (stagger)
 *              de las secciones de una página.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

interface SectionAnimatorProps {
  children: React.ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export function SectionAnimator({ children }: SectionAnimatorProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
