// scripts/diagnostics/diag-cloudinary-schema.ts
/**
 * @file diag-cloudinary-schema.ts
 * @description Herramienta de auditoría para inspeccionar la configuración y "esquema" de Cloudinary.
 * @author Raz Podestá - MetaShark Tech
 * @version 5.0.0 (Double Type Assertion Fix)
 */
import { v2 as cloudinary } from "cloudinary";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { loadEnvironment } from "./_utils";

interface UploadPreset {
  name: string;
  settings: {
    folder?: string;
  };
}

interface Transformation {
  name: string;
  used: boolean;
}

interface MetadataField {
  label: string;
  external_id: string;
  type: string;
}

// Este tipo local representa la respuesta REAL de la API.
interface CorrectMetadataFieldsApiResponse {
  fields: MetadataField[];
}

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
      `\n🔬 Auditando configuración de Cloudinary para el cloud: '${process.env.CLOUDINARY_CLOUD_NAME}'...`
    )
  );

  const fullReport: Record<string, unknown> = {};

  try {
    const [presets, transformations, tags, metadataFieldsResponse] =
      await Promise.all([
        cloudinary.api.upload_presets(),
        cloudinary.api.transformations(),
        cloudinary.api.tags(),
        // --- INICIO DE CORRECCIÓN DE ÉLITE: Doble Aserción ---
        // Se utiliza `as unknown` para eliminar el tipo incorrecto antes de aplicar el nuestro.
        cloudinary.api.list_metadata_fields() as unknown as Promise<CorrectMetadataFieldsApiResponse>,
        // --- FIN DE CORRECCIÓN DE ÉLITE ---
      ]);

    const metadataFields: MetadataField[] = metadataFieldsResponse.fields || [];

    fullReport.upload_presets = presets.presets;
    fullReport.transformations = transformations.transformations;
    fullReport.tags = tags.tags;
    fullReport.metadata_fields = metadataFields;

    console.log(chalk.blueBright.bold("\n--- PRESETS DE SUBIDA ---"));
    console.table(
      presets.presets.map((p: UploadPreset) => ({
        Nombre: p.name,
        Opciones: `${p.settings.folder ? `Carpeta: ${p.settings.folder}` : ""}`,
      }))
    );

    console.log(chalk.blueBright.bold("\n--- TRANSFORMACIONES GUARDADAS ---"));
    console.table(
      transformations.transformations.map((t: Transformation) => ({
        Nombre: t.name,
        Usada: t.used,
      }))
    );

    console.log(chalk.blueBright.bold("\n--- ETIQUETAS (TAGS) EN USO ---"));
    console.log(tags.tags.join(", "));

    console.log(
      chalk.blueBright.bold("\n--- CAMPOS DE METADATOS ESTRUCTURADOS ---")
    );
    if (metadataFields.length > 0) {
      console.table(
        metadataFields.map((f: MetadataField) => ({
          Label: f.label,
          External_ID: f.external_id,
          Tipo: f.type,
        }))
      );
    } else {
      console.log(
        chalk.yellow("No se encontraron campos de metadatos definidos.")
      );
    }

    const reportDir = path.resolve(process.cwd(), "cloudinary/reports");
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    const reportPath = path.resolve(
      reportDir,
      `latest-schema-diagnostics.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
    console.log(
      chalk.blueBright.bold(
        `\n📄 Reporte de esquema JSON guardado en: ${chalk.yellow(reportPath)}`
      )
    );
  } catch (error) {
    console.error(
      chalk.red.bold("\n🔥 Fallo al auditar el esquema de Cloudinary:"),
      error
    );
    process.exit(1);
  }
}

main()
  .then(() =>
    console.log(
      chalk.green.bold("\n\n✅ Auditoría de esquema de Cloudinary completada.")
    )
  )
  .catch((error) => {
    console.error(
      chalk.red.bold("\n🔥 Fallo irrecuperable en el script:"),
      error.message
    );
    process.exit(1);
  });
// scripts/diagnostics/diag-cloudinary-schema.ts
