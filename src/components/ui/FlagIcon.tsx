// components/ui/FlagIcon.tsx
/**
 * @file FlagIcon.tsx
 * @description Componente despachador inteligente para renderizar iconos de banderas.
 *              Mapea un código de locale a su componente SVG de bandera correspondiente.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { type SVGProps } from "react";
import { type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import IT from "@/components/icons/flags/IT";
import ES from "@/components/icons/flags/ES";
import US from "@/components/icons/flags/US";
import BR from "@/components/icons/flags/BR";

interface FlagIconProps extends SVGProps<SVGSVGElement> {
  locale: Locale;
}

const localeToFlagMap: Record<
  Locale,
  React.ComponentType<SVGProps<SVGSVGElement>>
> = {
  "it-IT": IT,
  "es-ES": ES,
  "en-US": US,
  "pt-BR": BR,
};

export function FlagIcon({
  locale,
  ...props
}: FlagIconProps): React.ReactElement {
  logger.trace(`[FlagIcon] Renderizando bandera para el locale: ${locale}`);
  const FlagComponent = localeToFlagMap[locale];
  return <FlagComponent {...props} />;
}
// components/ui/FlagIcon.tsx
