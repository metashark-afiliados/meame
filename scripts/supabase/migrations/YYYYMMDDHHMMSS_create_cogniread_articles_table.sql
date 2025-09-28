-- scripts/supabase/migrations/YYYYMMDDHHMMSS_create_cogniread_articles_table.sql
-- (Reemplaza YYYYMMDDHHMMSS con la marca de tiempo actual, ej. 20250928060500)

-- Habilitar la extensión uuid-ossp si aún no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: cogniread_articles
-- Almacena los artículos de CogniRead con su ADN de estudio y contenido multilingüe.
CREATE TABLE public.cogniread_articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  study_dna jsonb NOT NULL,  -- JSONB para el objeto StudyDnaSchema
  content jsonb NOT NULL,   -- JSONB para el objeto de contenido multilingüe
  bavi_hero_image_id text,  -- ID del activo BAVI para la imagen destacada (opcional)
  related_prompt_ids text[] DEFAULT ARRAY[]::text[], -- IDs de prompts relacionados (opcional)
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para mejorar el rendimiento de las búsquedas
CREATE INDEX idx_cogniread_articles_status ON public.cogniread_articles (status);
-- Índice GIN para búsquedas eficientes en la columna jsonb (study_dna y content)
CREATE INDEX idx_cogniread_articles_study_dna ON public.cogniread_articles USING GIN (study_dna);
CREATE INDEX idx_cogniread_articles_content ON public.cogniread_articles USING GIN (content);
-- Índice para búsqueda por slug dentro del JSONB content (si se busca mucho)
-- NOTA: Esto asume un locale específico, necesitarías un índice por cada locale si buscas por slug individualmente.
-- Por ejemplo, para buscar por slug en es-ES:
-- CREATE INDEX idx_cogniread_articles_content_es_slug ON public.cogniread_articles ((content->'es-ES'->>'slug'));


-- Habilitar Row Level Security (RLS)
ALTER TABLE public.cogniread_articles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para cogniread_articles

-- Política de lectura: Permitir acceso de lectura a todos los artículos (públicos y admin)
CREATE POLICY "Public articles are viewable by everyone"
ON public.cogniread_articles
FOR SELECT
USING (true);

-- Política de inserción: Permitir que los Service Role Key o usuarios autorizados inserten artículos
-- NOTA: Estas políticas asumen que las Server Actions usarán `supabase.auth.admin` o verificarán un rol específico.
CREATE POLICY "Admin/Service can insert articles"
ON public.cogniread_articles
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'owner'));

-- Política de actualización: Permitir que los Service Role Key o usuarios autorizados actualicen artículos
CREATE POLICY "Admin/Service can update articles"
ON public.cogniread_articles
FOR UPDATE
USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'owner'));

-- Política de eliminación: Permitir que los Service Role Key o usuarios autorizados eliminen artículos
CREATE POLICY "Admin/Service can delete articles"
ON public.cogniread_articles
FOR DELETE
USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'owner'));
