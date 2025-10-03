// _docs/supabase/001_MANIFIESTO_TABLA_PROFILES.md
/**
 * @file 001_MANIFIESTO_TABLA_PROFILES.md
 * @description Manifiesto Canónico y SSoT para la tabla 'public.profiles',
 *              ahora con soporte para múltiples proveedores de identidad.
 * @version 2.0.0 (Multi-Provider Identity)
 * @author L.I.A. Legacy
 */

# Manifiesto de Tabla Soberana: `public.profiles` v2.0

## 1. Visión y Propósito

Esta tabla es la extensión soberana de la entidad `auth.users`. Almacena metadatos de aplicación que definen la identidad de un usuario en nuestro ecosistema, unificando perfiles de múltiples proveedores de autenticación (OAuth, email, etc.).

**Principio Raíz:** Por cada registro en `auth.users`, debe existir uno y solo un registro correspondiente en `public.profiles`. El email es el ancla que unifica la identidad.

## 2. Definición de Schema (DDL)

```sql
-- Sentencia para aplicar los cambios a la tabla existente
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS provider_avatar_url TEXT;

-- Definición completa de la tabla para referencia
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    last_sign_in_at TIMESTAMPTZ,
    last_sign_in_ip TEXT,
    last_sign_in_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    provider_name TEXT, -- Ej: 'google', 'email'
    provider_avatar_url TEXT -- URL original del avatar del proveedor
);

COMMENT ON TABLE public.profiles IS 'Almacena datos de perfil de aplicación para los usuarios, unificando múltiples proveedores de identidad.';
COMMENT ON COLUMN public.profiles.id IS 'Referencia inmutable al usuario en auth.users. Clave primaria y foránea.';
COMMENT ON COLUMN public.profiles.provider_name IS 'El último proveedor que actualizó los datos del perfil (ej. google, email).';
COMMENT ON COLUMN public.profiles.provider_avatar_url IS 'La URL del avatar original obtenida del proveedor de OAuth.';

---

