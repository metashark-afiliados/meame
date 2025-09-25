// scripts/supabase/diagnose-schema.ts
/**
 * @file diagnose-schema.ts
 * @description Herramienta de auditoría de sistema de élite. Invoca la RPC
 *              `get_system_diagnostics`, persiste el resultado como un snapshot JSON
 *              y muestra un resumen formateado en la consola.
 * @version 4.0.0
 * @author Raz Podestá - MetaShark Tech & Raz Podestá
 * @usage pnpm diag:schema
 */
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";
// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: Integridad de Módulos] ---
// Se corrige la sintaxis de importación para ser compatible con tsconfig.scripts.json (NodeNext)
import * as fs from "fs";
import * as path from "path";
// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---
import { loadEnvironment } from "./_utils";

// --- INICIO DE REFACTORIZACIÓN DE ÉLITE: Contratos de Tipo Soberanos y Completos ---
// Se definen tipos explícitos para cada pieza de la respuesta de la RPC.
interface SchemaColumn {
  table: string;
  column: string;
  type: string;
}

interface RlsPolicy {
  table: string;
  policy_name: string;
  command: string;
  definition: string | null;
}

interface FunctionOrProcedure {
  name: string;
  type: "FUNCTION" | "PROCEDURE";
}

interface Trigger {
  trigger_name: string;
  table: string;
  timing: string;
  event: string;
}

interface TableConstraint {
  table: string;
  constraint_name: string;
  type: string;
}

interface Index {
  table: string;
  index_name: string;
}

interface Extension {
  name: string;
  version: string;
}

// El contrato maestro que modela la respuesta completa de la RPC.
interface SystemDiagnostics {
  schema_columns: SchemaColumn[] | null;
  rls_policies: RlsPolicy[] | null;
  functions_and_procedures: FunctionOrProcedure[] | null;
  triggers: Trigger[] | null;
  table_constraints: TableConstraint[] | null;
  indexes: Index[] | null;
  extensions: Extension[] | null;
}

// Tipo de unión para el parámetro de la función de presentación.
type ReportData =
  | SchemaColumn[]
  | RlsPolicy[]
  | FunctionOrProcedure[]
  | Trigger[]
  | TableConstraint[]
  | Index[]
  | Extension[];
// --- FIN DE REFACTORIZACIÓN DE ÉLITE ---

/**
 * @private
 * @function printSection
 * @description Renderiza una sección del reporte en la consola en formato tabular.
 * @param {string} title - El título de la sección.
 * @param {ReportData | null} data - El array de datos a mostrar.
 */
function printSection(title: string, data: ReportData | null) {
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

  // --- INICIO DE REFACTORIZACIÓN DE ÉLITE: Aserción de Tipo en Tiempo de Ejecución ---
  const report = data as SystemDiagnostics;
  // --- FIN DE REFACTORIZACIÓN DE ÉLITE ---

  console.log(
    chalk.green("✅ RPC 'get_system_diagnostics' ejecutada con éxito.")
  );

  // Renderizar en consola usando la función de presentación pura y tipada
  printSection("Columnas del Esquema", report.schema_columns);
  printSection("Políticas RLS", report.rls_policies);
  printSection("Funciones y Procedimientos", report.functions_and_procedures);
  printSection("Triggers", report.triggers);
  printSection("Restricciones de Tabla", report.table_constraints);
  printSection("Índices", report.indexes);
  printSection("Extensiones", report.extensions);

  // Persistir en archivo JSON
  const reportDir = path.resolve(process.cwd(), "supabase/reports");
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.resolve(reportDir, `latest-schema-diagnostics.json`);

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

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
