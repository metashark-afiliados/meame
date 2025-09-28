// RUTA: src/components/features/campaign-suite/Step3_Theme/_components/ThemeComposerModal.tsx
/**
 * @file ThemeComposerModal.tsx
 * @description Orquestador modal para la Bóveda de Estilos, impulsado por base de datos.
 * @version 4.0.0 (Persistent Theme Preset Integration)
 * @author RaZ Podestá - MetaShark Tech
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

interface ThemeComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: CategorizedPresets;
  currentConfig: ThemeConfig;
  onSave: (newConfig: ThemeConfig) => void;
  onCreatePreset: (
    name: string,
    description: string,
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
    // ... y otras claves para los sub-componentes
  };
}

export function ThemeComposerModal({
  isOpen,
  onClose,
  presets,
  currentConfig,
  onSave,
  onCreatePreset,
  content,
}: ThemeComposerModalProps) {
  logger.info("[ThemeComposerModal] Renderizando v4.0 (Persistent Themes).");
  const [localConfig, setLocalConfig] = useState(currentConfig);
  const { setPreviewTheme } = usePreviewStore();

  const allPresets = useMemo(
    () => ({
      colors: [...presets.colors.global, ...presets.colors.workspace],
      fonts: [...presets.fonts.global, ...presets.fonts.workspace],
      geometry: [...presets.geometry.global, ...presets.geometry.workspace],
    }),
    [presets]
  );

  useEffect(() => {
    setLocalConfig(currentConfig);
  }, [currentConfig]);
  useEffect(() => {
    if (!isOpen) setPreviewTheme(null);
  }, [isOpen, setPreviewTheme]);

  const assemblePreviewTheme = (config: ThemeConfig): AssembledTheme | null => {
    const findPresetData = (
      type: "colors" | "fonts" | "geometry",
      name: string | null
    ): Partial<AssembledTheme> => {
      if (!name) return {};
      const preset = allPresets[type].find((p: ThemePreset) => p.name === name);
      // La configuración del tema está dentro de la propiedad 'theme_config' del preset
      return preset?.theme_config
        ? (preset.theme_config as Partial<AssembledTheme>)
        : {};
    };

    const colorData = findPresetData("colors", config.colorPreset);
    const fontData = findPresetData("fonts", config.fontPreset);
    const geometryData = findPresetData("geometry", config.radiusPreset);

    const finalTheme = deepMerge(deepMerge(colorData, fontData), geometryData);
    const validation = AssembledThemeSchema.safeParse(finalTheme);
    return validation.success ? validation.data : null;
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
                    {/* ... otras pestañas ... */}
                  </TabsList>
                  <TabsContent value="colors" className="mt-4">
                    {/* El PaletteSelector necesita ser refactorizado para aceptar la nueva estructura */}
                    <p className="text-center text-muted-foreground p-8">
                      PaletteSelector será refactorizado a continuación...
                    </p>
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
