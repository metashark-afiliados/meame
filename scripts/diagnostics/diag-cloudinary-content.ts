// scripts/diagnostics/diag-cloudinary-content.ts
/**
 * @file diag-cloudinary-content.ts
 * @description Herramienta de auditoría para realizar un censo de contenido en Cloudinary.
 * @author Raz Podestá - MetaShark Tech
 * @version 2.0.0 (ESM Fix & Type Safety)
 */
import { v2 as cloudinary } from "cloudinary";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { loadEnvironment } from "./_utils";

// --- INICIO DE REFACTORIZACIÓN: Tipos para respuestas de API ---
interface Resource {
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  uploaded_at: string;
}
// --- FIN DE REFACTORIZACIÓN ---

async function main() {
  console.clear();
  loadEnvironment([
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ]);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log(
    chalk.cyan(
      `\n📊 Realizando censo de contenido en Cloudinary para el cloud: '${process.env.CLOUDINARY_CLOUD_NAME}'...`
    )
  );

  const fullReport: Record<string, unknown> = {};

  try {
    const [usage, resources] = await Promise.all([
      cloudinary.api.usage(),
      cloudinary.search
        .expression("resource_type:image")
        .sort_by("uploaded_at", "desc")
        .max_results(10)
        .execute(),
    ]);

    fullReport.usage_summary = usage;
    fullReport.recent_assets = resources.resources;

    console.log(chalk.blueBright.bold(`\n--- RESUMEN DE USO ---`));
    console.table([
      { Métrica: "Plan", Valor: usage.plan },
      {
        Métrica: "Almacenamiento (GB)",
        Valor: (usage.storage.usage / 1e9).toFixed(3),
      },
      { Métrica: "Transformaciones", Valor: usage.transformations.usage },
      {
        Métrica: "Ancho de Banda (GB)",
        Valor: (usage.bandwidth.usage / 1e9).toFixed(3),
      },
      { Métrica: "Total de Activos", Valor: resources.total_count },
    ]);

    console.log(chalk.blueBright.bold(`\n--- ÚLTIMOS 10 ACTIVOS SUBIDOS ---`));
    if (resources.resources.length > 0) {
      console.table(
        resources.resources.map((r: Resource) => ({
          "Public ID": r.public_id,
          Dimensiones: `${r.width}x${r.height}`,
          Formato: r.format,
          "Tamaño (KB)": (r.bytes / 1024).toFixed(2),
          "Fecha de Subida": new Date(r.uploaded_at).toLocaleString(),
        }))
      );
    } else {
      console.log(chalk.yellow("No se encontraron activos."));
    }

    const reportDir = path.resolve(process.cwd(), "cloudinary/reports");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    const reportPath = path.resolve(
      reportDir,
      `latest-content-diagnostics.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
    console.log(
      chalk.blueBright.bold(
        `\n📄 Reporte de contenido JSON guardado en: ${chalk.yellow(reportPath)}`
      )
    );
  } catch (error) {
    console.error(
      chalk.red.bold(
        "\n🔥 Fallo al realizar el censo de contenido en Cloudinary:"
      ),
      error
    );
    process.exit(1);
  }
}

main()
  .then(() =>
    console.log(
      chalk.green.bold("\n\n✅ Censo de contenido de Cloudinary completado.")
    )
  )
  .catch((error) => {
    console.error(
      chalk.red.bold("\n🔥 Fallo irrecuperable en el script:"),
      error.message
    );
    process.exit(1);
  });
// scripts/diagnostics/diag-cloudinary-content.ts
