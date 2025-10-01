// RUTA: src/shared/lib/ai/index.ts
/**
 * @file index.ts (Barrel File)
 * @description Fachada pública para la Capa de Integración de IA Soberana.
 *              v2.0.0 (Architectural Fix): Se elimina la directiva "use server"
 *              para cumplir con el contrato de los módulos de servidor de Next.js.
 * @version 2.0.0
 *@author RaZ Podestá - MetaShark Tech
 */

// --- [CORRECCIÓN ARQUITECTÓNICA] ---
// Se elimina la directiva "use server"; de este archivo "barrel".
// --- [FIN DE CORRECCIÓN ARQUITECTÓNICA] ---

export * from "./gemini.client";
export * from "./gemini.schemas";
export * from "./models.config";
