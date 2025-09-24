// RUTA: src/app/not-found.tsx
/**
 * @file not-found.tsx
 * @description Enrutador 404 de Nivel Raíz, con lógica de detección de locale robustecida.
 * @version 3.1.0 (Architectural Path Alignment)
 * @author RaZ Podestá - MetaShark Tech
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";
import { logger } from "@/shared/lib/logging";
import { defaultLocale } from "@/shared/lib/i18n/i18n.config";

export default function NotFound() {
  const headersList = headers();
  const pathname = headersList.get("x-next-pathname") || "";
  const referer = headersList.get("referer") || "";
  const assetPath = headersList.get("x-invoke-path") || "";

  let targetLocale = defaultLocale;

  if (pathname) {
    logger.warn(
      `[Root NotFound] Ruta de PÁGINA no encontrada interceptada: "${pathname}".`
    );
    targetLocale = getCurrentLocaleFromPathname(pathname);
  } else if (referer) {
    const refererPathname = new URL(referer).pathname;
    targetLocale = getCurrentLocaleFromPathname(refererPathname);
    logger.error(
      `[Root NotFound] Solicitud de ACTIVO ESTÁTICO no encontrada: "${assetPath}".`,
      {
        contexto: `La solicitud se originó desde la página: ${referer}`,
      }
    );
  } else {
    logger.error(
      `[Root NotFound] Solicitud de ACTIVO ESTÁTICO directa no encontrada: "${assetPath}".`
    );
  }

  logger.info(
    `[Root NotFound] Locale final determinado: "${targetLocale}". Redirigiendo a la página 404 localizada.`
  );

  redirect(`/${targetLocale}/not-found`);
}
