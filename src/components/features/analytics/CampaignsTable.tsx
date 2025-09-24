// components/features/analytics/CampaignsTable.tsx
/**
 * @file CampaignsTable.tsx
 * @description Tabla de datos interactiva para mostrar las analíticas de campaña.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import type { CampaignAnalyticsData } from "@/shared/lib/schemas/analytics/campaign-analytics.schema";

// Asumimos que las columnas están definidas en otro archivo, como se indica en el snapshot.
// Por ahora, crearemos una versión simple aquí.
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
];

interface CampaignsTableProps {
  data: CampaignAnalyticsData[];
}

export function CampaignsTable({ data }: CampaignsTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
// components/features/analytics/CampaignsTable.tsx
