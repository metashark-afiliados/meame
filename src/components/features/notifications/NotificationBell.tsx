// Ruta correcta: src/components/features/notifications/NotificationBell.tsx
/**
 * @file NotificationBell.tsx
 * @description Componente de cliente interactivo para las notificaciones del header,
 *              completamente funcional y nivelado a estándar de élite.
 * @version 3.0.0 (Full Functional Implementation)
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

// Este tipo debería vivir en un archivo de tipos de Supabase en el futuro
interface Notification {
  id: string;
  user_id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const iconMap: Record<Notification["type"], string> = {
  info: "Info",
  success: "CircleCheck",
  warning: "TriangleAlert",
  error: "CircleX",
};

export function NotificationBell() {
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

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && unreadCount > 0) {
      // UI Optimista
      const currentUnread = unreadCount;
      setUnreadCount(0);
      setNotifications(
        notifications.map((n) => ({ ...n, is_read: true }))
      );

      // Acción en segundo plano
      markNotificationsAsReadAction().then((result) => {
        if (!result.success) {
          // Revertir en caso de error
          logger.error("Fallo al marcar notificaciones como leídas", {
            error: result.error,
          });
          setUnreadCount(currentUnread);
          // Opcional: revertir el estado de `notifications`
        }
      });
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <DynamicIcon name="Bell" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">Abrir notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notificaciones
          <Link
            href="/notifications"
            className="text-xs font-normal text-muted-foreground hover:underline"
          >
            Ver todas
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
            No tienes notificaciones.
          </p>
        ) : (
          notifications.slice(0, 5).map((notification: Notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <DynamicIcon
                name={iconMap[notification.type] as any}
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
// Ruta correcta: src/components/features/notifications/NotificationBell.tsx
