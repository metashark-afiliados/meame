// RUTA: components/features/analytics/CampaignsTable.columns.tsx
/**
 * @file CampaignsTable.columns.tsx
 * @description SSoT para las definiciones de las columnas de la tabla de analíticas.
 * @version 3.0.0 (Corregido y Nivelado)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui";
import type { CampaignAnalyticsData } from "@/shared/lib/schemas/analytics/campaign-analytics.schema";

export const columns: ColumnDef<CampaignAnalyticsData>[] = [
  {
    accessorKey: "variantName",
    header: "Variante",
  },
  {
    accessorKey: "summary.totalVisitors",
    header: "Visitantes",
  },
  {
    accessorKey: "summary.conversions",
    header: "Conversiones",
  },
  {
    accessorKey: "summary.bounceRate",
    header: "Tasa de Rebote",
    cell: ({ row }) => `${row.original.summary.bounceRate}%`,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const campaign = row.original;
      const locale = useLocale();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <DynamicIcon name="MoreHorizontal" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/analytics/${campaign.variantId}`}>
                Ver detalles
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
