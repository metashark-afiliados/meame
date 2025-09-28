// RUTA: src/components/features/campaign-suite/TemplateBrowser/TemplateBrowser.tsx
/**
 * @file TemplateBrowser.tsx
 * @description Interfaz para seleccionar una plantilla de campaña o empezar de cero.
 *              Implementa una estrategia de caché inteligente para minimizar llamadas a la DB.
 * @version 5.0.0 (Intelligent Caching)
 * @author RaZ Podestá - MetaShark Tech
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useCampaignDraftStore } from "@/shared/lib/stores/campaign-draft.store";
import { useTemplateLoader } from "@/shared/hooks/campaign-suite/use-template-loader";
import { logger } from "@/shared/lib/logging";
import { TemplateCard } from "./_components/TemplateCard";
import { Separator } from "@/components/ui/Separator";
import { routes } from "@/shared/lib/navigation";
import { usePathname } from "next/navigation";
import { getCurrentLocaleFromPathname } from "@/shared/lib/utils/i18n/i18n.utils";
import { useWorkspaceStore } from "@/shared/lib/stores/use-workspace.store";
import { getCampaignTemplatesAction } from "@/shared/lib/actions/campaign-suite";
import { Skeleton } from "@/components/ui/Skeleton";

export function TemplateBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getCurrentLocaleFromPathname(pathname);
  const resetDraft = useCampaignDraftStore((s) => s.resetDraft);

  // --- LÓGICA DE CACHÉ INTELIGENTE ---
  const {
    activeWorkspaceId,
    templates,
    isLoadingTemplates,
    setTemplates,
    setLoadingTemplates,
  } = useWorkspaceStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Solo hacer fetch si hay un workspace activo y la caché de plantillas está vacía.
    if (activeWorkspaceId && templates.length === 0) {
      setLoadingTemplates(true);
      getCampaignTemplatesAction(activeWorkspaceId).then((result) => {
        if (result.success) {
          setTemplates(result.data);
        }
        // setLoadingTemplates(false) es llamado dentro de setTemplates
      });
    }
  }, [activeWorkspaceId, templates.length, setTemplates, setLoadingTemplates]);
  // --- FIN LÓGICA DE CACHÉ ---

  const { loadTemplate, isPending: isTemplateLoading } = useTemplateLoader(
    () => {
      router.push(routes.creatorCampaignSuite.path({ locale, stepId: ["0"] }));
    }
  );

  const handleStartFromScratch = () => {
    resetDraft();
    router.push(routes.creatorCampaignSuite.path({ locale, stepId: ["0"] }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    loadTemplate(templateId);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Inicia tu Próxima Obra Maestra
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Acelera tu creación adaptando una plantilla probada en batalla, o
          forja una nueva leyenda desde cero.
        </p>
      </div>

      <div className="my-12">
        <h2 className="text-2xl font-semibold mb-6">
          Desde tu Arsenal de Plantillas
        </h2>
        {isLoadingTemplates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => handleTemplateSelect(template.id)}
                isPending={
                  isTemplateLoading && selectedTemplateId === template.id
                }
              />
            ))}
          </div>
        ) : (
          <div className="py-16 border border-dashed rounded-lg text-center text-muted-foreground">
            <p className="font-semibold">Tu arsenal está vacío.</p>
            <p className="text-sm">
              Guarda una campaña como plantilla para verla aquí.
            </p>
          </div>
        )}
      </div>

      <div className="relative my-12">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-4 text-muted-foreground">O</span>
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={handleStartFromScratch}
          size="lg"
          variant="outline"
          disabled={isTemplateLoading}
        >
          Forjar desde Cero
        </Button>
      </div>
    </div>
  );
}
