// RUTA: scripts/run-with-env.ts
/**
 * @file run-with-env.ts
 * @description Inyector de élite para entorno y resolución de rutas de TypeScript.
 * @version 3.1.0 (Resilient JSON Parsing)
 * @author RaZ Podestá - MetaShark Tech
 * @usage tsx scripts/run-with-env.ts <ruta-al-script>
 */
import * as dotenv from "dotenv";
import * as path from "path";
import chalk from "chalk";
import { pathToFileURL } from "url";
import { register } from "tsconfig-paths";
import { readFileSync } from "fs";
import { logger } from "../src/shared/lib/logging";

// --- INICIO DE INYECCIÓN DE RESOLUCIÓN DE RUTAS (VERSIÓN RESILIENTE) ---
try {
  const tsconfigPath = path.resolve(process.cwd(), "tsconfig.scripts.json");
  // Leer el archivo y eliminar los comentarios antes de parsear
  const tsconfigFileContent = readFileSync(tsconfigPath, "utf-8").replace(
    /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
    (m, g) => (g ? "" : m)
  );

  const tsconfig = JSON.parse(tsconfigFileContent);

  if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
    register({
      baseUrl: path.resolve(
        process.cwd(),
        tsconfig.compilerOptions.baseUrl || "."
      ),
      paths: tsconfig.compilerOptions.paths,
    });
    logger.trace(
      "[run-with-env] Resolución de alias de tsconfig registrada con éxito."
    );
  } else {
    logger.warn(
      "[run-with-env] No se encontraron 'paths' en tsconfig.scripts.json para registrar."
    );
  }
} catch (error) {
  logger.error(
    "[run-with-env] Fallo crítico al registrar los alias de tsconfig.",
    { error }
  );
  process.exit(1);
}
// --- FIN DE INYECCIÓN DE RESOLUCIÓN DE RUTAS ---

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

    process.env.NEXT_RUNTIME = "nodejs";

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
