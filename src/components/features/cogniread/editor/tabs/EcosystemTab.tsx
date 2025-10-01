// RUTA: src/components/features/cogniread/editor/tabs/EcosystemTab.tsx
/**
 * @file EcosystemTab.tsx
 * @description Componente de presentación para la pestaña "Ecosistema", forjado con
 *              observabilidad de élite, guardianes de resiliencia y una arquitectura soberana.
 *              v3.0.0 (Elite Observability, Resilience & Hooks Compliance)
 * @version 3.0.0
 *@author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CldImage } from "next-cloudinary";
import type { UseFormReturn } from "react-hook-form";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  Button,
  DynamicIcon,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { AssetSelectorModal } from "@/components/features/bavi/components";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import type { BaviAsset } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";

type EcosystemTabContent = NonNullable<
  Dictionary["cogniReadEditor"]
>["ecosystemTab"];

interface EcosystemTabProps {
  form: UseFormReturn<CogniReadArticle>;
  content: EcosystemTabContent;
}

export function EcosystemTab({ form, content }: EcosystemTabProps) {
  const traceId = useMemo(
    () => logger.startTrace("EcosystemTab_Lifecycle_v3.0"),
    []
  );

  useEffect(() => {
    logger.info("[EcosystemTab] Componente montado y listo.", { traceId });
    return () => logger.endTrace(traceId);
  }, [traceId]);

  // --- [INICIO DE RESTAURACIÓN DE CONTRATO DE HOOKS] ---
  // Todos los hooks se invocan en el nivel superior, antes de cualquier lógica condicional.
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const pathname = usePathname();
  const locale = getCurrentLocaleFromPathname(pathname);
  const heroImageId = form.watch("baviHeroImageId");
  // --- [FIN DE RESTAURACIÓN DE CONTRATO DE HOOKS] ---

  // --- [INICIO] GUARDIÁN DE RESILIENCIA DE CONTRATO ---
  if (!content) {
    const errorMsg =
      "Contrato de UI violado: La prop 'content' para EcosystemTab es requerida.";
    logger.error(`[Guardián] ${errorMsg}`, { traceId });
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="EcosystemTab"
          errorMessage={errorMsg}
          errorDetails="El Server Shell que renderiza este componente no proporcionó los datos de i18n necesarios."
        />
      );
    }
    return null; // Falla silenciosamente en producción
  }
  // --- [FIN] GUARDIÁN DE RESILIENCIA DE CONTRATO ---

  const handleAssetSelect = (asset: BaviAsset) => {
    logger.traceEvent(
      traceId,
      `Acción: Usuario seleccionó el activo BAVI: ${asset.assetId}`
    );

    const primaryVariant = asset.variants.find((v) => v.state === "orig");
    if (primaryVariant?.publicId) {
      form.setValue("baviHeroImageId", primaryVariant.publicId, {
        shouldDirty: true,
      });
      setIsSelectorOpen(false);
      logger.success(
        `[EcosystemTab] Activo BAVI '${asset.assetId}' aplicado al formulario.`,
        { publicId: primaryVariant.publicId, traceId }
      );
    } else {
      logger.error(
        `[Guardián] El activo BAVI '${asset.assetId}' no tiene una variante 'orig' con 'publicId'.`,
        { traceId, asset }
      );
      toast.error("Activo Inválido", {
        description:
          "El activo seleccionado no tiene una imagen principal válida y no puede ser utilizado.",
      });
    }
  };

  const openSelector = () => {
    logger.traceEvent(
      traceId,
      "Acción: Abriendo modal de selección de activos BAVI."
    );
    setIsSelectorOpen(true);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{content.heroImageTitle}</CardTitle>
          <CardDescription>{content.heroImageDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full max-w-md aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden">
            {heroImageId ? (
              <CldImage
                src={heroImageId}
                alt={content.heroImageTitle}
                width={500}
                height={281}
                crop="fill"
                gravity="auto"
                className="object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <DynamicIcon name="Image" className="h-12 w-12 mx-auto" />
                <p className="mt-2 text-sm">{content.noImageSelected}</p>
              </div>
            )}
          </div>
          <Button type="button" variant="outline" onClick={openSelector}>
            <DynamicIcon name="LibraryBig" className="mr-2 h-4 w-4" />
            {content.selectFromBaviButton}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed opacity-50">
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            {content.relatedPromptsTitle}
          </CardTitle>
          <CardDescription>{content.relatedPromptsDescription}</CardDescription>
        </CardHeader>
      </Card>

      <AssetSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onAssetSelect={handleAssetSelect}
        locale={locale}
      />
    </div>
  );
}
