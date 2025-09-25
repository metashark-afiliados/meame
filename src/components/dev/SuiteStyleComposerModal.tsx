// RUTA: src/components/dev/SuiteStyleComposerModal.tsx
/**
 * @file SuiteStyleComposerModal.tsx
 * @description Orquestador modal para la composición de temas.
 * @version 8.0.0 (Full Implementation & Type Safety)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { useSuiteStyleComposer } from "@/components/features/dev-tools/SuiteStyleComposer/use-suite-style-composer";
import {
  ComposerHeader,
  ComposerFooter,
  SuiteColorsTab,
  SuiteTypographyTab,
  SuiteGeometryTab,
} from "@/components/features/dev-tools/SuiteStyleComposer";
import type {
  SuiteThemeConfig,
  LoadedFragments,
} from "@/components/features/dev-tools/SuiteStyleComposer/types";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

// Contrato de tipo explícito para el contenido i18n
type ComposerContent = NonNullable<Dictionary["suiteStyleComposer"]>;

interface SuiteStyleComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allThemeFragments: LoadedFragments;
  currentSuiteConfig: SuiteThemeConfig;
  onSave: (newConfig: SuiteThemeConfig) => void;
  content: ComposerContent;
}

export function SuiteStyleComposerModal({
  isOpen,
  onClose,
  allThemeFragments,
  currentSuiteConfig,
  onSave,
  content,
}: SuiteStyleComposerModalProps) {
  const { localSuiteConfig, handleConfigUpdate, clearPreview } =
    useSuiteStyleComposer({
      initialConfig: currentSuiteConfig,
      allThemeFragments,
    });

  const handleSave = () => {
    onSave(localSuiteConfig);
    onClose();
  };

  const handleCancel = () => {
    clearPreview();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col h-full"
            >
              <ComposerHeader
                title={content.composerTitle}
                description={content.composerDescription}
              />
              <div className="flex-grow overflow-y-auto">
                <Tabs defaultValue="colors" className="w-full">
                  <TabsList className="mx-6">
                    <TabsTrigger value="colors">
                      {content.composerColorsTab}
                    </TabsTrigger>
                    <TabsTrigger value="typography">
                      {content.composerTypographyTab}
                    </TabsTrigger>
                    <TabsTrigger value="geometry">
                      {content.composerGeometryTab}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="colors">
                    <SuiteColorsTab
                      allThemeFragments={allThemeFragments}
                      selectedColorPreset={localSuiteConfig.colorPreset || ""}
                      onColorPresetChange={(value) =>
                        handleConfigUpdate({ colorPreset: value })
                      }
                      content={{
                        selectThemeLabel: content.selectThemeLabel,
                        defaultPresetName: content.defaultPresetName,
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="typography">
                    <SuiteTypographyTab
                      allThemeFragments={allThemeFragments}
                      selectedFontPreset={localSuiteConfig.fontPreset || ""}
                      onFontPresetChange={(value) =>
                        handleConfigUpdate({ fontPreset: value })
                      }
                      content={{
                        selectFontLabel: content.selectFontLabel,
                        fontFilterPlaceholder: content.fontFilterPlaceholder,
                        defaultPresetName: content.defaultPresetName,
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="geometry">
                    <SuiteGeometryTab
                      allThemeFragments={allThemeFragments}
                      selectedRadiusPreset={localSuiteConfig.radiusPreset || ""}
                      onRadiusPresetChange={(value) =>
                        handleConfigUpdate({ radiusPreset: value })
                      }
                      content={{
                        selectRadiusLabel: content.selectRadiusLabel,
                        radiusFilterPlaceholder:
                          content.radiusFilterPlaceholder,
                        defaultPresetName: content.defaultPresetName,
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <ComposerFooter
                onSave={handleSave}
                onCancel={handleCancel}
                saveButtonText={content.composerSaveButton}
                cancelButtonText={content.composerCancelButton}
              />
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
