// Ruta correcta: src/shared/lib/navigation.ts
/**
 * @file navigation.ts
 * @description Manifiesto y SSoT para la definición de rutas del ecosistema "Méame".
 *              v11.1.0 (Client Compatibility Fix): Se elimina la directiva 'server-only'
 *              para permitir que el manifiesto sea consumido tanto por componentes de
 *              servidor como de cliente, restaurando la funcionalidad de <Link>.
 * @version 11.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { defaultLocale, type Locale } from "./i18n/i18n.config";
import { logger } from "./logging";

logger.info(
  "[Observabilidad][ARQUITECTURA-RAIZ] Cargando Manifiesto de Rutas v11.1..."
);

export const RouteType = {
  Public: "public",
  DevOnly: "dev-only",
} as const;

export type RouteType = (typeof RouteType)[keyof typeof RouteType];

export type RouteParams = {
  locale?: Locale;
  [key: string]: string | number | undefined;
};

export const routes = {
  // === DOMINIO PÚBLICO ===
  home: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}`,
    type: RouteType.Public,
  },
  store: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/store`,
    type: RouteType.Public,
  },
  storeBySlug: {
    path: (params: RouteParams & { slug: string | number }) =>
      `/${params.locale || defaultLocale}/store/${params.slug}`,
    type: RouteType.Public,
  },
  news: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/news`,
    type: RouteType.Public,
  },
  newsBySlug: {
    path: (params: RouteParams & { slug: string | number }) =>
      `/${params.locale || defaultLocale}/news/${params.slug}`,
    type: RouteType.Public,
  },
  about: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/about`,
    type: RouteType.Public,
  },
  terms: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/terms`,
    type: RouteType.Public,
  },
  privacy: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/privacy`,
    type: RouteType.Public,
  },
  cookies: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/cookies`,
    type: RouteType.Public,
  },
  checkout: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/checkout`,
    type: RouteType.Public,
  },

  // === DOMINIO DE CAMPAÑAS ===
  campaign: {
    path: (
      params: RouteParams & {
        campaignId: string | number;
        variantSlug: string | number;
        seoKeywordSlug: string | number;
      }
    ) =>
      `/${params.locale || defaultLocale}/c/${params.campaignId}/${params.variantSlug}/${params.seoKeywordSlug}`,
    type: RouteType.Public,
  },

  // === DOMINIO DE AUTENTICACIÓN Y SISTEMA ===
  login: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/login`,
    type: RouteType.Public,
  },
  account: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/account`,
    type: RouteType.Public, // La protección la hace el middleware
  },
  notifications: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/notifications`,
    type: RouteType.Public, // La protección la hace el middleware
  },
  selectLanguage: {
    path: () => `/select-language`, // Sin locale
    type: RouteType.Public,
  },
  notFound: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/not-found`,
    type: RouteType.Public,
  },

  // === DOMINIO DEL DEVELOPER COMMAND CENTER (DCC) ===
  devDashboard: {
    path: (params: RouteParams) => `/${params.locale || defaultLocale}/dev`,
    type: RouteType.DevOnly,
  },
  devTestPage: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/dev/test-page`,
    type: RouteType.DevOnly,
  },
  devComponentShowcase: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/dev/component-showcase`,
    type: RouteType.DevOnly,
  },
  devCinematicDemo: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/dev/cinematic-demo`,
    type: RouteType.DevOnly,
  },

  // -- Sub-dominio: Creator / Analytics (Rutas de Producción Protegidas)
  creatorCampaignSuite: {
    path: (params: RouteParams & { stepId?: (string | number)[] }) => {
      const base = `/${params.locale || defaultLocale}/creator/campaign-suite`;
      if (params.stepId && params.stepId.length > 0) {
        return `${base}/${params.stepId.join("/")}`;
      }
      return base;
    },
    type: RouteType.DevOnly,
  },
  analytics: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/analytics`,
    type: RouteType.DevOnly,
  },
  analyticsByVariant: {
    path: (params: RouteParams & { variantId: string | number }) =>
      `/${params.locale || defaultLocale}/analytics/${params.variantId}`,
    type: RouteType.DevOnly,
  },

  // -- Sub-dominio: BAVI
  bavi: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/dev/bavi`,
    type: RouteType.DevOnly,
  },

  // -- Sub-dominio: RaZPrompts
  razPrompts: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/dev/raz-prompts`,
    type: RouteType.DevOnly,
  },

  // -- Sub-dominio: CogniRead
  cogniReadDashboard: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/dev/cogniread`,
    type: RouteType.DevOnly,
  },
  cogniReadEditor: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/dev/cogniread/editor`,
    type: RouteType.DevOnly,
  },

  // -- Sub-dominio: Nos3
  nos3Dashboard: {
    path: (params: RouteParams) =>
      `/${params.locale || defaultLocale}/dev/nos3`,
    type: RouteType.DevOnly,
  },
  nos3SessionPlayer: {
    path: (params: RouteParams & { sessionId: string | number }) =>
      `/${params.locale || defaultLocale}/dev/nos3/${params.sessionId}`,
    type: RouteType.DevOnly,
  },
} as const;
// Ruta correcta: src/shared/lib/navigation.ts
