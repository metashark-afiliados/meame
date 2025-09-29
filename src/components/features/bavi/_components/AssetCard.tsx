// RUTA: src/components/features/bavi/_components/AssetCard.tsx
/**
 * @file AssetCard.tsx
 * @description Componente de presentación puro para visualizar un activo de BAVI.
 * @version 5.1.0 (Holistic Type Safety & Contract Alignment)
 * @author L.I.A. Legacy
 */
"use client";

import React from "react";
import { CldImage } from "next-cloudinary";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { BaviAsset } from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import type { PromptCreatorContentSchema } from "@/shared/lib/schemas/raz-prompts/prompt-creator.i18n.schema";
import type { z } from "zod";

type CreatorContent = z.infer<typeof PromptCreatorContentSchema>;
type SesaOptions = CreatorContent["sesaOptions"];
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: CONTRATOS DE TIPO EXPLÍCITOS] ---
type DescriptiveTagKey = keyof NonNullable<BaviAsset["tags"]>;

interface AssetCardProps {
  asset: BaviAsset;
  locale: Locale;
  onViewDetails: (assetId: string) => void;
  onSelectAsset?: (asset: BaviAsset) => void;
  sesaOptions: SesaOptions;
  selectButtonText?: string;
}

export function AssetCard({
  asset,
  locale,
  onViewDetails,
  onSelectAsset,
  sesaOptions,
  selectButtonText,
}: AssetCardProps): React.ReactElement {
  logger.trace(
    `[AssetCard] Renderizando tarjeta v5.1 para activo: ${asset.assetId}`
  );

  const mainVariant = asset.variants[0];
  const formattedDate = new Date(
    asset.createdAt || new Date()
  ).toLocaleDateString();

  const getTagLabel = (category: DescriptiveTagKey, value: string) => {
    // Este mapa traduce las claves descriptivas del manifiesto a las claves
    // abreviadas que utiliza el objeto de contenido i18n (sesaOptions).
    const keyMap: Record<DescriptiveTagKey, keyof SesaOptions> = {
      aiEngine: "ai",
      visualStyle: "sty",
      aspectRatio: "fmt",
      assetType: "typ",
      subject: "sbj",
    };
    const shortKey = keyMap[category];
    if (!shortKey) return value; // Fallback seguro

    return (
      sesaOptions[shortKey]?.find((opt) => opt.value === value)?.label || value
    );
  };
  // --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

  return (
    <Card className="h-full flex flex-col hover:shadow-primary/20 transition-all duration-200 ease-in-out">
      <CardHeader>
        <CardTitle className="text-lg">{asset.assetId}</CardTitle>
        <CardDescription className="flex items-center text-xs text-muted-foreground">
          <DynamicIcon name="Image" className="h-3 w-3 mr-1" />
          {asset.provider.toUpperCase()}
          <span className="mx-2">·</span>
          <DynamicIcon name="Clock" className="h-3 w-3 mr-1" />
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted/20 mb-4">
          {mainVariant?.publicId ? (
            <CldImage
              src={mainVariant.publicId}
              alt={asset.metadata?.altText?.[locale] || asset.assetId}
              width={mainVariant.dimensions?.width || 400}
              height={mainVariant.dimensions?.height || 225}
              crop="fill"
              gravity="auto"
              format="auto"
              quality="auto"
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <DynamicIcon name="ImageOff" className="h-6 w-6 mr-2" />
              <span>No Public ID</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {asset.metadata?.altText?.[locale] || "No alt text provided."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between pt-0 gap-2">
        <div className="flex flex-wrap gap-1">
          {asset.tags?.aiEngine && (
            <Badge variant="secondary">
              {getTagLabel("aiEngine", asset.tags.aiEngine)}
            </Badge>
          )}
          {asset.tags?.visualStyle && (
            <Badge variant="secondary">
              {getTagLabel("visualStyle", asset.tags.visualStyle)}
            </Badge>
          )}
          {asset.tags?.aspectRatio && (
            <Badge variant="secondary">
              {getTagLabel("aspectRatio", asset.tags.aspectRatio)}
            </Badge>
          )}
          {asset.tags?.assetType && (
            <Badge variant="secondary">
              {getTagLabel("assetType", asset.tags.assetType)}
            </Badge>
          )}
          {asset.tags?.subject && (
            <Badge variant="secondary">
              {getTagLabel("subject", asset.tags.subject)}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(asset.assetId)}
          >
            <DynamicIcon name="Eye" className="h-4 w-4 mr-2" />
            Ver Detalles
          </Button>
          {onSelectAsset && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSelectAsset(asset)}
            >
              <DynamicIcon name="Check" className="h-4 w-4 mr-2" />
              {selectButtonText || "Seleccionar"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
