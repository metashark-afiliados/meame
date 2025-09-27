// RUTA: src/components/features/campaign-suite/_components/LivePreviewCanvas/_components/PreviewRenderer.tsx
/**
 * @file PreviewRenderer.tsx
 * @description Componente de presentación puro que ensambla la estructura visual
 *              del lienzo de previsualización.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CampaignThemeProvider } from "@/components/layout";
import { generateCssVariablesFromTheme } from "@/shared/lib/utils/theming/theme-utils";
import { livePreviewComponentMap } from "@/shared/lib/dev/live-previews.config";
import { PreviewSection } from "./PreviewSection";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";
import type {
  BaviManifest,
  BaviAsset,
  BaviVariant,
} from "@/shared/lib/schemas/bavi/bavi.manifest.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

interface PreviewRendererProps {
  draft: CampaignDraft;
  theme: AssembledTheme;
  baviManifest: BaviManifest;
  dictionary: Dictionary;
  focusedSection: string | null;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}

export function PreviewRenderer({
  draft,
  theme,
  baviManifest,
  dictionary,
  focusedSection,
  sectionRefs,
}: PreviewRendererProps) {
  const getPublicId = (
    assetId: string | null | undefined
  ): string | undefined => {
    if (!assetId) return undefined;
    const asset = baviManifest.assets.find(
      (a: BaviAsset) => a.assetId === assetId
    );
    return asset?.variants.find((v: BaviVariant) => v.state === "orig")
      ?.publicId;
  };

  const HeaderComponent =
    draft.headerConfig.useHeader && draft.headerConfig.componentName
      ? livePreviewComponentMap[draft.headerConfig.componentName]
      : null;

  const FooterComponent =
    draft.footerConfig.useFooter && draft.footerConfig.componentName
      ? livePreviewComponentMap[draft.footerConfig.componentName]
      : null;

  const headerContent = {
    ...dictionary.header,
    ...dictionary.toggleTheme,
    ...dictionary.languageSwitcher,
    ...dictionary.cart,
    ...dictionary.userNav,
    ...dictionary.notificationBell,
  };

  return (
    <CampaignThemeProvider theme={theme}>
      <style>{generateCssVariablesFromTheme(theme)}</style>
      <AnimatePresence>
        {HeaderComponent && (
          <motion.div>
            <HeaderComponent
              content={headerContent}
              currentLocale="it-IT"
              supportedLocales={["it-IT"]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {draft.layoutConfig.map((section, index) => (
        <PreviewSection
          key={`${section.name}-${index}`}
          section={section}
          dictionary={dictionary}
          getPublicId={(assetId) => getPublicId(assetId)}
          isFocused={focusedSection === section.name}
          sectionRef={(el) => {
            if (sectionRefs) sectionRefs.current[section.name] = el;
          }}
        />
      ))}

      <AnimatePresence>
        {FooterComponent && (
          <motion.div>
            <FooterComponent content={dictionary.footer} />
          </motion.div>
        )}
      </AnimatePresence>
    </CampaignThemeProvider>
  );
}
