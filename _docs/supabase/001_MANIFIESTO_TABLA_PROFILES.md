// _docs/supabase/001_MANIFIESTO_TABLA_PROFILES.md
/**
 * @file 001_MANIFIESTO_TABLA_PROFILES.md
 * @description Manifiesto Canónico y SSoT para la tabla 'public.profiles'.
 *              Define la arquitectura, relaciones, triggers y políticas de RLS.
 * @version 1.0.0
 * @author L.I.A. Legacy
 */

# Manifiesto de Tabla Soberana: `public.profiles`

## 1. Visión y Propósito
Esta tabla es la extensión soberana de la entidad `auth.users`. Almacena metadatos públicos y de aplicación que no pertenecen al ámbito de la autenticación.

**Principio Raíz:** Por cada registro en `auth.users`, debe existir uno y solo un registro correspondiente en `public.profiles`.

## 2. Definición de Schema (DDL)

```sql
-- Tabla: public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    last_sign_in_at TIMESTAMPTZ,
    last_sign_in_ip TEXT,
    last_sign_in_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Almacena datos de perfil público para los usuarios.';
COMMENT ON COLUMN public.profiles.user_id IS 'Referencia inmutable al usuario en auth.users.';
3. Automatización y Sincronización (Triggers y Funciones)
Creación Automática de Perfil:
Función: public.handle_new_user()
Trigger: Se dispara AFTER INSERT en auth.users.
Lógica: Inserta una nueva fila en public.profiles, estableciendo el user_id y full_name iniciales, garantizando la relación 1:1 desde el momento de la creación del usuario.
Actualización de Timestamp:
Función: public.handle_profile_update()
Trigger: Se dispara BEFORE UPDATE en public.profiles.
Lógica: Actualiza automáticamente la columna updated_at a la hora actual en cada modificación.
Sincronización de Último Inicio de Sesión:
Función: public.sync_last_sign_in()
Trigger: Se dispara AFTER UPDATE en auth.users.
Lógica: Si el campo last_sign_in_at en auth.users cambia, la función update_user_last_sign_in es llamada para copiar este timestamp y la IP del usuario al perfil correspondiente.
4. Políticas de Seguridad a Nivel de Fila (RLS)
Users can view their own profile. (SELECT): Permite a un usuario autenticado leer únicamente su propia fila, basándose en la coincidencia de auth.uid() con la columna user_id.
Users can insert their own profile. (INSERT): Permite a un usuario autenticado insertar su propio perfil. La función handle_new_user maneja esto automáticamente.
Users can update their own profile. (UPDATE): Permite a un usuario autenticado actualizar únicamente su propia fila.
5. Sincronización con Schemas de Aplicación
Contrato: Los datos de esta tabla deben ser validados por el schema UpdateProfileSchema en src/shared/lib/schemas/account/account-forms.schema.ts antes de cualquier operación de escritura desde la aplicación.
---

