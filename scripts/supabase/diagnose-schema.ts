// RUTA: scripts/supabase/diagnose-schema.ts
/**
 * @file diagnose-schema.ts
 * @description Herramienta de auditoría de sistema de élite, ahora 100% compatible
 *              con el Contrato del Orquestador de Scripts.
 * @version 5.0.0 (Orchestrator-Compliant)
 *@author RaZ Podestá - MetaShark Tech
 */
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";
import { promises as fs } from "fs";
import * as path from "path";
import { loadEnvironment } from "./_utils";
import type { ActionResult } from "../../src/shared/lib/types/actions.types";

// --- Se mantienen las interfaces de tipos ---
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
interface SystemDiagnostics {
  schema_columns: SchemaColumn[] | null;
  rls_policies: RlsPolicy[] | null;
  functions_and_procedures: FunctionOrProcedure[] | null;
  triggers: Trigger[] | null;
  table_constraints: TableConstraint[] | null;
  indexes: Index[] | null;
  extensions: Extension[] | null;
}
type ReportData =
  | SchemaColumn[]
  | RlsPolicy[]
  | FunctionOrProcedure[]
  | Trigger[]
  | TableConstraint[]
  | Index[]
  | Extension[];

function printSection(title: string, data: ReportData | null) {
  console.log(chalk.blueBright.bold(`\n--- ${title.toUpperCase()} ---`));
  if (data && data.length > 0) {
    console.table(data);
  } else {
    console.log(chalk.yellow("No se encontraron datos para esta sección."));
  }
}

// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
async function diagnoseSchema(): Promise<ActionResult<string>> {
  console.clear();
  loadEnvironment();

  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return {
      success: false,
      error: "Variables de Supabase no definidas en .env.local",
    };
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
    return {
      success: false,
      error: `Fallo al ejecutar RPC 'get_system_diagnostics': ${error.message}`,
    };
  }

  const report = data as SystemDiagnostics;

  console.log(
    chalk.green("✅ RPC 'get_system_diagnostics' ejecutada con éxito.")
  );

  printSection("Columnas del Esquema", report.schema_columns);
  printSection("Políticas RLS", report.rls_policies);
  printSection("Funciones y Procedimientos", report.functions_and_procedures);
  printSection("Triggers", report.triggers);
  printSection("Restricciones de Tabla", report.table_constraints);
  printSection("Índices", report.indexes);
  printSection("Extensiones", report.extensions);

  const reportDir = path.resolve(process.cwd(), "supabase/reports");
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.resolve(reportDir, `latest-schema-diagnostics.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  const relativePath = path.relative(process.cwd(), reportPath);

  console.log(
    chalk.blueBright.bold(
      `\n📄 Reporte JSON completo guardado en: ${chalk.yellow(relativePath)}`
    )
  );

  return { success: true, data: `Reporte guardado en: ${relativePath}` };
}

export default diagnoseSchema;
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
