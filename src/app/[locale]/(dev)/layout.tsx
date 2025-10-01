// RUTA: src/app/[locale]/(dev)/layout.tsx
/**
 * @file layout.tsx
 * @description Layout Raíz del Developer Command Center (DCC), inspirado en Canva.
 *              Forjado con una arquitectura de 3 paneles, header polimórfico,
 *              inyección de MEA/UX y seguridad de tipos absoluta.
 * @version 12.0.0 (Definitive & Aligned)
 *@author RaZ Podestá - MetaShark Tech
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
  const traceId = logger.startTrace(`DevLayout_Render_v12.0:${locale}`);
  logger.startGroup(`[DevLayout] Ensamblando UI del DCC para [${locale}]...`);

  try {
    const [dictionaryResult, fragmentsResult, cartResult] = await Promise.all([
      getDictionary(locale),
      loadAllThemeFragmentsAction(),
      getCart(),
    ]);

    const initialCart = reshapeCartForStore(cartResult);
    const { dictionary, error } = dictionaryResult;
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

    if (
      error ||
      !header ||
      !languageSwitcher ||
      !userNav ||
      !notificationBell ||
      !devLoginPage ||
      !cart ||
      !devRouteMenu ||
      !suiteStyleComposer ||
      !devDashboardPage?.magicBento
    ) {
      throw new Error(
        "Contenido i18n esencial para el layout del DCC está ausente o incompleto."
      );
    }
    if (!fragmentsResult.success) {
      throw new Error(
        `No se pudieron cargar los fragmentos de tema: ${fragmentsResult.error}`
      );
    }

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
      devDashboardPage.magicBento.cards.map((card) => ({
        name: card.title,
        description: card.description,
        href: toolMetadata[card.title]?.href || `/${locale}/dev`,
        icon: toolMetadata[card.title]?.icon || "HelpCircle",
      }));

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
    logger.error("[DevLayout] Fallo crítico al renderizar el layout del DCC.", {
      error: errorMessage,
      traceId,
    });
    return (
      <DeveloperErrorDisplay
        context="DevLayout"
        errorMessage="No se pudo construir el layout del Developer Command Center."
        errorDetails={error instanceof Error ? error : errorMessage}
      />
    );
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
