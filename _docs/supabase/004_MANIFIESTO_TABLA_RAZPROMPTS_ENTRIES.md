// _docs/supabase/004_MANIFIESTO_TABLA_RAZPROMPTS_ENTRIES.md
/**
 * @file 004_MANIFIESTO_TABLA_RAZPROMPTS_ENTRIES.md
 * @description Manifiesto Canónico y SSoT para la tabla 'public.razprompts_entries'.
 *              Define la arquitectura, relaciones y simbiosis con la BAVI.
 * @version 1.0.0
 * @author L.I.A. Legacy
 */

# Manifiesto de Tabla Soberana: `public.razprompts_entries`

## 1. Visión y Propósito
Esta tabla es la **Bóveda Genómica Creativa** del ecosistema. Cada fila representa el "genoma" de un activo visual: el prompt exacto, los parámetros y el modelo de IA que lo generaron.

**Principio Raíz:** Garantizar la reproducibilidad de la excelencia. Almacenando el genoma, podemos recrear, iterar y entender el origen de cada activo visual de alto rendimiento.

## 2. Definición de Schema (DDL)

```sql
-- Tabla: public.razprompts_entries
CREATE TABLE IF NOT EXISTS public.razprompts_entries (
    id TEXT PRIMARY KEY CHECK (id ~ '^c[a-z0-9]{24}$'), -- Valida formato CUID2
    user_id UUID NOT NULL REFERENCES auth.users(id),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_generation' CHECK (status IN ('pending_generation', 'generated', 'archived')),
    ai_service TEXT NOT NULL,
    keywords TEXT[],
    versions JSONB NOT NULL,
    tags JSONB,
    bavi_asset_ids TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.razprompts_entries IS 'Almacena el genoma creativo (prompts, parámetros) de los activos visuales.';
COMMENT ON COLUMN public.razprompts_entries.versions IS 'Historial inmutable de todas las versiones del prompt.';
3. Arquitectura de Datos y Justificación
Clave Primaria (id TEXT con CHECK): Al igual que en CogniRead, se utiliza un CUID2 generado por la aplicación como clave primaria para tener un identificador amigable y único.
Columnas JSONB (versions, tags): versions almacena un array de objetos, cada uno representando una iteración del prompt y sus parámetros, una estructura perfecta para JSONB. tags almacena la taxonomía SESA para un filtrado eficiente.
Columnas TEXT[] (keywords, bavi_asset_ids): Se utiliza para búsquedas de texto libre eficientes (keywords) y para mantener una lista de los activos BAVI generados a partir de este prompt (bavi_asset_ids).
4. Políticas de Seguridad a Nivel de Fila (RLS)
Gestión por Miembros del Workspace: Todas las políticas (SELECT, INSERT, UPDATE, DELETE) están gobernadas por la función is_workspace_member(workspace_id). Esto asegura que un usuario solo pueda ver y gestionar los prompts que pertenecen a los workspaces de los que es miembro, garantizando un aislamiento de datos completo entre diferentes equipos o clientes.
5. Sincronización con el Ecosistema BAVI (Simbiosis Inquebrantable)
Vínculo Bidireccional:
RaZPrompts -> BAVI: Cuando un activo se genera a partir de un prompt, el asset_id del nuevo activo en bavi_assets se añade al array bavi_asset_ids de esta tabla.
BAVI -> RaZPrompts: El registro en bavi_assets almacena el prompt_id (id de esta tabla) en su columna prompt_id.
Orquestación: Este proceso de vinculación es orquestado por la Server Action linkPromptToBaviAssetAction, que actualiza ambos registros de forma atómica después de que un activo ha sido generado y subido exitosamente.
Estado: La vinculación de un activo BAVI a un prompt cambia el status del prompt a 'generated'.
6. Sincronización con Schemas de Aplicación
Contrato: Los datos de esta tabla son validados por RaZPromptsEntrySchema en src/shared/lib/schemas/raz-prompts/entry.schema.ts. Las Server Actions createPromptEntryAction y getPromptsAction son responsables de asegurar este cumplimiento de contrato entre la base de datos y la aplicación.
---

