// RUTA: src/app/[locale]/(dev)/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Raíz Soberano del DCC. Forjado con un Guardián de Resiliencia
 *              de Contrato de Datos definitivo para una seguridad de tipos absoluta.
 * @version 15.0.0 (Definitive Type Safety & Elite Resilience)
 * @author L.I.A. Legacy
 */
import "server-only";
import React from "react";
import Link from "next/link";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";
import type { Locale } from "@/shared/lib/i18n/i18n.config";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { loadAllThemeFragmentsAction } from "@/shared/lib/actions/campaign-suite";
import HeaderClient from "@/components/layout/HeaderClient";
import {
  DynamicIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { DevThemeSwitcher } from "@/components/features/dev-tools/DevThemeSwitcher";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import DevToolsDropdown from "@/components/features/dev-tools/DevToolsDropdown";
import { DevRouteMenuContentSchema } from "@/shared/lib/schemas/components/dev/dev-route-menu.schema";
import type { LucideIconName } from "@/shared/lib/config/lucide-icon-names";
import { getCart } from "@/shared/lib/commerce/cart";
import { reshapeCartForStore } from "@/shared/lib/commerce/shapers";
import { BentoCardData } from "@/components/razBits/MagicBento/magic-bento.schema";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";

// --- CONTRATOS DE TIPO SOBERANOS ---
interface SidebarTool {
  name: string;
  description: string;
  href: string;
  icon: LucideIconName;
}

type DevRouteMenuContent = z.infer<typeof DevRouteMenuContentSchema>;

interface DevLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

// --- SUB-COMPONENTES ATÓMICOS CON MEA/UX ---
const DCCSidebar = ({ tools }: { tools: SidebarTool[] }) => (
  <aside className="w-16 bg-card border-r flex flex-col items-center py-4 space-y-2">
    <TooltipProvider delayDuration={0}>
      {tools.map((tool) => (
        <Tooltip key={tool.name}>
          <TooltipTrigger asChild>
            <Link
              href={tool.href}
              className="p-3 rounded-lg transition-all duration-200 ease-in-out hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]"
            >
              <DynamicIcon name={tool.icon} className="h-6 w-6" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{tool.name}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  </aside>
);

const DCCSubNav = ({ dictionary }: { dictionary: DevRouteMenuContent }) => (
  <div className="w-64 bg-background border-r p-6">
    <h2 className="font-bold text-lg mb-4">Navegación Rápida</h2>
    <DevToolsDropdown dictionary={dictionary} />
  </div>
);

// --- COMPONENTE PRINCIPAL (SERVER SHELL) ---
export default async function DevLayout({
  children,
  params: { locale },
}: DevLayoutProps) {
  const traceId = logger.startTrace(`DevLayout_Render_v15.0:${locale}`);
  logger.startGroup(`[DCC Layout Shell] Ensamblando UI para [${locale}]...`);

  try {
    logger.traceEvent(traceId, "Iniciando obtención de datos en paralelo...");
    const [dictionaryResult, fragmentsResult, cartResult] = await Promise.all([
      getDictionary(locale),
      loadAllThemeFragmentsAction(),
      getCart(),
    ]);
    logger.traceEvent(traceId, "Todas las fuentes de datos respondieron.");

    const initialCart = reshapeCartForStore(cartResult);
    const { dictionary, error } = dictionaryResult;

    // --- [INICIO] GUARDIÁN DE RESILIENCIA DE CONTRATO DE DATOS DEFINITIVO ---
    const requiredKeys: (keyof Dictionary)[] = [
      "header",
      "toggleTheme",
      "languageSwitcher",
      "userNav",
      "notificationBell",
      "devLoginPage",
      "cart",
      "devRouteMenu",
      "suiteStyleComposer",
      "devDashboardPage",
    ];
    const missingKeys = requiredKeys.filter((key) => !dictionary[key]);
    const isDevDashboardContentMissing =
      !dictionary.devDashboardPage?.magicBento;

    if (error || missingKeys.length > 0 || isDevDashboardContentMissing) {
      if (isDevDashboardContentMissing)
        missingKeys.push("devDashboardPage.magicBento");
      throw new Error(
        `Faltan datos de i18n esenciales para el layout del DCC. Claves ausentes: ${missingKeys.join(", ")}`
      );
    }
    logger.traceEvent(
      traceId,
      "Contrato de diccionario i18n validado con éxito."
    );

    const {
      header,
      toggleTheme,
      languageSwitcher,
      userNav,
      notificationBell,
      devLoginPage,
      cart,
      devRouteMenu,
      suiteStyleComposer,
      devDashboardPage,
    } = dictionary;
    // --- [FIN] GUARDIÁN DE RESILIENCIA DE CONTRATO DE DATOS DEFINITIVO ---

    if (!fragmentsResult.success) {
      throw new Error(
        `No se pudieron cargar los fragmentos de tema: ${fragmentsResult.error}`
      );
    }
    logger.traceEvent(traceId, "Fragmentos de tema cargados con éxito.");

    const headerContent = {
      header,
      toggleTheme,
      languageSwitcher,
      userNav,
      notificationBell,
      devLoginPage,
      cart,
    };

    const toolMetadata: Record<string, { href: string; icon: LucideIconName }> =
      {
        "La Forja (SDC)": {
          href: `/${locale}/creator/campaign-suite`,
          icon: "LayoutTemplate",
        },
        "El Arsenal (BAVI)": {
          href: `/${locale}/dev/bavi`,
          icon: "LibraryBig",
        },
        "La Bóveda (RaZPrompts)": {
          href: `/${locale}/dev/raz-prompts`,
          icon: "BrainCircuit",
        },
        "El Motor (CogniRead)": {
          href: `/${locale}/dev/cogniread`,
          icon: "BookOpenCheck",
        },
        "El Sistema Nervioso (Nos3)": {
          href: `/${locale}/dev/nos3`,
          icon: "Video",
        },
        "El Laboratorio": {
          href: `/${locale}/dev/test-page`,
          icon: "TestTube",
        },
      };

    const devToolsForSidebar: SidebarTool[] =
      devDashboardPage.magicBento.cards.map((card: BentoCardData) => ({
        name: card.title,
        description: card.description,
        href: toolMetadata[card.title]?.href || `/${locale}/dev`,
        icon: toolMetadata[card.title]?.icon || "HelpCircle",
      }));

    logger.success(
      "[DCC Layout Shell] Ensamblaje de datos completado. Renderizando UI...",
      { traceId }
    );
    return (
      <>
        <HeaderClient
          user={null}
          profile={null}
          logoUrl={header.logoUrl}
          content={headerContent}
          currentLocale={locale}
          supportedLocales={["es-ES", "it-IT", "en-US", "pt-BR"]}
          centerComponent={<DevToolsDropdown dictionary={devRouteMenu} />}
          rightComponent={
            <DevThemeSwitcher
              allThemeFragments={fragmentsResult.data}
              content={suiteStyleComposer}
            />
          }
          initialCart={initialCart}
        />
        <div className="flex" style={{ height: "calc(100vh - 81px)" }}>
          <DCCSidebar tools={devToolsForSidebar} />
          <DCCSubNav dictionary={devRouteMenu} />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-8">
            {children}
          </main>
        </div>
      </>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[DCC Layout Shell] Fallo crítico al renderizar el layout.", {
      error: errorMessage,
      traceId,
    });
    return (
      <DeveloperErrorDisplay
        context="DevLayout (Server Shell)"
        errorMessage="No se pudo construir el layout del Developer Command Center."
        errorDetails={error instanceof Error ? error : errorMessage}
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
