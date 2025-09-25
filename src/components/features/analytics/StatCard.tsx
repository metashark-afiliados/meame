// RUTA: src/components/features/analytics/StatCard.tsx
/**
 * @file StatCard.tsx
 * @description Componente atómico de UI para mostrar un KPI individual con MEA/UX.
 * @version 2.0.0 (Holistic Elite Leveling & MEA/UX Injection)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
// --- [INICIO DE CORRECCIÓN DE SINTAXIS Y DEUDA TÉCNICA] ---
// Se corrige la importación malformada y se importa únicamente el tipo necesario.
import type { LucideIconName } from "@/shared/lib/config/lucide-icon-names";
// --- [FIN DE CORRECCIÓN DE SINTAXIS Y DEUDA TÉCNICA] ---
import { logger } from "@/shared/lib/logging";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIconName;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

export function StatCard({
  title,
  value,
  icon,
}: StatCardProps): React.ReactElement {
  logger.trace(`[StatCard] Renderizando v2.0 para: ${title}`);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, boxShadow: "0 8px 25px hsla(var(--primary-rgb), 0.1)" }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <DynamicIcon name={icon} className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
// RUTA: src/components/features/analytics/StatCard.tsx
