// RUTA: src/components/features/campaign-suite/TemplateBrowser/_components/TemplateCard.tsx
/**
 * @file TemplateCard.tsx
 * @description Componente de presentación atómico para una tarjeta de plantilla.
 * @version 1.1.0 (Data Contract Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui";
import type { CampaignTemplate } from "@/shared/lib/schemas/campaigns/template.schema";

interface TemplateCardProps {
  template: CampaignTemplate;
  onSelect: () => void;
  isPending: boolean;
}

export function TemplateCard({
  template,
  onSelect,
  isPending,
}: TemplateCardProps) {
  const formattedDate = new Date(template.createdAt).toLocaleDateString();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -5,
        boxShadow: "0 8px 25px hsla(var(--primary-rgb), 0.1)",
      }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>
            {template.description || "Sin descripción."}
          </CardDescription>
        </CardHeader>
        <div className="flex-grow p-6 pt-0 text-sm text-muted-foreground">
          Creada: {formattedDate}
        </div>
        <CardFooter>
          <Button onClick={onSelect} disabled={isPending} className="w-full">
            {isPending ? (
              <DynamicIcon
                name="LoaderCircle"
                className="mr-2 h-4 w-4 animate-spin"
              />
            ) : (
              <DynamicIcon name="Wand" className="mr-2 h-4 w-4" />
            )}
            Usar esta Plantilla
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
