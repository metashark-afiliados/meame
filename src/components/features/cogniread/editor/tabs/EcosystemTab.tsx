// RUTA: src/components/features/cogniread/editor/tabs/EcosystemTab.tsx
/**
 * @file EcosystemTab.tsx
 * @description Componente de presentación para la pestaña "Ecosistema".
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState } from "react";
import { CldImage } from "next-cloudinary";
import type { UseFormReturn } from "react-hook-form";
import { usePathname } from "next/navigation";
import { Button, DynamicIcon, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { AssetSelectorModal } from "@/components/features/bavi/_components/AssetSelectorModal";
import type { CogniReadArticle } from "@/shared/lib/schemas/cogniread/article.schema";
import type { BaviAsset } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";

type EcosystemTabContent = NonNullable<Dictionary["cogniReadEditor"]>["ecosystemTab"];

interface EcosystemTabProps {
  form: UseFormReturn<CogniReadArticle>;
  content: EcosystemTabContent;
}

export function EcosystemTab({ form, content }: EcosystemTabProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const pathname = usePathname();
  const locale = getCurrentLocaleFromPathname(pathname);
  const heroImageId = form.watch("baviHeroImageId");

  const handleAssetSelect = (asset: BaviAsset) => {
    const primaryVariant = asset.variants.find((v) => v.state === "orig");
    if (primaryVariant) {
      form.setValue("baviHeroImageId", primaryVariant.publicId, { shouldDirty: true });
      setIsSelectorOpen(false);
      logger.info(`[EcosystemTab] Activo BAVI seleccionado: ${asset.assetId}`);
    } else {
      logger.warn(`[EcosystemTab] El activo ${asset.assetId} no tiene variante original.`);
    }
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
          <Button type="button" variant="outline" onClick={() => setIsSelectorOpen(true)}>
            <DynamicIcon name="LibraryBig" className="mr-2 h-4 w-4" />
            {content.selectFromBaviButton}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed opacity-50">
        <CardHeader>
          <CardTitle className="text-muted-foreground">{content.relatedPromptsTitle}</CardTitle>
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
