-- scripts/supabase/migrations/YYYYMMDDHHMMSS_create_community_comments_table.sql
-- (Reemplaza YYYYMMDDHHMMSS con la marca de tiempo actual, ej. 20250928062000)

-- Habilitar la extensión uuid-ossp si aún no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: community_comments
-- Almacena los comentarios de los usuarios asociados a artículos.
CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id uuid NOT NULL REFERENCES public.cogniread_articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_avatar_url text, -- Puede ser NULL
  comment_text text NOT NULL,
  parent_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE, -- Para comentarios anidados (reply)
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para mejorar el rendimiento de las búsquedas y relaciones
CREATE INDEX idx_community_comments_article_id ON public.community_comments (article_id);
CREATE INDEX idx_community_comments_user_id ON public.community_comments (user_id);
CREATE INDEX idx_community_comments_parent_id ON public.community_comments (parent_id);
CREATE INDEX idx_community_comments_created_at ON public.community_comments (created_at DESC);


-- Habilitar Row Level Security (RLS)
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para community_comments

-- Política de lectura: Todos pueden ver los comentarios
CREATE POLICY "Comments are viewable by everyone"
ON public.community_comments
FOR SELECT
USING (true);

-- Política de inserción: Los usuarios autenticados pueden crear sus propios comentarios
CREATE POLICY "Authenticated users can insert their own comments"
ON public.community_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política de actualización: Los autores pueden actualizar sus propios comentarios
CREATE POLICY "Authors can update their own comments"
ON public.community_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Política de eliminación: Los autores pueden eliminar sus propios comentarios
CREATE POLICY "Authors can delete their own comments"
ON public.community_comments
FOR DELETE
USING (auth.uid() = user_id);
