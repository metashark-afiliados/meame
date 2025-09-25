-- scripts/supabase/migrations/003_fix_content_diagnostics_permissions.sql

-- Se actualiza la función para que se ejecute con privilegios elevados (SECURITY DEFINER)
-- y se blinda la lógica para que no falle si las tablas opcionales no existen.
CREATE OR REPLACE FUNCTION get_content_diagnostics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    site_count INT;
    campaign_count INT;
    avg_campaigns NUMERIC;
    site_status JSONB;
    campaign_status JSONB;
BEGIN
    -- Censo de Entidades
    SELECT COUNT(*) INTO site_count FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sites';
    IF site_count > 0 THEN
        EXECUTE 'SELECT COUNT(*) FROM public.sites' INTO site_count;
    ELSE
        site_count := 0;
    END IF;

    SELECT COUNT(*) INTO campaign_count FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns';
    IF campaign_count > 0 THEN
        EXECUTE 'SELECT COUNT(*) FROM public.campaigns' INTO campaign_count;
    ELSE
        campaign_count := 0;
    END IF;

    -- Métricas de Relación
    IF site_count > 0 AND campaign_count > 0 THEN
        EXECUTE 'SELECT AVG(campaign_count) FROM (SELECT site_id, COUNT(*) as campaign_count FROM public.campaigns GROUP BY site_id) as site_campaigns' INTO avg_campaigns;
    ELSE
        avg_campaigns := 0;
    END IF;

    -- Distribución de Estados
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
            'last_campaign_created', (SELECT CASE WHEN campaign_count > 0 THEN (SELECT MAX(created_at) FROM public.campaigns) ELSE NULL END)
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
