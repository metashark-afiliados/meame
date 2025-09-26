// RUTA: src/components/sections/SocialProofLogos.tsx
/**
 * @file SocialProofLogos.tsx
 * @description Componente de prueba social. Renderiza logos desde la BAVI 2.0.
 * @version 7.2.0 (Holistic Type Safety)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import Marquee from "react-fast-marquee";
import { CldImage } from "next-cloudinary";
import { Container } from "@/components/ui/Container";
import { getBaviManifest } from "@/shared/lib/bavi/manifest.queries";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools/";
import type {
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";

interface SocialProofLogosProps {
  content?: Dictionary["socialProofLogos"];
}

export async function SocialProofLogos({
  content,
}: SocialProofLogosProps): Promise<React.ReactElement | null> {
  logger.info("[SocialProofLogos] Renderizando v7.2 (Holistic Type Safety).");

  if (!content || !content.logos || content.logos.length === 0) {
    return null;
  }

  try {
    const baviManifest = await getBaviManifest();
    const resolvedLogos = content.logos
      .map((logo) => {
        const baviAsset = baviManifest.assets.find(
          (asset: BaviAsset) => asset.assetId === logo.assetId
        );
        if (!baviAsset) {
          logger.warn(
            `[BAVI] Activo no encontrado en manifiesto: ${logo.assetId}`
          );
          return null;
        }
        const variant = baviAsset.variants.find(
          (v: BaviVariant) => v.state === "orig"
        );
        if (!variant) return null;

        return {
          alt: logo.alt,
          publicId: variant.publicId,
          width: variant.dimensions.width,
          height: variant.dimensions.height,
        };
      })
      .filter(Boolean);

    return (
      <section
        className="py-12 bg-background"
        aria-labelledby="social-proof-title"
      >
        <Container>
          <h2
            id="social-proof-title"
            className="text-center font-semibold text-foreground/70 uppercase tracking-wider mb-8"
          >
            {content.title}
          </h2>
          <Marquee
            gradient
            gradientColor="hsl(var(--background))"
            gradientWidth={100}
            speed={40}
            autoFill
            pauseOnHover
          >
            {resolvedLogos.map(
              (logo) =>
                logo && (
                  <div
                    key={logo.publicId}
                    className="mx-12 flex items-center justify-center h-10"
                  >
                    <CldImage
                      src={logo.publicId}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      format="auto"
                      quality="auto"
                      className="h-10 w-auto object-contain grayscale opacity-60 transition-all duration-300 ease-in-out hover:grayscale-0 hover:opacity-100 hover:scale-110"
                    />
                  </div>
                )
            )}
          </Marquee>
        </Container>
      </section>
    );
  } catch (error) {
    logger.error("[SocialProofLogos] Fallo al renderizar.", { error });
    if (process.env.NODE_ENV === "development") {
      return (
        <DeveloperErrorDisplay
          context="SocialProofLogos"
          errorMessage="No se pudo cargar el manifiesto de la BAVI."
          errorDetails={error instanceof Error ? error : String(error)}
        />
      );
    }
    return null;
  }
}
