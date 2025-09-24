// Ruta correcta: src/components/dev/ComponentMetadataPanel.tsx
/**
 * @file src/components/dev/ComponentMetadataPanel.tsx
 * @description Componente de presentación para mostrar los metadatos de un componente.
 *              v2.1.0 (Sovereign Path Fix): Se corrige la ruta de importación de
 *              branding.config.ts para que apunte a su SSoT canónica.
 * @version 2.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Palette, Ruler, Text, LayoutGrid } from "lucide-react";
import { GLOBAL_DESIGN_TOKENS } from "@/shared/lib/config/branding.config";
import type { AssembledTheme } from "@/shared/lib/schemas/theming/assembled-theme.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

type PanelContent = NonNullable<Dictionary["componentCanvas"]>;

interface ComponentMetadataPanelProps {
  appliedTheme: AssembledTheme | null;
  componentProps: Record<string, unknown>;
  content: Pick<PanelContent, "metadataPanelPropsLabel">;
}

export function ComponentMetadataPanel({
  appliedTheme,
  componentProps,
  content,
}: ComponentMetadataPanelProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 border border-muted/50 rounded-lg bg-secondary/20">
      <div>
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4" /> Tema y Colores
        </h3>
        <pre className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded max-h-40 overflow-auto">
          {JSON.stringify(
            appliedTheme?.colors || GLOBAL_DESIGN_TOKENS.colors,
            null,
            2
          )}
        </pre>
      </div>
      <div>
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-2">
          <Text className="h-4 w-4" /> Tipografía
        </h3>
        <pre className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded max-h-40 overflow-auto">
          {JSON.stringify(
            appliedTheme?.fonts || GLOBAL_DESIGN_TOKENS.fonts,
            null,
            2
          )}
        </pre>
      </div>
      <div className="md:col-span-2">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-2">
          <Ruler className="h-4 w-4" /> Breakpoints
        </h3>
        <pre className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded">
          {JSON.stringify(GLOBAL_DESIGN_TOKENS.breakpoints, null, 2)}
        </pre>
      </div>
      <div className="md:col-span-2">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-2">
          <LayoutGrid className="h-4 w-4" /> {content.metadataPanelPropsLabel}
        </h3>
        <pre className="text-xs text-muted-foreground bg-secondary/30 p-2 rounded max-h-60 overflow-auto">
          {JSON.stringify(componentProps, null, 2)}
        </pre>
      </div>
    </div>
  );
}
