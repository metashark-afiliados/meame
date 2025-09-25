// RUTA: src/components/features/notifications/NotificationBell.tsx
/**
 * @file NotificationBell.tsx
 * @description Componente de cliente interactivo para las notificaciones del header.
 * @version 4.0.0 (Sovereign Content Contract)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Skeleton } from "@/components/ui/Skeleton";
import { logger } from "@/shared/lib/logging";
import { getNotificationsAction } from "@/shared/lib/actions/notifications/getNotifications.action";
import { markNotificationsAsReadAction } from "@/shared/lib/actions/notifications/markNotificationsAsRead.action";
import type { Notification } from "@/shared/lib/types/notifications.types";
import type { LucideIconName } from "@/shared/lib/config/lucide-icon-names";
import type { NotificationBellContentSchema } from "@/shared/lib/schemas/components/notifications.schema";
import type { z } from "zod";

type Content = z.infer<typeof NotificationBellContentSchema>;

interface NotificationBellProps {
  content: Content;
}

const iconMap: Record<Notification["type"], LucideIconName> = {
  info: "Info",
  success: "CircleCheck",
  warning: "TriangleAlert",
  error: "CircleX",
};

export function NotificationBell({ content }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      const result = await getNotificationsAction();
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter((n) => !n.is_read).length);
      } else {
        logger.error("Fallo al obtener notificaciones", {
          error: result.error,
        });
      }
      setIsLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleOpenChange = (openState: boolean) => {
    setIsOpen(openState);
    if (openState && unreadCount > 0) {
      const currentUnread = unreadCount;
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      markNotificationsAsReadAction().then((result) => {
        if (!result.success) {
          setUnreadCount(currentUnread);
        }
      });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <DynamicIcon name="Bell" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">{content.notificationsLabel}</span>
        </Button>
      </DropdownMenuTrigger>
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
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <DynamicIcon
                name={iconMap[notification.type]}
                className="h-5 w-5 mt-1 text-muted-foreground"
              />
              <div className="flex-grow">
                <p className="text-sm font-medium text-foreground">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
