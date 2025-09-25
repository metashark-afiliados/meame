-- scripts/supabase/migrations/002_fix_system_diagnostics_rpc_v2.sql

-- Se actualiza la función para usar 'qual' en lugar de 'definition'
-- para ser compatible con la versión actual de la vista pg_policies.
CREATE OR REPLACE FUNCTION get_system_diagnostics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'schema_columns', (SELECT jsonb_agg(jsonb_build_object('table', table_name, 'column', column_name, 'type', data_type)) FROM information_schema.columns WHERE table_schema = 'public'),
        'rls_policies', (SELECT jsonb_agg(jsonb_build_object('table', tablename, 'policy_name', policyname, 'command', cmd, 'definition', qual)) FROM pg_policies WHERE schemaname = 'public'),
        'functions_and_procedures', (SELECT jsonb_agg(jsonb_build_object('name', routine_name, 'type', routine_type)) FROM information_schema.routines WHERE specific_schema = 'public'),
        'triggers', (SELECT jsonb_agg(jsonb_build_object('table', event_object_table, 'trigger_name', trigger_name, 'timing', action_timing, 'event', event_manipulation)) FROM information_schema.triggers WHERE trigger_schema = 'public'),
        'table_constraints', (SELECT jsonb_agg(jsonb_build_object('table', table_name, 'constraint_name', constraint_name, 'type', constraint_type)) FROM information_schema.table_constraints WHERE table_schema = 'public'),
        'indexes', (SELECT jsonb_agg(jsonb_build_object('table', tablename, 'index_name', indexname)) FROM pg_indexes WHERE schemaname = 'public'),
        'extensions', (SELECT jsonb_agg(jsonb_build_object('name', extname, 'version', extversion)) FROM pg_extension)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para Diagnóstico de Contenido (Versión Resiliente)
-- Esta función realiza un censo de las entidades principales.
-- Es resiliente y no fallará si las tablas 'sites' o 'campaigns' no existen.
CREATE OR REPLACE FUNCTION get_content_diagnostics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'entity_counts', (SELECT jsonb_object_agg(table_name, count) FROM (
            SELECT 'users' as table_name, COUNT(*) as count FROM auth.users
        ) as counts),
        'relationship_metrics', (SELECT jsonb_build_object(
            'avg_campaigns_per_site', 0
        )),
        'status_distribution', (SELECT jsonb_build_object(
            'sites', '{}'::jsonb,
            'campaigns', '{}'::jsonb
        )),
        'system_health', (SELECT jsonb_build_object(
            'last_user_signup', (SELECT MAX(created_at) FROM auth.users)
        ))
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
