// components/ui/DropdownMenu/Separator.tsx
/**
 * @file Separator.tsx
 * @description Componente visual para una línea divisoria dentro del menú.
 * @version 5.1.0 (Code Hygiene Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { logger } from "@/shared/lib/logging";

export const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  logger.trace("[Observabilidad] Renderizando DropdownMenu.Separator");
  return (
    <div
      ref={ref}
      className={twMerge("my-1 h-px bg-border", className)}
      role="separator"
      {...props}
    />
  );
});
Separator.displayName = "DropdownMenuSeparator";
