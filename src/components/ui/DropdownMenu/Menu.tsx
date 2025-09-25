// RUTA: src/components/ui/DropdownMenu/Menu.tsx
/**
 * @file Menu.tsx
 * @description Componente principal y proveedor de estado para el sistema DropdownMenu.
 *              v6.0.0 (Controlled/Uncontrolled Pattern): Evolucionado para soportar
 *              tanto el modo controlado (props `open`/`onOpenChange`) como el no
 *              controlado (estado interno), para una flexibilidad de élite.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import * as React from "react";
import { DropdownMenuContext } from "./Context";
import { logger } from "@/shared/lib/logging";

interface MenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Menu = ({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: MenuProps): React.ReactElement => {
  logger.trace("[DropdownMenu.Provider] Renderizando v6.0.");

  const [internalOpen, setInternalOpen] = React.useState(false);

  // Determina si el componente está controlado o no.
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;

  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

  const contextValue = React.useMemo(() => ({ isOpen, setIsOpen }), [isOpen, setIsOpen]);

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};
