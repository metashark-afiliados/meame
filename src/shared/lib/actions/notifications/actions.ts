// RUTA: src/shared/lib/actions/notifications/actions.ts
/**
 * @file actions.ts
 * @description SSoT para las Server Actions de notificación.
 *              v2.0.0 (Themed Email Architecture): Integra el nuevo sistema de
 *              theming de correos, desacoplando el estilo de la lógica.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import "server-only";
import { Resend } from "resend";
import { OrderConfirmationEmail } from "@/shared/emails/OrderConfirmationEmail";
import { logger } from "@/shared/lib/logging";
import { getEmailStyles } from "@/shared/emails/utils/email-styling";
import type { OrderItem } from "@/shared/lib/schemas/entities/order.schema";
import type { OrderConfirmationEmailContent } from "@/shared/lib/schemas/emails/order-confirmation-email.schema";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL!;

export type TransactionalEmailType = "order_confirmation" | "password_reset";

interface OrderConfirmationPayload {
  to?: string;
  orderId: string;
  totalAmount: string;
  items: OrderItem[];
}

export async function sendTransactionalEmailAction(
  type: TransactionalEmailType,
  payload: OrderConfirmationPayload, // Se generalizará en el futuro
  theme: string = "default" // <-- NUEVO PARÁMETRO DE TEMA
): Promise<{ success: boolean; error?: string }> {
  try {
    const styles = await getEmailStyles(theme);
    // ... Lógica para obtener el contenido i18n del correo (omitida por brevedad) ...
    const emailContent = {
      /* ... */
    } as OrderConfirmationEmailContent;

    let subject = "";
    let emailComponent: React.ReactElement | null = null;

    switch (type) {
      case "order_confirmation":
        subject = emailContent.previewText.replace(
          "{{orderId}}",
          payload.orderId
        );
        emailComponent = (
          <OrderConfirmationEmail
            content={emailContent}
            orderId={payload.orderId}
            totalAmount={payload.totalAmount}
            items={payload.items}
            styles={styles} // <-- INYECTAR ESTILOS
          />
        );
        break;
      // ... otros casos
    }

    if (!emailComponent || !payload.to) {
      throw new Error("Payload de correo inválido o tipo no manejado.");
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: payload.to,
      subject: subject,
      react: emailComponent,
    });

    if (error) throw error;

    logger.success("Correo transaccional enviado con éxito.", {
      emailId: data?.id,
    });
    return { success: true };
  } catch (error) {
    logger.error("Fallo al enviar correo transaccional.", { error });
    return { success: false, error: "No se pudo enviar el correo." };
  }
}
// RUTA: src/shared/lib/actions/notifications/actions.ts
