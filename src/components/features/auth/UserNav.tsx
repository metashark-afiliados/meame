// Ruta correcta: src/components/features/auth/UserNav.tsx
/**
 * @file UserNav.tsx
 * @description Componente para mostrar el estado del usuario y las acciones de sesión en el header.
 * @version 2.1.0 (Sovereign Path Restoration)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib/hooks/use-auth";
import { createClient } from "@/shared/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { logger } from "@/shared/lib/logging";
import type { UserNavContentSchema } from "@/shared/lib/schemas/components/auth/user-nav.schema";
import type { z } from "zod";

type Content = z.infer<typeof UserNavContentSchema>;

interface UserNavProps {
  content: Content;
}

export function UserNav({ content }: UserNavProps): React.ReactElement {
  logger.info("[UserNav] Renderizando v2.1 (Sovereign Path Restoration).");
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-24" />;
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">{content.loginButton}</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.user_metadata.avatar_url}
              alt={user.email ?? "User Avatar"}
            />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {content.sessionLabel}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          {content.logoutButton}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
