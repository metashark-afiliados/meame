// RUTA: shared/lib/hooks/use-auth.ts
/**
 * @file use-auth.ts
 * @description Hook de cliente de élite para gestionar y proveer el estado de
 *              autenticación de Supabase en tiempo real.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Cargar el estado inicial de la sesión al montar el hook
    async function getInitialSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    }

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return { user, isLoading };
}
