// RUTA: src/components/features/campaign-suite/_components/LivePreviewCanvas/_components/PreviewContent.tsx
/**
 * @file PreviewContent.tsx
 * @description Componente de presentación que renderiza el contenido real de la previsualización.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CampaignThemeProvider, SectionRenderer } from "@/components/layout";
import { generateCssVariablesFromTheme } from "@/shared/lib/utils/theming/theme-utils";
import { livePreviewComponentMap } from "@/shared/lib/dev/live-previews.config";
import {
  mockHeader,
  mockFooter,
} from "@/shared/lib/config/campaign-suite/previews.mock-data";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { CampaignDraft } from "@/shared/lib/types/campaigns/draft.types";

interface PreviewContentProps {
  draft: CampaignDraft;
  theme: AssembledTheme;
  dictionary: Dictionary;
  focusedSection: string | null;
  sectionRefs: React.MutableRefObject<Record<string, HTMLElement>>;
}

const animationProps = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeInOut" },
} as const;

export function PreviewContent({
  draft,
  theme,
  dictionary,
  focusedSection,
  sectionRefs,
}: PreviewContentProps) {
  const HeaderComponent =
    draft.headerConfig.useHeader && draft.headerConfig.componentName
      ? livePreviewComponentMap[draft.headerConfig.componentName]
      : null;

  const FooterComponent =
    draft.footerConfig.useFooter && draft.footerConfig.componentName
      ? livePreviewComponentMap[draft.footerConfig.componentName]
      : null;

  return (
    <CampaignThemeProvider theme={theme}>
      <style>{generateCssVariablesFromTheme(theme)}</style>
      <AnimatePresence>
        {HeaderComponent && (
          <motion.div key="header" {...animationProps}>
            <HeaderComponent {...mockHeader} />
          </motion.div>
        )}
      </AnimatePresence>

      <SectionRenderer
        sections={draft.layoutConfig}
        dictionary={dictionary}
        locale={"it-IT"} // Locale de previsualización por defecto
        focusedSection={focusedSection}
        sectionRefs={sectionRefs}
      />

      <AnimatePresence>
        {FooterComponent && (
          <motion.div key="footer" {...animationProps}>
            <FooterComponent {...mockFooter} />
          </motion.div>
        )}
      </AnimatePresence>
    </CampaignThemeProvider>
  );
}
