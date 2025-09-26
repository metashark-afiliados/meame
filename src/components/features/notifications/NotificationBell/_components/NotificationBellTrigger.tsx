// RUTA: src/components/features/notifications/NotificationBell/_components/NotificationBellTrigger.tsx
/**
 * @file NotificationBellTrigger.tsx
 * @description Componente de UI puro para el botón activador del NotificationBell.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { motion } from "framer-motion";
import { DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

interface NotificationBellTriggerProps {
  unreadCount: number;
  label: string;
}

export function NotificationBellTrigger({
  unreadCount,
  label,
}: NotificationBellTriggerProps) {
  return (
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="relative">
        <DynamicIcon name="Bell" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute top-1 right-1 flex h-3 w-3"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </motion.span>
        )}
        <span className="sr-only">{label}</span>
      </Button>
    </DropdownMenuTrigger>
  );
}
