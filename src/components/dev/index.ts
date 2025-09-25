// Ruta correcta: src/components/dev/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública para los componentes específicos del DCC.
 *              v6.0.0 (Holistic Path Realignment): Se corrigen todas las rutas de
 *              exportación para que apunten a las ubicaciones canónicas de las
 *              features, resolviendo una cascada de errores de build.
 * @version 6.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
export * from "./DevThemeSwitcher";
export * from "./SuiteStyleComposerModal";
export * from "@/components/features/dev-tools/SuiteStyleComposer/GranularInputControl";
export * from "@/components/features/dev-tools/SuiteStyleComposer/_components/SuiteColorsTab";
export * from "@/components/features/dev-tools/SuiteStyleComposer/SuiteTypographyTab";
export * from "@/components/features/dev-tools/SuiteStyleComposer/SuiteGeometryTab";
export * from "@/components/features/dev-tools/SuiteStyleComposer/ComposerHeader";
export * from "@/components/features/dev-tools/SuiteStyleComposer/ComposerFooter";
export * from "@/components/features/dev-tools/SuiteStyleComposer/use-dev-theme-manager";
export * from "./DeveloperErrorDisplay";
