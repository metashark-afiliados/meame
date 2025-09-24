// RUTA: scripts/run-with-env.ts
/**
 * @file run-with-env.ts
 * @description Inyector de entorno de élite para ejecutar scripts de Node.js.
 * @version 2.1.0 (Robust Module Imports)
 * @author RaZ Podestá - MetaShark Tech
 * @usage tsx scripts/run-with-env.ts <ruta-al-script>
 */
// --- [INICIO DE CORRECCIÓN DE ÉLITE] ---
// Se utiliza la sintaxis de importación de espacio de nombres para máxima compatibilidad.
import * as dotenv from "dotenv";
import * as path from "path";
// --- [FIN DE CORRECCIÓN DE ÉLITE] ---
import chalk from "chalk";
import { pathToFileURL } from "url";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runScript() {
  const scriptPath = process.argv[2];

  if (!scriptPath) {
    console.error(
      chalk.red.bold(
        "❌ Error: No se especificó la ruta del script a ejecutar."
      )
    );
    console.error(
      chalk.yellow("   Uso: pnpm tsx scripts/run-with-env.ts <ruta-al-script>")
    );
    process.exit(1);
  }

  try {
    console.log(
      chalk.blue(`🚀 Ejecutando script con entorno inyectado: ${scriptPath}`)
    );

    const absolutePath = path.resolve(process.cwd(), scriptPath);
    const scriptUrl = pathToFileURL(absolutePath).href;
    await import(scriptUrl);
  } catch (error) {
    console.error(
      chalk.red.bold(`🔥 Fallo crítico al ejecutar el script '${scriptPath}':`),
      error
    );
    process.exit(1);
  }
}

runScript();
