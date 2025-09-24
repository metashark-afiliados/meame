// scripts/diagnostics/_utils.ts
/**
 * @file _utils.ts
 * @description Utilidad compartida para cargar y validar el entorno para scripts de diagnóstico.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 */
import chalk from "chalk";
import dotenv from "dotenv";
import path from "path";

/**
 * @function loadEnvironment
 * @description Carga las variables desde .env.local y valida la existencia de un
 *              conjunto de claves requeridas.
 * @param {string[]} requiredKeys - Un array de claves que deben existir en process.env.
 * @throws {Error} Si alguna de las claves requeridas no está definida.
 */
export function loadEnvironment(requiredKeys: string[]): void {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    console.error(
      chalk.red.bold(
        `\n❌ [FALLO DE ENTORNO] Faltan las siguientes variables requeridas en tu archivo .env.local:`
      )
    );
    missingKeys.forEach((key) => console.error(chalk.yellow(`  - ${key}`)));
    process.exit(1);
  }
}
// scripts/diagnostics/_utils.ts
