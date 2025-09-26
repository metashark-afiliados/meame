// RUTA: src/shared/hooks/use-notification-bell.ts
/**
 * @file use-notification-bell.ts
 * @description Hook "cerebro" soberano para la lógica del NotificationBell.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { getNotificationsAction } from "@/shared/lib/actions/notifications/getNotifications.action";
import { markNotificationsAsReadAction } from "@/shared/lib/actions/notifications/markNotificationsAsRead.action";
import type { Notification } from "@/shared/lib/types/notifications.types";
import { logger } from "@/shared/lib/logging";

export function useNotificationBell() {
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

  const handleOpenChange = useCallback(
    (openState: boolean) => {
      setIsOpen(openState);
      if (openState && unreadCount > 0) {
        const currentUnread = unreadCount;
        setUnreadCount(0);
        markNotificationsAsReadAction().then((result) => {
          if (!result.success) {
            logger.error("Fallo al marcar notificaciones como leídas.", {
              error: result.error,
            });
            setUnreadCount(currentUnread); // Revertir en caso de error
          }
        });
      }
    },
    [unreadCount]
  );

  return {
    isOpen,
    setIsOpen,
    notifications,
    unreadCount,
    isLoading,
    handleOpenChange,
  };
}
