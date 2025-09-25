-- scripts/supabase/migrations/003_fix_content_diagnostics_permissions_v2.sql

-- Se actualiza la función para ser completamente resiliente a la ausencia de tablas.
-- Ahora verifica la existencia de 'sites' y 'campaigns' antes de intentar consultarlas.
CREATE OR REPLACE FUNCTION get_content_diagnostics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    site_count INT;
    campaign_count INT;
    avg_campaigns NUMERIC;
    site_status JSONB;
    campaign_status JSONB;
    last_campaign_date TIMESTAMPTZ;
BEGIN
    -- Censo de Entidades (Resiliente)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sites') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.sites' INTO site_count;
    ELSE
        site_count := 0;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.campaigns' INTO campaign_count;
        EXECUTE 'SELECT MAX(created_at) FROM public.campaigns' INTO last_campaign_date;
    ELSE
        campaign_count := 0;
        last_campaign_date := NULL;
    END IF;

    -- Métricas de Relación (Resiliente)
    IF site_count > 0 AND campaign_count > 0 THEN
        EXECUTE 'SELECT AVG(campaign_count) FROM (SELECT site_id, COUNT(*) as campaign_count FROM public.campaigns GROUP BY site_id) as site_campaigns' INTO avg_campaigns;
    ELSE
        avg_campaigns := 0;
    END IF;

    -- Distribución de Estados (Resiliente)
    IF site_count > 0 THEN
      EXECUTE 'SELECT jsonb_object_agg(status, count) FROM (SELECT status, COUNT(*) FROM public.sites GROUP BY status) as s' INTO site_status;
    ELSE
      site_status := '{}'::jsonb;
    END IF;

    IF campaign_count > 0 THEN
      EXECUTE 'SELECT jsonb_object_agg(status, count) FROM (SELECT status, COUNT(*) FROM public.campaigns GROUP BY status) as c' INTO campaign_status;
    ELSE
      campaign_status := '{}'::jsonb;
    END IF;


    SELECT jsonb_build_object(
        'entity_counts', jsonb_build_object(
            'sites', site_count,
            'campaigns', campaign_count,
            'users', (SELECT COUNT(*) FROM auth.users)
        ),
        'relationship_metrics', jsonb_build_object(
            'avg_campaigns_per_site', COALESCE(avg_campaigns, 0)
        ),
        'status_distribution', jsonb_build_object(
            'sites', COALESCE(site_status, '{}'::jsonb),
            'campaigns', COALESCE(campaign_status, '{}'::jsonb)
        ),
        'system_health', jsonb_build_object(
            'last_user_signup', (SELECT MAX(created_at) FROM auth.users),
            'last_campaign_created', last_campaign_date
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
