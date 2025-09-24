// RUTA: components/ui/DropdownMenu/Item.tsx
/**
 * @file Item.tsx
 * @description Componente para un item individual e interactivo dentro del DropdownMenu.
 * @version 5.2.0 (Elite Type Safety & A11y Fix)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { useDropdownMenuContext } from "./Context";
import { logger } from "@/shared/lib/logging";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ children, className, onClick, ...props }, ref) => {
    logger.trace("[DropdownMenu.Item] Renderizando item (v5.2).");
    const { setIsOpen } = useDropdownMenuContext();

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        onClick(event);
      }
      setIsOpen(false);
    };

    // --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
    // En lugar de una aserción 'any', simulamos un click nativo en el elemento
    // cuando se presiona Enter o Espacio. Esto es más seguro, accesible y
    // desencadena el manejador `onClick` de forma natural.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // Previene el scroll de la página en Espacio
        event.currentTarget.click(); // Dispara el evento onClick
      }
    };
    // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

    return (
      <div
        ref={ref}
        className={twMerge(
          "flex items-center px-4 py-2 text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground cursor-pointer transition-colors rounded-md",
          className
        )}
        role="menuitem"
        tabIndex={0} // Se hace enfocable para la navegación por teclado
        onClick={handleClick}
        onKeyDown={handleKeyDown} // Se usa el nuevo manejador seguro
        {...props}
      >
        {children}
      </div>
    );
  }
);
Item.displayName = "DropdownMenuItem";
