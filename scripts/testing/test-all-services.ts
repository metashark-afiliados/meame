// RUTA: scripts/testing/test-all-services.ts
/**
 * @file test-all-services.ts
 * @description Guardián de Integridad Total. Orquesta la ejecución de todos
 *              los scripts de diagnóstico y pruebas del ecosistema con una
 *              salida de élite para una máxima claridad.
 * @version 2.0.0
 * @author L.I.A. Legacy
 */
import { exec } from "child_process";
import chalk from "chalk";

const tests = [
  { name: "Supabase", command: "pnpm diag:supabase:all" },
  { name: "Cloudinary", command: "pnpm diag:cloudinary:all" },
  { name: "Shopify", command: "pnpm diag:shopify" },
  { name: "Stripe E2E Flow", command: "pnpm test:stripe" },
];

async function runTest(name: string, command: string): Promise<void> {
  console.log(chalk.cyan.bold(`\n\n===== INICIANDO PRUEBA: ${name} =====\n`));
  return new Promise((resolve, reject) => {
    // --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
    // Se utiliza el patrón de callback idiomático de `exec` para manejar la salida.
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        // El 'error' del callback ya incluye el código de salida y otra información.
        reject(new Error(`La prueba '${name}' falló.\n${stderr}`));
        return;
      }
      resolve();
    });

    // Redirigir la salida del proceso hijo a la consola del proceso principal en tiempo real.
    childProcess.stdout?.pipe(process.stdout);
    childProcess.stderr?.pipe(process.stderr);
    // --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
  });
}

async function main() {
  console.log(
    chalk.yellow.bold(
      "🚀 Iniciando Guardián de Integridad Total del Ecosistema..."
    )
  );
  try {
    for (const test of tests) {
      await runTest(test.name, test.command);
      console.log(
        chalk.green.bold(
          `\n===== PRUEBA ${test.name} COMPLETADA CON ÉXITO =====`
        )
      );
    }
    console.log(
      chalk.green.bold(
        "\n\n✅ ¡ÉXITO TOTAL! Todas las pruebas de integración de servicios pasaron."
      )
    );
  } catch (error) {
    console.error(
      chalk.red.bold(
        "\n\n❌ ¡FALLO CRÍTICO! Una o más pruebas de integración fallaron."
      )
    );
    if (error instanceof Error) {
      console.error(chalk.white(error.message));
    }
    process.exit(1);
  }
}

main();
