// app/[locale]/store/[slug]/page.tsx
/**
 * @file page.tsx
 * @description Página de detalle de producto, con todas las importaciones y tipos corregidos.
 * @version 3.0.0 (Holistic Integrity Fix & Elite Compliance)
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { i18n, type Locale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { Container } from "@/components/ui";
import { ProductGallery } from "@/components/sections/ProductGallery";
import { ProductInfo } from "@/components/sections/ProductInfo";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { getProducts, getProductBySlug } from "@/shared/lib/commerce";
import { DeveloperErrorDisplay } from "@/components/dev";
import type { Product } from "@/shared/lib/schemas/entities/product.schema";

interface ProductDetailPageProps {
  params: { locale: Locale; slug: string };
}

export async function generateStaticParams(): Promise<
  { locale: Locale; slug: string }[]
> {
  logger.info(
    "[SSG] Iniciando generación de parámetros estáticos para productos..."
  );
  const products = await getProducts({ locale: i18n.defaultLocale });

  // --- [INICIO DE CORRECCIÓN DE TIPO `ANY`] ---
  const paths = i18n.supportedLocales.flatMap((locale: Locale) =>
    products.map((product: Product) => ({
      locale,
      slug: product.slug,
    }))
  );
  // --- [FIN DE CORRECCIÓN DE TIPO `ANY`] ---

  logger.success(
    `[SSG] Se generarán ${paths.length} rutas de producto estáticas.`
  );
  return paths;
}

export async function generateMetadata({
  params: { locale, slug },
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductBySlug({ locale, slug });
  if (!product) {
    return { title: "Producto no encontrado" };
  }
  return {
    title: product.name,
    description: product.description, // Asume que 'description' existe en el tipo Product para SEO
  };
}

export default async function ProductDetailPage({
  params: { locale, slug },
}: ProductDetailPageProps) {
  logger.info(
    `[ProductDetailPage] Renderizando v3.0 (Elite) para slug: "${slug}", locale: ${locale}`
  );

  const [{ dictionary, error: dictError }, product] = await Promise.all([
    getDictionary(locale),
    getProductBySlug({ locale, slug }),
  ]);

  const content = dictionary[slug as keyof typeof dictionary];

  if (dictError || !product || !content) {
    const errorMessage = `Fallo al cargar datos para la página del producto [slug: ${slug}]`;
    logger.error(`[ProductDetailPage] ${errorMessage}`, {
      dictError,
      productExists: !!product,
      contentExists: !!content,
    });
    if (process.env.NODE_ENV === "production") return notFound();
    return (
      <DeveloperErrorDisplay
        context="ProductDetailPage"
        errorMessage={errorMessage}
        errorDetails={
          dictError ||
          `Producto o contenido i18n para slug '${slug}' no encontrado.`
        }
      />
    );
  }

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
// app/[locale]/store/[slug]/page.tsx
