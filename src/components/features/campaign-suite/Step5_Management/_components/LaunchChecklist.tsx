// RUTA: src/components/features/campaign-suite/Step5_Management/_components/LaunchChecklist.tsx
/**
 * @file LaunchChecklist.tsx
 * @description Componente de UI atómico y gamificado para el checklist de pre-lanzamiento.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/components/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { ChecklistItem } from "@/shared/lib/utils/campaign-suite/draft.validator";
import { cn } from "@/shared/lib/utils/cn";

interface LaunchChecklistProps {
  items: ChecklistItem[];
  title: string;
}

export function LaunchChecklist({ items, title }: LaunchChecklistProps) {
  const completedCount = items.filter((item) => item.isCompleted).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-6 border rounded-lg bg-muted/20">
      <h3 className="font-semibold text-lg text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <TooltipProvider key={item.id} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-md"
                >
                  <DynamicIcon
                    name={item.isCompleted ? "CircleCheck" : "CircleX"}
                    className={cn(
                      "h-5 w-5",
                      item.isCompleted ? "text-green-500" : "text-amber-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      item.isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <div className="mt-4">
        <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-right mt-1 text-muted-foreground">
          {completedCount} de {totalCount} tareas completadas
        </p>
      </div>
    </div>
  );
}
