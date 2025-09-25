// RUTA: src/components/features/cogniread/_components/ArticleList.tsx
/**
 * @file ArticleList.tsx
 * @description Componente de cliente para mostrar una tabla de artículos de CogniRead.
 * @version 3.0.0 (FSD Alignment & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import { routes } from "@/shared/lib/navigation";
import type { Locale } from "@/shared/lib/i18n/i18n.config";

interface ArticleListProps {
  articles: CogniReadArticle[];
  locale: Locale;
}

export function ArticleList({ articles, locale }: ArticleListProps) {
  const getStatusVariant = (status: CogniReadArticle["status"]) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (articles.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No se han encontrado análisis de estudios. ¡Crea el primero!
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estado</TableHead>
          <TableHead>Título del Estudio</TableHead>
          <TableHead>Última Actualización</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.articleId}>
            <TableCell>
              <Badge variant={getStatusVariant(article.status)}>
                {article.status}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              {article.studyDna.originalTitle}
            </TableCell>
            <TableCell>
              {new Date(article.updatedAt).toLocaleString(locale)}
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="ghost" size="sm">
                <Link
                  href={`${routes.cogniReadEditor.path({ locale })}?id=${article.articleId}`}
                >
                  <DynamicIcon name="Pencil" className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
