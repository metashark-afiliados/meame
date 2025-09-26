// RUTA: scripts/supabase/_utils.ts
/**
 * @file _utils.ts
 * @description Helper de utilidad soberano para los scripts de Supabase.
 *              v4.0.0 (Module Resolution & Elite Compliance): Refactorizado para
 *              utilizar importaciones de espacio de nombres, resolviendo los errores
 *              TS1192 y TS1259 bajo la configuración "NodeNext". Cumple con los
 *              7 Pilares de Calidad.
 * @version 4.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import chalk from "chalk";
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE] ---
// Se utiliza la importación de espacio de nombres para ser compatible con módulos CJS
// bajo la configuración "moduleResolution": "NodeNext".
import * as dotenv from "dotenv";
import * as path from "path";
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

/**
 * @function loadEnvironment
 * @description Carga y valida las variables de entorno desde el archivo .env.local.
 *              Lanza un error crítico si faltan las variables requeridas.
 * @returns {void}
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

  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

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
