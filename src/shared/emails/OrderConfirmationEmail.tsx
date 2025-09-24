// components/emails/OrderConfirmationEmail.tsx
/**
 * @file OrderConfirmationEmail.tsx
 * @description Plantilla de React Email de élite para la confirmación de pedido.
 *              v2.1.0 (Holistic Contract & Linter Fix): Alineado con el contrato
 *              de datos soberano que ahora incluye los ítems del pedido,
 *              resolviendo todos los errores de tipo y de linting.
 * @version 2.1.0
 * @author RaZ Podestá - MetaShark Tech
 */
import React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
  Img,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import { logger } from "@/shared/lib/logging";
import type {
  OrderConfirmationPayload,
  OrderItem,
} from "@/shared/lib/schemas/notifications/transactional.schema";

interface OrderConfirmationEmailProps {
  payload: OrderConfirmationPayload;
}

// --- Estilos en línea para máxima compatibilidad con clientes de email ---
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const text = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
};

const boldText = {
  ...text,
  fontWeight: "bold",
};

const titleText = {
  ...boldText,
  fontSize: "24px",
  textAlign: "center" as const,
};

const section = {
  padding: "0 20px",
};

const logo = {
  margin: "0 auto",
};

export function OrderConfirmationEmail({
  payload,
}: OrderConfirmationEmailProps): React.ReactElement {
  logger.trace(
    "[React Email] Renderizando plantilla OrderConfirmationEmail v2.1"
  );
  const { orderId, totalAmount, items } = payload;
  const previewText = `Conferma del tuo ordine Global Fitwell #${orderId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Img
              src="https://res.cloudinary.com/metashark-tech/image/upload/v1726956294/webvork/assets/i-sybl-logo-fitwell-01/v1-original.png"
              width="150"
              alt="Global Fitwell Logo"
              style={logo}
            />
            <Text style={titleText}>Grazie per il tuo ordine!</Text>
            <Text style={text}>
              Ciao, abbiamo ricevuto il tuo ordine{" "}
              <strong style={boldText}>#{orderId}</strong>. Riceverai un'altra
              notifica quando il tuo ordine verrà spedito.
            </Text>
            <Hr />
            <Text style={boldText}>Riepilogo Ordine:</Text>
            {items.map((item: OrderItem) => (
              <Row key={item.variantId}>
                <Column style={text}>
                  {item.name} (x{item.quantity})
                </Column>
                <Column style={{ ...text, textAlign: "right" as const }}>
                  {new Intl.NumberFormat("it-IT", {
                    style: "currency",
                    currency: "EUR",
                  }).format(item.price * item.quantity)}
                </Column>
              </Row>
            ))}
            <Hr />
            <Row>
              <Column style={boldText}>Totale</Column>
              <Column style={{ ...boldText, textAlign: "right" as const }}>
                {totalAmount}
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
// components/emails/OrderConfirmationEmail.tsx
