// lib/mongodb.ts
/**
 * @file mongodb.ts
 * @description SSoT para la conexión a la base de datos de MongoDB.
 * @version 2.2.0 (Definitive Type Safety): Se añade una guardia explícita
 *              dentro de la función de conexión para una seguridad de tipos
 *              absoluta y a prueba de fallos.
 * @author RaZ Podestá - MetaShark Tech
 */
import { MongoClient } from "mongodb";
import { logger } from "@/shared/lib/logging";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
  throw new Error(
    "Error Crítico: La variable de entorno MONGODB_URI no está definida."
  );
}
if (!MONGODB_DB_NAME) {
  throw new Error(
    "Error Crítico: La variable de entorno MONGODB_DB_NAME no está definida."
  );
}

let cachedClientPromise: Promise<MongoClient> | null = null;

export async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClientPromise) {
    logger.trace("[MongoDB] Usando conexión de cliente cacheada.");
    return cachedClientPromise;
  }

  // --- [INICIO DE CORRECCIÓN DE SEGURIDAD DE TIPOS] ---
  // Esta guardia, aunque parezca redundante, es crucial para el análisis de
  // flujo de control de TypeScript dentro de esta función específica.
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI no está disponible en el entorno de ejecución."
    );
  }
  // --- [FIN DE CORRECCIÓN DE SEGURIDAD DE TIPOS] ---

  logger.info(
    "[MongoDB] Creando nueva conexión de cliente a la base de datos..."
  );

  const client = new MongoClient(MONGODB_URI);
  cachedClientPromise = client.connect();

  try {
    await cachedClientPromise;
    logger.success(
      "[MongoDB] Conexión a la base de datos establecida con éxito."
    );
  } catch (e) {
    logger.error("[MongoDB] Fallo al conectar con la base de datos.", { e });
    cachedClientPromise = null;
    throw e;
  }

  return cachedClientPromise;
}
// lib/mongodb.ts
