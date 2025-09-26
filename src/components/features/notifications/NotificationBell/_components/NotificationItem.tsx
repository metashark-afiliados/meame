// RUTA: src/components/features/notifications/NotificationBell/_components/NotificationItem.tsx
/**
 * @file NotificationItem.tsx
 * @description Componente de UI atómico para una fila de notificación.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { Notification } from "@/shared/lib/types/notifications.types";
import type { LucideIconName } from "@/shared/lib/config/lucide-icon-names";

const iconMap: Record<Notification["type"], LucideIconName> = {
  info: "Info",
  success: "CircleCheck",
  warning: "TriangleAlert",
  error: "CircleX",
};

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
      <DynamicIcon
        name={iconMap[notification.type]}
        className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0"
      />
      <div className="flex-grow">
        <p className="text-sm font-medium text-foreground whitespace-normal">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>
    </DropdownMenuItem>
  );
}
