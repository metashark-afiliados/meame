-- scripts/supabase/migrations/YYYYMMDDHHMMSS_create_razprompts_entries_table.sql
-- (Reemplaza YYYYMMDDHHMMSS con la marca de tiempo actual, ej. 20250928053500)

-- Habilitar la extensión uuid-ossp si aún no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: razprompts_entries
-- Almacena los "genomas creativos" (prompts) con sus metadatos y versiones.
CREATE TABLE public.razprompts_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending_generation' CHECK (status IN ('pending_generation', 'generated', 'archived')),
  ai_service text NOT NULL,
  keywords text[] NOT NULL DEFAULT ARRAY[]::text[], -- Array de texto para palabras clave
  versions jsonb NOT NULL, -- JSONB para almacenar el array de PromptVersionSchema
  tags jsonb NOT NULL,     -- JSONB para almacenar RaZPromptsSesaTagsSchema
  bavi_asset_ids text[] DEFAULT ARRAY[]::text[], -- Array de texto para múltiples IDs de activos BAVI
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para mejorar el rendimiento de las búsquedas
CREATE INDEX idx_razprompts_user_id ON public.razprompts_entries (user_id);
CREATE INDEX idx_razprompts_workspace_id ON public.razprompts_entries (workspace_id);
CREATE INDEX idx_razprompts_status ON public.razprompts_entries (status);
-- Índice GIN para búsquedas eficientes en la columna keywords (si se usa mucho)
CREATE INDEX idx_razprompts_keywords ON public.razprompts_entries USING GIN (keywords);
-- Índice GIN para búsquedas eficientes en la columna jsonb (tags y versions)
CREATE INDEX idx_razprompts_tags ON public.razprompts_entries USING GIN (tags);
CREATE INDEX idx_razprompts_versions ON public.razprompts_entries USING GIN (versions);


-- Habilitar Row Level Security (RLS)
ALTER TABLE public.razprompts_entries ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para razprompts_entries
-- (Se asume la existencia de la función public.is_workspace_member en Supabase)

-- Política de lectura: Los miembros del workspace pueden ver las entradas de prompt
CREATE POLICY "Los miembros del workspace pueden ver las entradas de prompt"
ON public.razprompts_entries
FOR SELECT
USING (public.is_workspace_member(workspace_id));

-- Política de inserción: Los miembros del workspace pueden crear entradas de prompt
CREATE POLICY "Los miembros del workspace pueden crear entradas de prompt"
ON public.razprompts_entries
FOR INSERT
WITH CHECK (public.is_workspace_member(workspace_id));

-- Política de actualización: Los miembros del workspace pueden actualizar sus entradas de prompt
CREATE POLICY "Los miembros del workspace pueden actualizar sus entradas de prompt"
ON public.razprompts_entries
FOR UPDATE
USING (public.is_workspace_member(workspace_id));

-- Política de eliminación: Los miembros del workspace pueden eliminar sus entradas de prompt
CREATE POLICY "Los miembros del workspace pueden eliminar sus entradas de prompt"
ON public.razprompts_entries
FOR DELETE
USING (public.is_workspace_member(workspace_id));
