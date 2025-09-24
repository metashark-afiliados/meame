// scripts/supabase/diagnose-schema.ts
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { loadEnvironment } from "./_utils";

/**
 * @file diagnose-schema.ts
 * @description Herramienta de auditoría de sistema de élite. Invoca la RPC
 *              `get_system_diagnostics`, persiste el resultado como un snapshot JSON
 *              y muestra un resumen formateado en la consola.
 * @author Raz Podestá - MetaShark Tech & Raz Podestá
 * @version 4.0.0
 * @usage pnpm diag:schema
 */

/**
 * @private
 * @function printSection
 * @description Renderiza una sección del reporte en la consola en formato tabular.
 * @param {string} title - El título de la sección.
 * @param {any[] | null} data - El array de datos a mostrar.
 */
function printSection(title: string, data: any[] | null) {
  console.log(chalk.blueBright.bold(`\n--- ${title.toUpperCase()} ---`));
  if (data && data.length > 0) {
    console.table(data);
  } else {
    console.log(chalk.yellow("No se encontraron datos para esta sección."));
  }
}

async function main() {
  console.clear();
  loadEnvironment();

  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Variables de Supabase no definidas en .env.local");
  }

  const supabaseAdmin = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  console.log(
    chalk.cyan(`\n🔬 Iniciando auditoría de esquema en el entorno remoto...`)
  );

  const { data, error } = await supabaseAdmin.rpc("get_system_diagnostics");

  if (error) {
    throw new Error(
      `Fallo al ejecutar RPC 'get_system_diagnostics': ${error.message}`
    );
  }

  console.log(
    chalk.green("✅ RPC 'get_system_diagnostics' ejecutada con éxito.")
  );

  // Renderizar en consola
  printSection("Columnas del Esquema", data.schema_columns);
  printSection("Políticas RLS", data.rls_policies);
  printSection("Funciones y Procedimientos", data.functions_and_procedures);
  printSection("Triggers", data.triggers);
  printSection("Restricciones de Tabla", data.table_constraints);
  printSection("Índices", data.indexes);
  printSection("Extensiones", data.extensions);

  // Persistir en archivo JSON
  const reportDir = path.resolve(process.cwd(), "supabase/reports");
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.resolve(reportDir, `latest-schema-diagnostics.json`);

  fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));

  console.log(
    chalk.blueBright.bold(
      `\n📄 Reporte JSON completo guardado en: ${chalk.yellow(reportPath)}`
    )
  );
}

main()
  .then(() =>
    console.log(chalk.green.bold("\n\n✅ Auditoría del esquema completada."))
  )
  .catch((error) => {
    console.error(
      chalk.red.bold("\n🔥 Fallo irrecuperable en el script:"),
      error.message
    );
    process.exit(1);
  });
// scripts/supabase/diagnose-schema.ts
