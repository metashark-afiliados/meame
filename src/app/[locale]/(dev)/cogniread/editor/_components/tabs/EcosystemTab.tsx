// app/[locale]/(dev)/cogniread/editor/_components/tabs/EcosystemTab.tsx
/**
 * @file EcosystemTab.tsx
 * @description Componente de presentación para la pestaña "Ecosistema". Orquesta la
 *              integración simbiótica de CogniRead con BAVI y RaZPrompts, ahora completamente internacionalizado.
 * @version 3.0.0 (Full i18n Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
import { CldImage } from "next-cloudinary";
import type { UseFormReturn } from "react-hook-form";
import { usePathname } from "next/navigation";
import {
  Button,
  DynamicIcon,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  // --- [INICIO DE NUEVA IMPORTACIÓN] ---
  CardContent,
  // --- [FIN DE NUEVA IMPORTACIÓN] ---
} from "@/components/ui";
import { AssetSelectorModal } from "@/components/features/bavi/_components/AssetSelectorModal";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import type { BaviAsset } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import { logger } from "@/shared/lib/logging";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";
import {
  getBaviI18nContentAction,
  type BaviI18nContent,
} from "@/shared/lib/actions/bavi/getBaviI18nContent.action";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema"; // Importar Dictionary

type EcosystemTabContent = NonNullable<
  Dictionary["cogniReadEditor"]
>["ecosystemTab"];

interface EcosystemTabProps {
  form: UseFormReturn<CogniReadArticle>;
  content: EcosystemTabContent; // Recibir content
}

export function EcosystemTab({
  form,
  content,
}: EcosystemTabProps): React.ReactElement {
  logger.info("[EcosystemTab] Renderizando v3.0 (Full i18n Compliance).");

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [baviContent, setBaviContent] = useState<BaviI18nContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const pathname = usePathname();
  const locale = getCurrentLocaleFromPathname(pathname);

  useEffect(() => {
    const fetchBaviContent = async () => {
      logger.trace("[EcosystemTab] Solicitando contenido i18n para la BAVI...");
      const result = await getBaviI18nContentAction(locale);
      if (result.success) {
        setBaviContent(result.data);
        logger.success("[EcosystemTab] Contenido i18n para BAVI cargado.");
      } else {
        logger.error(
          "[EcosystemTab] No se pudo cargar el contenido i18n para BAVI.",
          { error: result.error }
        );
      }
      setIsLoadingContent(false);
    };
    fetchBaviContent();
  }, [locale]);

  const heroImageId = form.watch("baviHeroImageId");

  const handleAssetSelect = (asset: BaviAsset) => {
    const primaryVariant = asset.variants.find((v) => v.state === "orig");
    if (primaryVariant) {
      // Nota: baviHeroImageId en el schema CogniReadArticleSchema espera el publicId
      form.setValue("baviHeroImageId", primaryVariant.publicId, {
        shouldDirty: true,
      });
      setIsSelectorOpen(false);
      logger.info(`[EcosystemTab] Activo BAVI seleccionado: ${asset.assetId}`);
    } else {
      logger.warn(
        `[EcosystemTab] El activo seleccionado ${asset.assetId} no tiene una variante original.`
      );
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{content.heroImageTitle}</CardTitle> {/* Consume i18n */}
          <CardDescription>
            {content.heroImageDescription} {/* Consume i18n */}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full max-w-md aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden">
            {heroImageId ? (
              <CldImage
                src={heroImageId}
                alt={
                  form.getValues(`content.${locale}.title`) ||
                  content.heroImageTitle
                } // Usa el título del artículo o el fallback i18n
                width={500}
                height={281}
                crop="fill"
                gravity="auto"
                format="auto"
                quality="auto"
                className="object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <DynamicIcon name="Image" className="h-12 w-12 mx-auto" />
                <p className="mt-2 text-sm">{content.noImageSelected}</p>{" "}
                {/* Consume i18n */}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSelectorOpen(true)}
            disabled={isLoadingContent}
          >
            <DynamicIcon name="LibraryBig" className="mr-2 h-4 w-4" />
            {isLoadingContent
              ? content.loadingBaviButton
              : content.selectFromBaviButton}{" "}
            {/* Consume i18n */}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            {content.relatedPromptsTitle} {/* Consume i18n */}
          </CardTitle>
          <CardDescription>
            {content.relatedPromptsDescription} {/* Consume i18n */}
          </CardDescription>
        </CardHeader>
      </Card>

      {isSelectorOpen && baviContent && (
        <AssetSelectorModal
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onAssetSelect={handleAssetSelect}
          locale={locale}
          content={{
            modalTitle: baviContent.baviUploader.assetSelectorModalTitle,
            modalDescription:
              baviContent.baviUploader.assetSelectorModalDescription,
            assetExplorerContent: baviContent.assetExplorer,
            sesaOptions: baviContent.sesaOptions,
          }}
        />
      )}
    </div>
  );
}
