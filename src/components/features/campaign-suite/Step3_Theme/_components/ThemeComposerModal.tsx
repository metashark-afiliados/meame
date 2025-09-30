// RUTA: src/components/features/campaign-suite/Step3_Theme/_components/ThemeComposerModal.tsx
/**
 * @file ThemeComposerModal.tsx
 * @description Orquestador modal para la Bóveda de Estilos, impulsado por base de datos.
 * @version 5.0.0 (Full UI Implementation & Data Alignment)
 * @author L.I.A. Legacy
 */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { PaletteSelector, TypographySelector, GeometrySelector } from "./";
import { usePreviewStore } from "@/components/features/campaign-suite/_context/PreviewContext";
import type { ThemeConfig } from "@/shared/lib/types/campaigns/draft.types";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { AssembledThemeSchema } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import { deepMerge } from "@/shared/lib/utils";
import { logger } from "@/shared/lib/logging";
import type { CategorizedPresets } from "../Step3Client";
import type { ThemePreset } from "@/shared/lib/schemas/theme-preset.schema";
import { toast } from "sonner";

interface ThemeComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: CategorizedPresets;
  currentConfig: ThemeConfig;
  onSave: (newConfig: ThemeConfig) => void;
  onCreatePreset: (
    name: string,
    description: string,
    type: "color" | "font" | "geometry",
    config: ThemeConfig
  ) => Promise<void>;
  content: {
    composerTitle: string;
    composerDescription: string;
    composerColorsTab: string;
    composerTypographyTab: string;
    composerGeometryTab: string;
    composerSaveButton: string;
    composerCancelButton: string;
    createNewPaletteButton: string;
    createNewFontSetButton: string;
    createNewRadiusStyleButton: string;
    placeholderFontsNone: string;
    placeholderRadiiNone: string;
  };
}

export function ThemeComposerModal({
  isOpen,
  onClose,
  presets,
  currentConfig,
  onSave,
  content,
}: ThemeComposerModalProps) {
  logger.info("[ThemeComposerModal] Renderizando v5.0 (Full UI).");
  const [localConfig, setLocalConfig] = useState(currentConfig);
  const { setPreviewTheme } = usePreviewStore();

  const allPresets = useMemo(() => {
    const combined = [...presets.global, ...presets.workspace];
    return combined.reduce(
      (acc, preset) => {
        if (preset.type === "color") acc.colors.push(preset);
        if (preset.type === "font") acc.fonts.push(preset);
        if (preset.type === "geometry") acc.geometry.push(preset);
        return acc;
      },
      { colors: [], fonts: [], geometry: [] } as {
        colors: ThemePreset[];
        fonts: ThemePreset[];
        geometry: ThemePreset[];
      }
    );
  }, [presets]);

  useEffect(() => setLocalConfig(currentConfig), [currentConfig, isOpen]);
  useEffect(() => {
    if (!isOpen) setPreviewTheme(null);
  }, [isOpen, setPreviewTheme]);

  const assemblePreviewTheme = (config: ThemeConfig): AssembledTheme | null => {
    const findPresetData = (
      type: "colors" | "fonts" | "geometry",
      name: string | null
    ): Partial<AssembledTheme> => {
      if (!name) return {};
      const preset = allPresets[type].find((p) => p.name === name);
      return preset?.theme_config
        ? (preset.theme_config as Partial<AssembledTheme>)
        : {};
    };
    const finalTheme = deepMerge(
      deepMerge(
        findPresetData("colors", config.colorPreset),
        findPresetData("fonts", config.fontPreset)
      ),
      findPresetData("geometry", config.radiusPreset)
    );
    return AssembledThemeSchema.parse(finalTheme);
  };

  const handlePreviewUpdate = (newConfig: Partial<ThemeConfig>) => {
    const tempConfig = { ...localConfig, ...newConfig };
    const previewTheme = assemblePreviewTheme(tempConfig);
    if (previewTheme) setPreviewTheme(previewTheme);
  };

  const handleSelect = (
    key: keyof Pick<ThemeConfig, "colorPreset" | "fontPreset" | "radiusPreset">,
    value: string
  ) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    handlePreviewUpdate(newConfig);
  };

  const handleSave = () => {
    setPreviewTheme(null);
    onSave(localConfig);
    onClose();
  };

  const handleCreate = (type: "color" | "font" | "geometry") => {
    toast.info(
      `Funcionalidad para crear presets de tipo '${type}' pendiente de implementación.`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col h-full"
            >
              <DialogHeader className="p-6 border-b">
                <DialogTitle>{content.composerTitle}</DialogTitle>
                <DialogDescription>
                  {content.composerDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-grow overflow-y-auto px-6">
                <Tabs defaultValue="colors" className="w-full">
                  <TabsList>
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
                  <TabsContent value="colors" className="mt-4">
                    <PaletteSelector
                      palettes={allPresets.colors}
                      selectedPaletteName={localConfig.colorPreset}
                      onSelect={(value) => handleSelect("colorPreset", value)}
                      onPreview={(palette) =>
                        handlePreviewUpdate({
                          colorPreset: palette?.name || localConfig.colorPreset,
                        })
                      }
                      onCreate={() => handleCreate("color")}
                      createNewPaletteButton={content.createNewPaletteButton}
                    />
                  </TabsContent>
                  <TabsContent value="typography" className="mt-4">
                    <TypographySelector
                      typographies={allPresets.fonts}
                      selectedTypographyName={localConfig.fontPreset}
                      onSelect={(value) => handleSelect("fontPreset", value)}
                      onPreview={(font) =>
                        handlePreviewUpdate({
                          fontPreset: font?.name || localConfig.fontPreset,
                        })
                      }
                      onCreate={() => handleCreate("font")}
                      emptyPlaceholder={content.placeholderFontsNone}
                      createNewFontSetButton={content.createNewFontSetButton}
                    />
                  </TabsContent>
                  <TabsContent value="geometry" className="mt-4">
                    <GeometrySelector
                      geometries={allPresets.geometry}
                      selectedGeometryName={localConfig.radiusPreset}
                      onSelect={(value) => handleSelect("radiusPreset", value)}
                      onPreview={(geo) =>
                        handlePreviewUpdate({
                          radiusPreset: geo?.name || localConfig.radiusPreset,
                        })
                      }
                      onCreate={() => handleCreate("geometry")}
                      emptyPlaceholder={content.placeholderRadiiNone}
                      createNewRadiusStyleButton={
                        content.createNewRadiusStyleButton
                      }
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter className="p-6 border-t mt-auto">
                <Button variant="outline" onClick={onClose}>
                  {content.composerCancelButton}
                </Button>
                <Button onClick={handleSave}>
                  {content.composerSaveButton}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
