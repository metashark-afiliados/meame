// RUTA: app/[locale]/(dev)/nos3/_components/SessionListClient.tsx
/**
 * @file SessionListClient.tsx
 * @description Componente de cliente para mostrar la lista de sesiones grabadas, ahora internacionalizada.
 * @version 2.0.0 (Full i18n Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { SessionMetadata } from "../_actions/list-sessions.action";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

type SessionListContent = NonNullable<Dictionary["nos3Dashboard"]>;

interface SessionListClientProps {
  sessions: SessionMetadata[];
  content: Pick<
    SessionListContent,
    | "tableHeaders"
    | "reproduceButton"
    | "emptyStateTitle"
    | "emptyStateDescription"
  >;
  locale: Locale; // Recibir locale para formato de fecha
}

export function SessionListClient({
  sessions,
  content,
  locale,
}: SessionListClientProps): React.ReactElement {
  logger.info("[SessionListClient] Renderizando v2.0 (Full i18n).");
  const pathname = usePathname();

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <DynamicIcon name="VideoOff" className="h-12 w-12 mx-auto mb-4" />
        <h3 className="font-semibold text-lg text-foreground">
          {content.emptyStateTitle} {/* Consume i18n */}
        </h3>
        <p className="text-sm">{content.emptyStateDescription}</p>{" "}
        {/* Consume i18n */}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{content.tableHeaders.sessionId}</TableHead>{" "}
          {/* Consume i18n */}
          <TableHead>{content.tableHeaders.startTime}</TableHead>{" "}
          {/* Consume i18n */}
          <TableHead className="text-right">
            {content.tableHeaders.actions}
          </TableHead>{" "}
          {/* Consume i18n */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map(({ sessionId, startTime }) => (
          <TableRow key={sessionId}>
            <TableCell className="font-mono text-xs">{sessionId}</TableCell>
            <TableCell>
              {new Date(startTime).toLocaleString(locale, {
                // Usa locale para formato
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link href={`${pathname}/${sessionId}`}>
                  <DynamicIcon name="Play" className="mr-2 h-4 w-4" />
                  {content.reproduceButton} {/* Consume i18n */}
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
