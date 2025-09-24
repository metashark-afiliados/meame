// RUTA: shared/lib/schemas/entities/product.schema.ts
/**
 * @file product.schema.ts
 * @description SSoT para el contrato de datos de la entidad Producto v2.0.
 *              Esta versión introduce sub-schemas para Opciones y Variantes,
 *              estableciendo un contrato robusto para productos complejos.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

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

/**
 * @const ProductOptionSchema
 * @description Define una opción configurable de un producto (ej. "Color", "Talla").
 */
export const ProductOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.array(z.string()),
});

/**
 * @const SelectedOptionSchema
 * @description Define una opción específica seleccionada para una variante.
 */
export const SelectedOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

/**
 * @const ProductVariantSchema
 * @description Define una variante específica de un producto (una combinación de opciones).
 */
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

/**
 * @description El schema principal y soberano para la entidad Producto.
 */
export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
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
