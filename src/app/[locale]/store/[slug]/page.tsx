// RUTA: src/app/[locale]/store/[slug]/page.tsx
/**
 * @file page.tsx
 * @description Página de detalle de producto, ahora con validación de contrato de élite.
 * @version 4.0.0 (Data Contract Guardian)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { supportedLocales, type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { Container } from "@/components/ui";
import { ProductGallery } from "@/components/sections/ProductGallery";
import { ProductInfo } from "@/components/sections/ProductInfo";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { getProducts, getProductBySlug } from "@/shared/lib/commerce";
import { DeveloperErrorDisplay } from "@/components/dev";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";
import { ProductDetailPageContentSchema } from "@/shared/lib/schemas/pages/product-detail-page.schema";

// ... (generateStaticParams y generateMetadata sin cambios) ...
export async function generateStaticParams(): Promise<
  { locale: Locale; slug: string }[]
> {
  const products = await getProducts({ locale: "es-ES" });
  const paths = supportedLocales.flatMap((locale) =>
    products.map((product: Product) => ({
      locale,
      slug: product.slug,
    }))
  );
  return paths;
}

export async function generateMetadata({
  params: { locale, slug },
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductBySlug({ locale, slug });
  if (!product) return { title: "Producto no encontrado" };
  return { title: product.name, description: product.description };
}

interface ProductDetailPageProps {
  params: { locale: Locale; slug: string };
}

export default async function ProductDetailPage({
  params: { locale, slug },
}: ProductDetailPageProps) {
  logger.info(
    `[ProductDetailPage] Renderizando v4.0 (Guardian) para slug: "${slug}"`
  );

  const [{ dictionary, error: dictError }, product] = await Promise.all([
    getDictionary(locale),
    getProductBySlug({ locale, slug }),
  ]);

  const dynamicContent = dictionary[slug as keyof typeof dictionary];

  // --- [INICIO DE GUARDIA DE CONTRATO ZOD] ---
  const contentValidation =
    ProductDetailPageContentSchema.safeParse(dynamicContent);

  if (dictError || !product || !contentValidation.success) {
    const errorMessage = `Fallo al cargar o validar datos para la página del producto [slug: ${slug}]`;
    logger.error(`[ProductDetailPage] ${errorMessage}`, {
      dictError,
      productExists: !!product,
      validationSuccess: contentValidation.success,
      validationErrors:
        !contentValidation.success && contentValidation.error.flatten(),
    });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="ProductDetailPage"
        errorMessage={errorMessage}
        errorDetails={
          dictError ||
          (!contentValidation.success && contentValidation.error) ||
          `Producto o contenido i18n para slug '${slug}' no encontrado o inválido.`
        }
      />
    );
  }

  const content = contentValidation.data;
  // --- [FIN DE GUARDIA DE CONTRATO ZOD] ---

  const allProducts = await getProducts({ locale });
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        p.categorization.primary === product.categorization.primary
    )
    .slice(0, 3);

  const headersList = headers();
  const host = headersList.get("host") || "global-fitwell.com";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const absoluteUrl = `${protocol}://${host}/${locale}/store/${slug}`;

  return (
    <Container className="py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <ProductGallery images={content.galleryImages} />
        <ProductInfo
          product={product}
          content={content}
          absoluteUrl={absoluteUrl}
        />
      </div>

      {relatedProducts.length > 0 && dictionary.storePage && (
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            {content.relatedProductsTitle}
          </h2>
          <ProductGrid
            products={relatedProducts}
            locale={locale}
            content={dictionary.storePage}
          />
        </div>
      )}
    </Container>
  );
}
// RUTA: src/app/[locale]/store/[slug]/page.tsx
