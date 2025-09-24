// RUTA: shared/lib/shopify/fragments/image.ts
import "server-only";
export const imageFragment = /* GraphQL */ `
  fragment image on Image {
    url
    altText
    width
    height
  }
`;
