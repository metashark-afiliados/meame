// RUTA: scripts/diagnostics/_utils.ts
/**
 * @file _utils.ts
 * @description Helper de utilidad compartido para los scripts de diagnóstico.
 * @author Raz Podestá - MetaShark Tech
 * @version 2.2.0 (Shopify Keys Added)
 */
import chalk from "chalk";
import * as dotenv from "dotenv";
import * as path from "path";

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
