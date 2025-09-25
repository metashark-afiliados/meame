// RUTA: src/components/ui/DropdownMenu/Item.tsx
/**
 * @file Item.tsx
 * @description Componente para un item individual e interactivo dentro del DropdownMenu.
 *              v6.0.0 (Polymorphic Elite Compliance): Implementa el patrón `asChild`
 *              utilizando @radix-ui/react-slot para una flexibilidad y seguridad de
 *              tipos de nivel de élite. Resuelve el error crítico TS2322.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { twMerge } from "tailwind-merge";
import { useDropdownMenuContext } from "./Context";
import { logger } from "@/shared/lib/logging";

interface ItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export const Item = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ children, className, onClick, asChild = false, ...props }, ref) => {
    logger.trace("[DropdownMenu.Item] Renderizando item polimórfico (v6.0).");
    const { setIsOpen } = useDropdownMenuContext();

    const Comp = asChild ? Slot : "button";

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(event);
      }
      setIsOpen(false);
    };

    return (
      <Comp
        ref={ref}
        type="button" // Necesario para la semántica
        role="menuitem"
        className={twMerge(
          "w-full text-left flex items-center px-4 py-2 text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground cursor-pointer transition-colors rounded-md focus:outline-none focus:bg-muted/50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Item.displayName = "DropdownMenuItem";
// RUTA: src/components/ui/DropdownMenu/Item.tsx
