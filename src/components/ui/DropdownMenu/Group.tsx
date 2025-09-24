// components/ui/DropdownMenu/Group.tsx
/**
 * @file Group.tsx
 * @description Componente de agrupación semántica para items de menú.
 * @version 5.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";
import * as React from "react";
import { twMerge } from "tailwind-merge";
interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
export const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  ({ children, className, ...props }, ref) => {
    console.log("[Observabilidad] Renderizando DropdownMenu.Group");
    return (
      <div ref={ref} className={twMerge(className)} role="group" {...props}>
        {children}
      </div>
    );
  }
);
Group.displayName = "DropdownMenuGroup";
// components/ui/DropdownMenu/Group.tsx
