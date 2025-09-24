// RUTA: app/[locale]/notifications/page.tsx
/**
 * @file page.tsx
 * @description Página de historial completo de notificaciones del usuario.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
// ... (imports de Supabase, redirect, etc.) ...
import { getNotificationsAction } from "@/shared/lib/actions/notifications/getNotifications.action";

async function getAllNotifications() {
  // En un futuro, esta acción se modificaría para soportar paginación.
  return await getNotificationsAction();
}

export default async function NotificationsPage(): Promise<React.ReactElement> {
  const { data: user } = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const result = await getAllNotifications();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Todas las Notificaciones</h1>
        <p className="text-muted-foreground mt-1">
          Un registro de todas las actividades importantes de tu cuenta.
        </p>
      </header>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {result.success && result.data.length > 0 ? (
              result.data.map((notification) => (
                <li key={notification.id} className="flex items-start gap-4 p-4">
                  {/* ... Renderizado detallado de cada notificación ... */}
                </li>
              ))
            ) : (
              <li className="p-8 text-center text-muted-foreground">
                Tu historial de notificaciones está vacío.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
