// RUTA: src/components/features/dev-tools/SuiteStyleComposer/_components/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública para los componentes de UI atómicos del Suite Style Composer.
 *              v2.0.0 (Build Integrity Restoration): Se añaden las extensiones de
 *              archivo explícitas para cumplir con la SSoT de resolución de módulos
 *              y restaurar la integridad del build.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: RESOLUCIÓN DE MÓDULOS EXPLÍCITA] ---
// Se añade la extensión .tsx a cada exportación para eliminar la ambigüedad
// y garantizar una resolución de módulos predecible y robusta.
export * from "./ComposerFooter.tsx";
export * from "./ComposerHeader.tsx";
export * from "./GranularInputControl.tsx";
export * from "./SuiteColorsTab.tsx";
export * from "./SuiteGeometryTab.tsx";
export * from "./SuiteTypographyTab.tsx";
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---
