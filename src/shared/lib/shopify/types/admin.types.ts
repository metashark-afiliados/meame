// RUTA: src/shared/lib/shopify/types/admin.types.ts
/**
 * @file admin.types.ts
 * @description SSoT para los contratos de tipos que modelan la Admin API de Shopify.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */

type Connection<T> = {
  edges: Array<{ node: T }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
};

type Money = {
  amount: string;
  currencyCode: string;
};

// --- Tipos de Inventario ---
export type ShopifyAdminInventoryItem = {
  tracked: boolean;
  unitCost: Money;
};

// --- Tipos de Variantes ---
export type ShopifyAdminProductVariant = {
  price: Money;
  inventoryItem: ShopifyAdminInventoryItem;
  inventoryQuantity: number;
};

// --- Tipos de Producto (Admin) ---
export type ShopifyAdminProduct = {
  id: string; // Global ID (ej. "gid://shopify/Product/12345")
  title: string;
  handle: string;
  status: string; // (ej. "ACTIVE", "ARCHIVED", "DRAFT")
  createdAt: string;
  updatedAt: string;
  variants: Connection<ShopifyAdminProductVariant>;
};

// --- Tipos de Operaciones de API (Admin) ---
export type ShopifyAdminProductsOperation = {
  data: {
    products: Connection<ShopifyAdminProduct>;
  };
  variables: {
    first: number;
    after?: string;
  };
};

export type ShopifyAdminProductOperation = {
  data: {
    product: ShopifyAdminProduct;
  };
  variables: {
    id: string;
  };
};
