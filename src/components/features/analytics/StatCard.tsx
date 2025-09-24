// RUTA: components/features/analytics/StatCard.tsx
/**
 * @file StatCard.tsx
 * @description Componente atómico de UI para mostrar un KPI individual.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { LucideIconName } import { LucideIconNameSchema } from "@/shared/lib/config/lucide-icon-names";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIconName;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <DynamicIcon name={icon} className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
