// _docs/supabase/002_MANIFIESTO_TABLAS_BAVI.md
/**
 * @file 002_MANIFIESTO_TABLAS_BAVI.md
 * @description Manifiesto Canónico y SSoT para las tablas 'bavi_assets' y 'bavi_variants'.
 * @version 1.0.0
 * @author L.I.A. Legacy
 */

# Manifiesto de Tablas Soberanas: `bavi_assets` y `bavi_variants`

## 1. Visión y Propósito
El dominio BAVI se divide en dos entidades para garantizar la integridad y flexibilidad: el **Activo** (el concepto) y la **Variante** (la manifestación física).

**Principio Raíz:** Un activo no puede existir sin, al menos, una variante. Esta regla de negocio es inmutable y se refuerza a nivel de base de datos.

## 2. Definición de Schema (DDL)

### 2.1. Tabla `public.bavi_assets`
```sql
-- Tabla: public.bavi_assets (El Contenedor Conceptual)
CREATE TABLE IF NOT EXISTS public.bavi_assets (
    asset_id TEXT PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    provider TEXT NOT NULL DEFAULT 'cloudinary',
    prompt_id TEXT,
    tags JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.bavi_assets IS 'Registro maestro de activos visuales en el ecosistema.';
COMMENT ON COLUMN public.bavi_assets.asset_id IS 'ID único basado en la nomenclatura SNIA.';
2.2. Tabla public.bavi_variants
code
SQL
-- Tabla: public.bavi_variants (La Manifestación Física)
CREATE TABLE IF NOT EXISTS public.bavi_variants (
    variant_id TEXT NOT NULL,
    asset_id TEXT NOT NULL REFERENCES public.bavi_assets(asset_id) ON DELETE CASCADE,
    public_id TEXT NOT NULL,
    state TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (asset_id, variant_id)
);
COMMENT ON TABLE public.bavi_variants IS 'Almacena las diferentes versiones y formatos de un activo BAVI.';
COMMENT ON COLUMN public.bavi_variants.asset_id IS 'Garantiza que cada variante pertenezca a un activo existente.';
3. Integridad Referencial y Relaciones
Clave Foránea Mandatoria: La columna bavi_variants.asset_id tiene una restricción de clave foránea (bavi_variants_asset_id_fkey) que apunta a bavi_assets.asset_id.
Eliminación en Cascada (ON DELETE CASCADE): Si un registro en bavi_assets es eliminado, todas sus variantes correspondientes en bavi_variants son eliminadas automáticamente por la base de datos. Esto previene la existencia de "variantes huérfanas" y mantiene la consistencia.
4. Políticas de Seguridad a Nivel de Fila (RLS)
Permitir acceso de lectura pública a los activos (SELECT en bavi_assets): Permite que cualquier solicitud (autenticada o no) lea los datos de los activos, ya que son necesarios para renderizar contenido público.
Permitir acceso de lectura pública a las variantes (SELECT en bavi_variants): Misma justificación que la anterior.
Los miembros del workspace pueden gestionar activos (INSERT, UPDATE, DELETE en bavi_assets): Utiliza la función is_workspace_member(workspace_id) para asegurar que solo los miembros del workspace al que pertenece el activo puedan modificarlo o eliminarlo.
5. Sincronización con Schemas de Aplicación
Contrato: Cualquier dato consultado desde estas tablas y enviado a la aplicación DEBE ser validado contra el BaviAssetSchema en src/shared/lib/schemas/bavi/bavi.manifest.schema.ts. La función getBaviManifestFn en src/shared/lib/bavi/manifest.queries.ts es la responsable de esta orquestación de datos, transformando la estructura relacional (bavi_assets y bavi_variants) en la estructura anidada que la aplicación espera y validando el resultado.
6. Interacción con el Ecosistema
RaZPrompts: La tabla razprompts_entries almacena un array de bavi_asset_ids (TEXT[]) para registrar todos los activos generados a partir de un prompt. A su vez, bavi_assets puede almacenar un prompt_id para vincular un activo a su genoma creativo de origen.
CogniRead: La tabla cogniread_articles almacena un bavi_hero_image_id (TEXT). Este campo debe contener el public_id de una variante específica (ej. webvork/assets/.../v1-original) de la tabla bavi_variants para ser renderizado directamente por <CldImage>.
Campaign Suite (SDC): El AssetExplorer interactúa con la getBaviAssetsAction para buscar y filtrar activos. Al seleccionar un activo, el componente recibe el objeto BaviAsset completo, permitiéndole acceder a cualquier publicId de sus variantes para su uso en la campaña.
