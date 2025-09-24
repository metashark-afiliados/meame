// RUTA: src/components/features/analytics/CampaignsTable.columns.tsx
/**
 * @file CampaignsTable.columns.tsx
 * @description SSoT para las definiciones de las columnas de la tabla de analíticas.
 * @version 4.0.0 (Rules of Hooks & i18n Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";

// Componente atómico para la celda de acciones que puede usar hooks
const ActionsCell = ({ row }: { row: any }) => {
  const campaign = row.original as CampaignAnalyticsData;
  const pathname = usePathname();
  const locale = getCurrentLocaleFromPathname(pathname);

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
};

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
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];
