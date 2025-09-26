// RUTA: scripts/validation/validate-sdc-config.ts
/**
 * @file validate-sdc-config.ts
 * @description Guardián de Integridad para la configuración de la SDC.
 * @version 3.0.0 (Isomorphic & Build-Resilient)
 * @author RaZ Podestá - MetaShark Tech
 */
import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: IMPORTACIÓN SOBERANA Y SEGURA] ---
// Se importa desde el nuevo archivo de configuración de solo datos.
import { stepsDataConfig } from "../../src/shared/lib/config/campaign-suite/wizard.data.config";
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

async function main() {
  console.log(
    chalk.blue.bold("🛡️  Ejecutando Guardián de Integridad de la SDC...")
  );
  let errorCount = 0;

  try {
    // La importación ahora es síncrona y segura.
    const { stepsConfig } = { stepsConfig: stepsDataConfig };

    for (const step of stepsConfig) {
      console.log(
        chalk.cyan(`   🔎 Verificando Paso ${step.id}: ${step.titleKey}`)
      );

      const i18nPath = path.resolve(
        process.cwd(),
        `src/messages/pages/dev/campaign-suite/steps/${step.i18nKey}.i18n.json`
      );

      try {
        await fs.access(i18nPath);
        console.log(
          chalk.gray(
            `     ✅ [i18n] Encontrado: ${path.relative(process.cwd(), i18nPath)}`
          )
        );
      } catch {
        console.error(
          chalk.red.bold(
            `     🔥 [i18n] ¡NO ENCONTRADO!: ${path.relative(
              process.cwd(),
              i18nPath
            )}`
          )
        );
        errorCount++;
      }
    }

    if (errorCount > 0) {
      console.error(
        chalk.red.bold(
          `\n❌ Validación fallida. Se encontraron ${errorCount} rutas de archivo rotas.`
        )
      );
      process.exit(1);
    } else {
      console.log(
        chalk.green.bold(
          "\n✅ Validación completada. La configuración de la SDC es coherente."
        )
      );
    }
  } catch (error) {
    console.error(
      chalk.red.bold("\n❌ Error crítico al ejecutar el guardián:"),
      error
    );
    process.exit(1);
  }
}

main();
