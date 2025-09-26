// RUTA: src/shared/lib/actions/campaign-suite/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública para las Server Actions de la SDC.
 *              v3.0.0 (Holistic Export & Production Readiness): Se añaden las
 *              exportaciones para las acciones de ciclo de vida del borrador
 *              basadas en la base de datos.
 * @version 3.0.0
 * @author RaZ Podestá - MetaShark Tech
 */

export * from "./getThemeFragments.action";
export * from "./saveCampaignAsset.action";
export * from "./publishCampaign.action";
export * from "./packageCampaign.action";
export * from "./getBaseCampaigns.action";
export * from "./saveAsTemplate.action";
export * from "./loadTemplate.action";
export * from "./getTemplates.action"; // Mantenido por si es usado en otro lugar
export * from "./getCampaignTemplates.action"; // <-- EXPORTACIÓN RESTAURADA
export * from "./draft.actions"; // <-- NUEVA EXPORTACIÓN HOLÍSTICA
export * from "./deleteDraft.action"; // <-- NUEVA EXPORTACIÓN HOLÍSTICA
