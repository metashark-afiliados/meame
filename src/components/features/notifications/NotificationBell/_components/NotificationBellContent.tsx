// RUTA: src/components/features/notifications/NotificationBell/_components/NotificationBellContent.tsx
/**
 * @file NotificationBellContent.tsx
 * @description Componente de UI puro para el contenido del dropdown de notificaciones.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import Link from "next/link";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Skeleton } from "@/components/ui/Skeleton";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/shared/lib/types/notifications.types";
import type { z } from "zod";
import type { NotificationBellContentSchema } from "@/shared/lib/schemas/components/notifications.schema";

type Content = z.infer<typeof NotificationBellContentSchema>;

interface NotificationBellContentProps {
  isLoading: boolean;
  notifications: Notification[];
  content: Content;
}

export function NotificationBellContent({
  isLoading,
  notifications,
  content,
}: NotificationBellContentProps) {
  return (
    <DropdownMenuContent align="end" className="w-96">
      <DropdownMenuLabel className="flex justify-between items-center">
        {content.notificationsLabel}
        <Link
          href="/notifications"
          className="text-xs font-normal text-muted-foreground hover:underline"
        >
          {content.viewAllNotificationsLink}
        </Link>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {isLoading ? (
        <div className="p-4 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : notifications.length === 0 ? (
        <p className="p-4 text-center text-sm text-muted-foreground">
          {content.noNotificationsText}
        </p>
      ) : (
        notifications
          .slice(0, 5)
          .map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
      )}
    </DropdownMenuContent>
  );
}
