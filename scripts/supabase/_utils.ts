// scripts/supabase/_utils.ts
import chalk from "chalk";
import dotenv from "dotenv";
import path from "path";

/**
 * @file _utils.ts
 * @description Helper de utilidad compartido para los scripts de Supabase.
 *              Ha sido refactorizado a un estándar de élite para validar las
 *              variables de entorno canónicas, asegurando que las herramientas
 *              de diagnóstico y mantenimiento funcionen en un entorno local
 *              consistente con la nueva arquitectura de configuración.
 * @author Raz Podestá - MetaShark Tech
 * @version 3.0.0
 */
export function loadEnvironment(): void {
  const envFile = ".env.local";
  const envPath = path.resolve(process.cwd(), envFile);
  console.log(
    chalk.gray(
      `🔌 Cargando variables de entorno desde: ${chalk.yellow(envFile)}`
    )
  );

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error(
      chalk.red.bold(`❌ [ERROR CRÍTICO] Archivo de entorno no encontrado.`)
    );
    console.error(
      chalk.white(
        `Asegúrate de que el archivo ${chalk.yellow(
          envFile
        )} exista en la raíz del proyecto.`
      )
    );
    throw new Error(`No se pudo cargar el archivo de entorno: ${envFile}.`);
  }

  // --- INICIO DE REFACTORIZACIÓN: Alineación con SSoT Canónica ---
  // Se validan las claves estándar que deben existir en .env.local para que los
  // scripts funcionen correctamente en un entorno de desarrollo.
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_DB_URL_DIRECT",
  ];
  // --- FIN DE REFACTORIZACIÓN ---

  const missingVars = requiredVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error(
      chalk.red.bold(
        `❌ [ERROR CRÍTICO] Variables de entorno requeridas no definidas.`
      )
    );
    console.error(
      chalk.white(
        `Las siguientes variables deben estar definidas en tu archivo ${chalk.yellow(
          envFile
        )}:`
      )
    );
    missingVars.forEach((v) => console.error(chalk.yellow(`  - ${v}`)));
    throw new Error(
      "Configuración de entorno incompleta. Faltan variables críticas."
    );
  }

  console.log(chalk.green("✅ Variables de entorno cargadas y validadas."));
}

/**
 * =====================================================================
 *                           MEJORA CONTINUA
 * =====================================================================
 *
 * @subsection Melhorias Adicionadas
 * 1. **Sincronización con SSoT de Configuración**: ((Implementada)) El helper ahora valida la existencia de las variables de entorno estándar (`NEXT_PUBLIC_SUPABASE_URL`, etc.), alineándose con el nuevo `.env.example` y garantizando que los scripts de utilidad (como `diag:all`) funcionen correctamente en un entorno de desarrollo local.
 * 2. **Cero Regresiones**: ((Implementada)) La lógica de carga de `dotenv` se ha mantenido, asegurando la funcionalidad base.
 *
 * @subsection Melhorias Futuras
 * 1. **Validación de Formato**: ((Vigente)) El helper podría ser mejorado para no solo verificar la existencia de las variables, sino también su formato (ej. que la URL de Supabase sea una URL válida) para una detección de errores más proactiva.
 *
 * =====================================================================
 */
// scripts/supabase/_utils.ts
