// RUTA: src/shared/lib/navigation.ts
/**
 * @file navigation.ts
 * @description Manifiesto y SSoT para la definición de rutas del ecosistema.
 *              v13.0.0 (Resilient Path Builder): Implementa un motor de
 *              construcción de rutas robusto que maneja correctamente los
 *              segmentos dinámicos opcionales, resolviendo el error de "Dynamic href".
 * @version 13.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { defaultLocale, type Locale } from "./i18n/i18n.config";
import { logger } from "./logging";

logger.info(
  "[Observabilidad][ARQUITECTURA-RAIZ] Cargando Manifiesto de Rutas v13.0..."
);

export const RouteType = {
  Public: "public",
  DevOnly: "dev-only",
} as const;

export type RouteType = (typeof RouteType)[keyof typeof RouteType];

export type RouteParams = {
  locale?: Locale;
  [key: string]: string | number | string[] | undefined;
};

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: buildPath Resiliente] ---
const buildPath = (
  locale: Locale | undefined,
  template: string,
  params?: RouteParams
): string => {
  let path = `/${locale || defaultLocale}${template}`;

  if (params) {
    for (const key in params) {
      if (key !== "locale" && params[key] !== undefined) {
        const value = params[key];
        const stringValue = Array.isArray(value)
          ? value.join("/")
          : String(value);

        // Reemplaza todos los tipos de placeholders: [key], [...key], [[...key]]
        const placeholderRegex = new RegExp(
          `\\[\\[?\\.\\.\\.${key}\\]\\]?|\\[${key}\\]`
        );
        path = path.replace(placeholderRegex, stringValue);
      }
    }
  }

  // Limpia cualquier segmento opcional no reemplazado
  path = path.replace(/\/\[\[\.\.\..*?\]\]/g, "");

  // Limpia dobles barras y la barra final (excepto para la raíz)
  path = path.replace(/\/+/g, "/");
  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path || "/";
};
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

export const routes = {
  // === DOMINIO PÚBLICO ===
  home: {
    path: (params: RouteParams) => buildPath(params.locale, "/"),
    type: RouteType.Public,
  },
  store: {
    path: (params: RouteParams) => buildPath(params.locale, "/store"),
    type: RouteType.Public,
  },
  storeBySlug: {
    path: (params: RouteParams & { slug: string }) =>
      buildPath(params.locale, "/store/[slug]", params),
    type: RouteType.Public,
  },
  news: {
    path: (params: RouteParams) => buildPath(params.locale, "/news"),
    type: RouteType.Public,
  },
  newsBySlug: {
    path: (params: RouteParams & { slug: string }) =>
      buildPath(params.locale, "/news/[slug]", params),
    type: RouteType.Public,
  },
  about: {
    path: (params: RouteParams) => buildPath(params.locale, "/about"),
    type: RouteType.Public,
  },
  terms: {
    path: (params: RouteParams) => buildPath(params.locale, "/terms"),
    type: RouteType.Public,
  },
  privacy: {
    path: (params: RouteParams) => buildPath(params.locale, "/privacy"),
    type: RouteType.Public,
  },
  cookies: {
    path: (params: RouteParams) => buildPath(params.locale, "/cookies"),
    type: RouteType.Public,
  },
  checkout: {
    path: (params: RouteParams) => buildPath(params.locale, "/checkout"),
    type: RouteType.Public,
  },

  // === DOMINIO DE CAMPAÑAS ===
  campaign: {
    path: (
      params: RouteParams & {
        campaignId: string;
        variantSlug: string;
        seoKeywordSlug: string;
      }
    ) =>
      buildPath(
        params.locale,
        "/c/[campaignId]/[variantSlug]/[seoKeywordSlug]",
        params
      ),
    type: RouteType.Public,
  },

  // === DOMINIO DE AUTENTICACIÓN Y SISTEMA ===
  login: {
    path: (params: RouteParams) => buildPath(params.locale, "/login"),
    type: RouteType.Public,
  },
  account: {
    path: (params: RouteParams) => buildPath(params.locale, "/account"),
    type: RouteType.Public,
  },
  notifications: {
    path: (params: RouteParams) => buildPath(params.locale, "/notifications"),
    type: RouteType.Public,
  },
  selectLanguage: {
    path: () => "/select-language",
    type: RouteType.Public,
  },
  notFound: {
    path: (params: RouteParams) => buildPath(params.locale, "/not-found"),
    type: RouteType.Public,
  },

  // === DOMINIO DEL DEVELOPER COMMAND CENTER (DCC) ===
  devDashboard: {
    path: (params: RouteParams) => buildPath(params.locale, "/dev"),
    type: RouteType.DevOnly,
  },
  devTestPage: {
    path: (params: RouteParams) => buildPath(params.locale, "/dev/test-page"),
    type: RouteType.DevOnly,
  },
  devComponentShowcase: {
    path: (params: RouteParams) =>
      buildPath(params.locale, "/dev/component-showcase"),
    type: RouteType.DevOnly,
  },
  devCinematicDemo: {
    path: (params: RouteParams) =>
      buildPath(params.locale, "/dev/cinematic-demo"),
    type: RouteType.DevOnly,
  },
  creatorCampaignSuite: {
    path: (params: RouteParams & { stepId?: string[] }) =>
      buildPath(params.locale, "/creator/campaign-suite/[[...stepId]]", params),
    type: RouteType.DevOnly,
  },
  analytics: {
    path: (params: RouteParams) => buildPath(params.locale, "/analytics"),
    type: RouteType.DevOnly,
  },
  analyticsByVariant: {
    path: (params: RouteParams & { variantId: string }) =>
      buildPath(params.locale, "/analytics/[variantId]", params),
    type: RouteType.DevOnly,
  },
  bavi: {
    path: (params: RouteParams) => buildPath(params.locale, "/dev/bavi"),
    type: RouteType.DevOnly,
  },
  razPrompts: {
    path: (params: RouteParams) => buildPath(params.locale, "/dev/raz-prompts"),
    type: RouteType.DevOnly,
  },
  cogniReadDashboard: {
    path: (params: RouteParams) => buildPath(params.locale, "/dev/cogniread"),
    type: RouteType.DevOnly,
  },
  cogniReadEditor: {
    path: (params: RouteParams) =>
      buildPath(params.locale, "/dev/cogniread/editor"),
    type: RouteType.DevOnly,
  },
  nos3Dashboard: {
    path: (params: RouteParams) => buildPath(params.locale, "/dev/nos3"),
    type: RouteType.DevOnly,
  },
  nos3SessionPlayer: {
    path: (params: RouteParams & { sessionId: string }) =>
      buildPath(params.locale, "/dev/nos3/[sessionId]", params),
    type: RouteType.DevOnly,
  },
} as const;
