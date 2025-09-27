// RUTA: src/components/ui/Collapsible.tsx
/**
 * @file Collapsible.tsx
 * @description Sistema de componentes de élite para contenido expandible/colapsable.
 *              Basado en las primitivas de Radix UI para una accesibilidad robusta
 *              e inyectado con MEA/UX a través de animaciones de `tailwindcss-animate`.
 * @version 2.0.0 (Elite Leveling & MEA/UX Injection)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { logger } from "@/shared/lib/logging";
import { cn } from "@/shared/lib/utils/cn";

/**
 * @component Collapsible
 * @description El componente raíz que provee el contexto de estado.
 */
const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>
>(({ ...props }, ref) => {
  logger.trace("[Collapsible] Renderizando proveedor de contexto.");
  return <CollapsiblePrimitive.Root ref={ref} {...props} />;
});
Collapsible.displayName = CollapsiblePrimitive.Root.displayName;

/**
 * @component CollapsibleTrigger
 * @description El elemento (generalmente un botón) que alterna el estado de visibilidad.
 */
const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ ...props }, ref) => {
  logger.trace("[CollapsibleTrigger] Renderizando activador.");
  return <CollapsiblePrimitive.Trigger ref={ref} {...props} />;
});
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

/**
 * @component CollapsibleContent
 * @description El contenedor para el contenido que será animado. Utiliza las
 *              animaciones `collapsible-down` y `collapsible-up` definidas
 *              en nuestro `tailwind.config.ts` y `globals.css`.
 */
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => {
  logger.trace("[CollapsibleContent] Renderizando contenido animado.");
  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    />
  );
});
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
