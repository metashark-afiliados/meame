// RUTA: src/components/features/campaign-suite/Step3_Theme/_components/ThemeComposerModal.tsx
/**
 * @file ThemeComposerModal.tsx
 * @description Orquestador modal para la composición visual de temas.
 * @version 2.0.0 (Module & Type Integrity Restoration, MEA/UX Injected)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import type { LoadedFragments } from "@/components/features/dev-tools/SuiteStyleComposer/types"; // <-- IMPORTACIÓN CORREGIDA Y SOBERANA

// --- Contratos de Tipo Locales para Máxima Seguridad y Claridad ---
interface Palette {
  name: string;
  colors?: { [key: string]: string | undefined };
}
interface Typography {
  name: string;
  fonts?: { [key: string]: string | undefined };
}
interface Geometry {
  name: string;
  geometry?: { [key: string]: string | undefined };
}

interface ThemeComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fragments: LoadedFragments;
  currentConfig: ThemeConfig;
  onSave: (newConfig: ThemeConfig) => void;
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
  fragments,
  currentConfig,
  onSave,
  content,
}: ThemeComposerModalProps) {
  // ... (resto de la lógica del componente sin cambios) ...
  logger.info("[ThemeComposerModal] Renderizando Compositor de Temas v2.0.");
  const [localConfig, setLocalConfig] = useState(currentConfig);
  const { setPreviewTheme } = usePreviewStore();

  useEffect(() => {
    setLocalConfig(currentConfig);
  }, [currentConfig]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewTheme(null);
    }
  }, [isOpen, setPreviewTheme]);

  const handleSave = () => {
    setPreviewTheme(null);
    onSave(localConfig);
    onClose();
  };

  const assemblePreviewTheme = (config: ThemeConfig): AssembledTheme | null => {
    const { colorPreset, fontPreset, radiusPreset } = config;
    const colorFrag = colorPreset ? fragments.colors[colorPreset] : {};
    const fontFrag = fontPreset ? fragments.fonts[fontPreset] : {};
    const radiiFrag = radiusPreset ? fragments.radii[radiusPreset] : {};

    const finalTheme = deepMerge(
      deepMerge(deepMerge(fragments.base, colorFrag), fontFrag),
      radiiFrag
    );

    const validation = AssembledThemeSchema.safeParse(finalTheme);
    if (validation.success) {
      return validation.data;
    }
    return null;
  };

  const handlePreviewUpdate = (newConfig: Partial<ThemeConfig>) => {
    const tempConfig = { ...localConfig, ...newConfig };
    const previewTheme = assemblePreviewTheme(tempConfig);
    if (previewTheme) {
      setPreviewTheme(previewTheme);
    }
  };

  const handlePaletteSelect = (paletteName: string) => {
    setLocalConfig((prev) => ({ ...prev, colorPreset: paletteName }));
    handlePreviewUpdate({ colorPreset: paletteName });
  };

  const handleTypographySelect = (typographyName: string) => {
    setLocalConfig((prev) => ({ ...prev, fontPreset: typographyName }));
    handlePreviewUpdate({ fontPreset: typographyName });
  };

  const handleGeometrySelect = (geometryName: string) => {
    setLocalConfig((prev) => ({ ...prev, radiusPreset: geometryName }));
    handlePreviewUpdate({ radiusPreset: geometryName });
  };

  const palettes = Object.entries(fragments.colors).map(([name, data]) => ({
    name,
    colors: data.colors,
  }));
  const typographies = Object.entries(fragments.fonts).map(([name, data]) => ({
    name,
    fonts: data.fonts,
  }));
  const geometries = Object.entries(fragments.radii).map(([name, data]) => ({
    name,
    geometry: data.geometry,
  }));

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
              <DialogHeader className="p-6">
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
                      palettes={palettes}
                      selectedPaletteName={localConfig.colorPreset}
                      onSelect={handlePaletteSelect}
                      onPreview={(palette: Palette | null) =>
                        handlePreviewUpdate({
                          colorPreset: palette ? palette.name : null,
                        })
                      }
                      onCreate={() => toast.info("Funcionalidad futura.")}
                      createNewPaletteButton={content.createNewPaletteButton}
                    />
                  </TabsContent>
                  <TabsContent value="typography" className="mt-4">
                    <TypographySelector
                      typographies={typographies}
                      selectedTypographyName={localConfig.fontPreset}
                      onSelect={handleTypographySelect}
                      onPreview={(typography: Typography | null) =>
                        handlePreviewUpdate({
                          fontPreset: typography ? typography.name : null,
                        })
                      }
                      onCreate={() => toast.info("Funcionalidad futura.")}
                      createNewFontSetButton={content.createNewFontSetButton}
                      emptyPlaceholder={content.placeholderFontsNone}
                    />
                  </TabsContent>
                  <TabsContent value="geometry" className="mt-4">
                    <GeometrySelector
                      geometries={geometries}
                      selectedGeometryName={localConfig.radiusPreset}
                      onSelect={handleGeometrySelect}
                      onPreview={(geometry: Geometry | null) =>
                        handlePreviewUpdate({
                          radiusPreset: geometry ? geometry.name : null,
                        })
                      }
                      onCreate={() => toast.info("Funcionalidad futura.")}
                      createNewRadiusStyleButton={
                        content.createNewRadiusStyleButton
                      }
                      emptyPlaceholder={content.placeholderRadiiNone}
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
// RUTA: src/components/features/campaign-suite/Step3_Theme/_components/ThemeComposerModal.tsx
