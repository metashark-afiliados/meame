// scripts/validation/validate-sdc-config.ts
/**
 * @file validate-sdc-config.ts
 * @description Guardián de Integridad para la configuración de la SDC.
 * @version 1.2.0 (ESM Path Resolution Fix): Utiliza pathToFileURL para
 *              garantizar la compatibilidad con el cargador de módulos ESM de
 *              Node.js en todos los sistemas operativos, resolviendo el error
 *              ERR_UNSUPPORTED_ESM_URL_SCHEME en Windows.
 * @author RaZ Podestá - MetaShark Tech
 */
import { promises as fs } from "fs";
import path from "path";
import { pathToFileURL } from "url"; // <-- [INICIO DE SOLUCIÓN DE ÉLITE]
import chalk from "chalk";

const wizardConfigPath = path.resolve(
  process.cwd(),
  "app/[locale]/(dev)/dev/campaign-suite/_config/wizard.config.ts"
);

async function main() {
  console.log(
    chalk.blue.bold("🛡️  Ejecutando Guardián de Integridad de la SDC...")
  );
  let errorCount = 0;

  try {
    // Se convierte la ruta del sistema de archivos a una URL file://
    const wizardConfigUrl = pathToFileURL(wizardConfigPath).href;
    const { stepsConfig } = await import(wizardConfigUrl);
    // <-- [FIN DE SOLUCIÓN DE ÉLITE]

    for (const step of stepsConfig) {
      console.log(
        chalk.cyan(`   🔎 Verificando Paso ${step.id}: ${step.titleKey}`)
      );

      const i18nPath = path.resolve(process.cwd(), step.i18nPath);
      // La lógica para `schemaPath` debe ser ajustada si `step.schemaPath` existe
      // Asumiendo que ahora los schemas están co-ubicados o importados directamente
      // en el config, esta parte puede necesitar una revisión futura si la
      // estructura de `wizard.config.ts` cambia. Por ahora, nos centramos en i18n.

      try {
        await fs.access(i18nPath);
        console.log(chalk.gray(`     ✅ [i18n] Encontrado: ${step.i18nPath}`));
      } catch {
        console.error(
          chalk.red.bold(`     🔥 [i18n] ¡NO ENCONTRADO!: ${step.i18nPath}`)
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
