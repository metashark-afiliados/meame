// scripts/diagnostics/diag-cloudinary.ts
/**
 * @file diag-cloudinary.ts
 * @description Herramienta de diagnóstico atómica para la conexión con Cloudinary.
 * @version 1.1.0 (Linter Hygiene Fix)
 * @author RaZ Podestá - MetaShark Tech
 * @usage pnpm diag:cloudinary
 */
import chalk from "chalk";
import { v2 as cloudinary } from "cloudinary";
import { loadEnvironment } from "./_utils";

async function checkCloudinary() {
  console.clear();
  console.log(
    chalk.cyan.bold("🖼️  Iniciando Diagnóstico de Conexión a Cloudinary...")
  );

  loadEnvironment([
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ]);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log(
    chalk.gray(
      `   - Conectando al Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`
    )
  );

  try {
    const result = await cloudinary.api.ping();
    if (result?.status !== "ok") {
      throw new Error(
        `La respuesta del ping no fue 'ok', fue '${result?.status}'.`
      );
    }
    console.log(
      chalk.green(
        "\n✅ Conexión con Cloudinary exitosa. Las credenciales son válidas."
      )
    );
    console.log(
      chalk.green.bold(
        "\n✨ Diagnóstico de Cloudinary completado. ¡La conexión es saludable!"
      )
    );
  } catch (error) {
    console.error(
      chalk.red.bold(
        "\n❌ [FALLO] No se pudo autenticar con la API de Cloudinary."
      )
    );
    console.error(
      chalk.yellow(
        "   - Verifica que tus CLOUDINARY_CLOUD_NAME, API_KEY, y API_SECRET sean correctos."
      )
    );
    // --- CORRECCIÓN DE HIGIENE APLICADA AQUÍ ---
    console.error(chalk.red("\nError detallado:"), error);
    // ------------------------------------------
    process.exit(1);
  }
}

checkCloudinary();
// scripts/diagnostics/diag-cloudinary.ts
