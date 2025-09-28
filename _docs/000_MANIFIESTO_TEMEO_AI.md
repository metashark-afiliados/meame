/**
 * @file 001_MANIFIESTO_TEMEO_AI.md
 * @description Manifiesto Soberano para TEMEO (The Elite Motor of AI).
 *              Define la visión, arquitectura y contratos de la capa de
 *              integración de IA para el ecosistema Webvork.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */

# Manifiesto TEMEO: The Elite Motor of AI

## 1. Visión y Filosofía Raíz: "IA como un Servicio Centralizado y Soberano"

**TEMEO** es el **corazón generativo** de nuestro ecosistema. Su misión no es simplemente conectar con una API, sino orquestar la inteligencia artificial como un servicio interno robusto, escalable y seguro. Actúa como una capa de abstracción que protege al resto de la aplicación de las complejidades de los proveedores de IA específicos.

## 2. Pilares Arquitectónicos

TEMA se construye sobre cuatro pilares innegociables:

1.  **Soberanía:** Es un módulo completamente independiente (`/shared/lib/ai`). No tiene conocimiento de sus consumidores (`CogniRead`, `BAVI`, etc.). Se comunica a través de contratos de datos estrictos (Schemas de Zod).
2.  **Escalabilidad (Agnosticismo):** La arquitectura separa el "qué" (la acción, ej. `generateText`) del "cómo" (el proveedor, ej. `Gemini`). Esto nos permitirá añadir nuevos proveedores en el futuro sin refactorizar los módulos consumidores.
3.  **Seguridad por Defecto:** Toda la lógica de TEMA es `server-only`. Las claves de API y la comunicación directa con los LLMs nunca se exponen al cliente.
4.  **Observabilidad Total:** Cada petición y respuesta a través de TEMA es trazable y observable, cumpliendo con el Pilar III de Calidad.

## 3. Implementación Inicial: Dominio Gemini v1.0

La primera implementación de TEMA se centra en Google Gemini.

*   **Cliente (`gemini.client.ts`):** Un cliente de servidor que encapsula el SDK `@google/generative-ai`. Maneja la autenticación, la ejecución de prompts y el manejo de errores.
*   **Configuración (`models.config.ts`):** Un manifiesto que define los modelos de Gemini disponibles (ej. `gemini-pro`, `gemini-1.5-flash`), permitiendo que la UI sea dinámica.
*   **Contratos (`gemini.schemas.ts`):** Schemas de Zod que validan las peticiones (`GenerateTextRequestSchema`) y las respuestas, garantizando la seguridad de tipos.

## 4. SSoT de Datos: Contratos de Petición y Respuesta

```typescript

// src/shared/lib/ai/gemini.schemas.ts (Ejemplo)

// Contrato para una petición de generación de texto
export const GenerateTextRequestSchema = z.object({
  prompt: z.string().min(10),
  modelId: z.enum(["gemini-1.5-flash", "gemini-pro"]),
});

// Contrato para la respuesta
export const GenerateTextResponseSchema = z.object({
  generatedText: z.string(),
});
5. Flujo de Uso Canónico (Ej. CogniRead)
Un Server Component o Server Action en el dominio CogniRead necesita extraer datos de un estudio.
Importa el cliente gemini desde la fachada de TEMA (@/shared/lib/ai).
Construye el prompt utilizando el "Prompt Maestro" de CogniRead.
Llama a gemini.generateText({ prompt, modelId: 'gemini-1.5-flash' }).
TEMA valida la petición, se comunica de forma segura con la API de Gemini y devuelve una respuesta validada.
CogniRead recibe el texto estructurado y lo procesa.
6. Roadmap Futuro
v1.1: Abstracción de la API. Crear una interfaz TEMA.generateText que internamente pueda enrutar a gemini.generateText u otro proveedor.
v1.2: Soporte para Vertex AI.
v2.0: Implementación de caché de respuestas para reducir costes y latencia.
