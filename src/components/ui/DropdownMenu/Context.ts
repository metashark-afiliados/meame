// RUTA: components/ui/DropdownMenu/Context.ts
/**
 * @file Context.ts
 * @description Define el Contexto de React y el hook personalizado para el sistema DropdownMenu.
 *              Esta es la SSoT para la gestión del estado compartido (abierto/cerrado) del menú.
 *              Cumple con la Directiva 003 de Calidad de Componentes.
 * @version 3.1.0 (Client Component Directive)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import * as React from "react";
import { logger } from "@/shared/lib/logging";

/**
 * @interface DropdownMenuContextType
 * @description El contrato de datos para el estado y las acciones compartidas
 *              dentro del ecosistema DropdownMenu.
 */
interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * @const DropdownMenuContext
 * @description El Contexto de React que transportará el estado del menú.
 */
export const DropdownMenuContext =
  React.createContext<DropdownMenuContextType | null>(null);

/**
 * @hook useDropdownMenuContext
 * @description Hook soberano para acceder al estado del DropdownMenu. Lanza un error
 *              de arquitectura si se usa fuera de un proveedor, garantizando una
 *              composición de componentes correcta y previniendo errores de runtime.
 * @returns {DropdownMenuContextType} El contexto del menú.
 */
export const useDropdownMenuContext = (): DropdownMenuContextType => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    const errorMsg =
      "Error de Arquitectura: Los componentes de DropdownMenu deben usarse dentro de un <DropdownMenu.Menu>";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  return context;
};
