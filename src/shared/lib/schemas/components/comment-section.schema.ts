// shared/lib/schemas/components/comment-section.schema.ts
/**
 * @file comment-section.schema.ts
 * @description SSoT para el contrato de datos i18n del componente CommentSection.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import { z } from "zod";

export const CommentSectionContentSchema = z.object({
  title: z.string(),
  form: z.object({
    placeholder: z.string(),
    minCharactersError: z.string(),
    publishButton: z.string(),
    publishButtonLoading: z.string(),
    authRequiredMessage: z.string(),
    loginLinkText: z.string(),
  }),
  list: z.object({
    emptyState: z.string(),
  }),
});

export const CommentSectionLocaleSchema = z.object({
  commentSection: CommentSectionContentSchema.optional(),
});
