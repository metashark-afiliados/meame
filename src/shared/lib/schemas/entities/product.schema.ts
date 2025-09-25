// RUTA: src/shared/lib/schemas/entities/product.schema.ts
/**
 * @file product.schema.ts
 * @description SSoT para el contrato de datos de la entidad Producto v2.1.
 *              Esta versión añade el campo 'description' para una representación
 *              completa de los datos del producto.
 * @version 2.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { z } from "zod";
import { logger } from "@/shared/lib/logging";

logger.trace("[Schema] Definiendo contrato para la entidad Producto v2.1.");

const InventorySchema = z.object({
  total: z.number().int().min(0),
  available: z.number().int().min(0),
  reserved: z.number().int().min(0).default(0),
});

const LogisticsSchema = z.object({
  deliveryTime: z.string(),
});

const ProducerSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  checkoutUrl: z.string().url(),
});

const CategorizationSchema = z.object({
  primary: z.string(),
  secondary: z.array(z.string()).optional(),
});

const TargetProfileSchema = z.object({
  userType: z.string().optional(),
  ageRange: z.string().optional(),
});

export const ProductOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(z.string()),
});

export const SelectedOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const ProductVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  availableForSale: z.boolean(),
  selectedOptions: z.array(SelectedOptionSchema),
  price: z.object({
    amount: z.string(),
    currencyCode: z.string(),
  }),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  // --- [INICIO DE REFACTORIZACIÓN DE CONTRATO] ---
  description: z.string().optional(), // La descripción ahora es parte del contrato.
  // --- [FIN DE REFACTORIZACIÓN DE CONTRATO] ---
  price: z.number().positive(),
  currency: z.string().length(3).default("EUR"),
  isBestseller: z.boolean().optional(),
  imageUrl: z.string().startsWith("/"),
  inventory: InventorySchema,
  logistics: LogisticsSchema,
  producerInfo: ProducerSchema,
  categorization: CategorizationSchema,
  targetProfile: TargetProfileSchema,
  rating: z.number().min(0).max(5).optional(),
  options: z.array(ProductOptionSchema).optional(),
  variants: z.array(ProductVariantSchema).optional(),
});

export const ProductCatalogSchema = z.object({
  products: z.array(ProductSchema),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductOption = z.infer<typeof ProductOptionSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
