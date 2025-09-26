// RUTA: src/components/features/notifications/NotificationBell/NotificationBell.tsx
/**
 * @file NotificationBell.tsx
 * @description Orquestador de la feature NotificationBell.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { useNotificationBell } from "@/shared/hooks/use-notification-bell";
import {
  NotificationBellTrigger,
  NotificationBellContent,
} from "./_components";
import type { z } from "zod";
import type { NotificationBellContentSchema } from "@/shared/lib/schemas/components/notifications.schema";

type Content = z.infer<typeof NotificationBellContentSchema>;

interface NotificationBellProps {
  content: Content;
}

export function NotificationBell({ content }: NotificationBellProps) {
  const { isOpen, handleOpenChange, notifications, unreadCount, isLoading } =
    useNotificationBell();

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <NotificationBellTrigger
        unreadCount={unreadCount}
        label={content.notificationsLabel}
      />
      <NotificationBellContent
        isLoading={isLoading}
        notifications={notifications}
        content={content}
      />
    </DropdownMenu>
  );
}
