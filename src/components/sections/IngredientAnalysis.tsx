// components/sections/IngredientAnalysis.tsx
/**
 * @file IngredientAnalysis.tsx
 * @description Sección de Análisis de Ingredientes.
 *              - v2.0.0: Adherido al contrato de props unificado.
 *              - v2.1.0 (Resilience): La prop `content` ahora es opcional.
 * @version 2.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import { Container } from "@/components/ui/Container";
import { logger } from "@/shared/lib/logging";
import type { Dictionary } from "@/shared/lib/schemas/i18n.schema";
import type { Ingredient } from "@/shared/lib/schemas/components/ingredient-analysis.schema";

interface IngredientAnalysisProps {
  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  content?: Dictionary["ingredientAnalysis"];
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---
}

export function IngredientAnalysis({
  content,
}: IngredientAnalysisProps): React.ReactElement | null {
  logger.info("[Observabilidad] Renderizando IngredientAnalysis");

  // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA] ---
  if (!content) {
    logger.warn(
      "[IngredientAnalysis] No se proporcionó contenido. La sección no se renderizará."
    );
    return null;
  }
  // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA] ---

  const { title, ingredients } = content;

  return (
    <section className="py-16 sm:py-24 bg-background">
      <Container>
        <h2 className="text-3xl font-bold text-center text-foreground mb-12 sm:text-4xl">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {ingredients.map((ingredient: Ingredient) => (
            <div
              key={ingredient.name}
              className="p-6 border border-white/10 rounded-lg text-center transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1"
            >
              <h3 className="text-xl font-bold text-primary mb-2">
                {ingredient.name}
              </h3>
              <p className="text-foreground/80">{ingredient.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
// components/sections/IngredientAnalysis.tsx
