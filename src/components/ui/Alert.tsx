// RUTA: components/ui/Alert.tsx
/**
 * @file Alert.tsx
 * @description Componente de alerta de élite, inyectado con MEA/UX.
 *              Muestra mensajes importantes con una animación de entrada sutil
 *              y un pulso visual para captar la atención del usuario.
 * @version 2.0.0 (MEA Injected & Elite Leveling)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils/cn";
import { logger } from "@/shared/lib/logging";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 pl-14 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const AlertComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => {
  logger.trace("[AlertComponent] Renderizando componente base de alerta.");
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
});
AlertComponent.displayName = "AlertComponent";

const AlertTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

/**
 * @hoc AnimatedAlert
 * @description High-Order Component que envuelve el Alert base con animación.
 *              Esta es la exportación pública y recomendada.
 */
const AnimatedAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => {
  logger.trace("[AnimatedAlert] Renderizando alerta con animación MEA/UX.");
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AlertComponent
        ref={ref}
        className={className}
        variant={variant}
        {...props}
      />
    </motion.div>
  );
});
AnimatedAlert.displayName = "Alert";

export { AnimatedAlert as Alert, AlertTitle, AlertDescription };
