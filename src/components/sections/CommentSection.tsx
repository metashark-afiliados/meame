// RUTA: src/components/sections/CommentSection.tsx
/**
 * @file CommentSection.tsx
 * @description Aparato "Server Shell" para la sección de comentarios, ahora con
 *              un manejo de errores con seguridad de tipos absoluta y código limpio.
 * @version 3.2.0 (Elite Code Hygiene)
 * @author L.I.A. Legacy - Asistente de Refactorización
 */
import "server-only";
import React from "react";
import { createServerClient } from "@/shared/lib/supabase/server";
import { getCommentsByArticleIdAction } from "@/shared/lib/actions/cogniread";
import { getDictionary } from "@/shared/lib/i18n/i18n";
import { defaultLocale } from "@/shared/lib/i18n/i18n.config";
import { logger } from "@/shared/lib/logging";
import { Container, Separator } from "@/components/ui";
import { DeveloperErrorDisplay } from "@/components/features/dev-tools";
import { CommentSectionClient } from "./comments/CommentSectionClient";

interface CommentSectionProps {
  articleId: string;
  articleSlug: string;
}

export async function CommentSection({
  articleId,
  articleSlug,
}: CommentSectionProps) {
  const traceId = logger.startTrace(`CommentSection_Shell_v3.2:${articleId}`);
  logger.startGroup(
    `[CommentSection Shell] Ensamblando datos para artículo ${articleId}...`
  );

  try {
    logger.traceEvent(traceId, "Iniciando obtención de datos en paralelo...");
    const [commentsResult, supabase, { dictionary, error: dictError }] =
      await Promise.all([
        getCommentsByArticleIdAction(articleId),
        createServerClient(),
        getDictionary(defaultLocale),
      ]);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    logger.traceEvent(traceId, "Datos de servidor obtenidos.");

    if (dictError || !dictionary.commentSection) {
      const error =
        dictError ||
        new Error("La clave 'commentSection' falta en el diccionario.");
      throw error;
    }
    if (!commentsResult.success) {
      throw new Error(commentsResult.error);
    }
    logger.traceEvent(
      traceId,
      "Contratos de datos validados. Delegando a cliente..."
    );

    return (
      <section className="py-12 sm:py-16">
        <Container className="max-w-4xl">
          <Separator className="my-8" />
          <h2 className="text-2xl font-bold mb-6">
            {dictionary.commentSection.title}
          </h2>
          <CommentSectionClient
            initialComments={commentsResult.data.comments}
            articleId={articleId}
            articleSlug={articleSlug}
            isAuthenticated={!!user}
            currentUser={
              user
                ? {
                    name: user.email!,
                    avatarUrl: user.user_metadata.avatar_url,
                  }
                : undefined
            }
            content={dictionary.commentSection}
            locale={defaultLocale}
          />
        </Container>
      </section>
    );
  } catch (error) {
    // --- [INICIO DE CORRECCIÓN DE HIGIENE DE CÓDIGO] ---
    // Se elimina la variable 'errorMessage' no utilizada.
    logger.error("[CommentSection Shell] Fallo crítico irrecuperable.", {
      error,
      traceId,
    });
    if (process.env.NODE_ENV === "development") {
      return (
        <Container className="max-w-4xl">
          <DeveloperErrorDisplay
            context="CommentSection Server Shell"
            errorMessage="No se pudo construir la sección de comentarios."
            errorDetails={error instanceof Error ? error : String(error)}
          />
        </Container>
      );
    }
    // --- [FIN DE CORRECCIÓN DE HIGIENE DE CÓDIGO] ---
    return null;
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}
