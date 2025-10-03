// RUTA: scripts/supabase/diagnose-schema.ts
/**
 * @file diagnose-schema.ts
 * @description Herramienta de auditoría de sistema de élite, con seguridad de tipos
 *              absoluta y compatible con el orquestador de scripts.
 * @version 6.0.0 (Type-Safe & Functional Restoration)
 * @author L.I.A. Legacy
 */
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";
import { promises as fs } from "fs";
import * as path from "path";
import { loadEnvironment } from "./_utils";
import { scriptLogger, type ScriptActionResult } from "../_utils/script-logger";

// --- [INICIO DE REFACTORIZACIÓN DE ÉLITE: SEGURIDAD DE TIPOS ABSOLUTA] ---

// Contratos de tipos que modelan la respuesta de la RPC de Supabase
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

// Se define un tipo de unión soberano para erradicar el uso de 'any'.
type ReportData =
  | SchemaColumn[]
  | RlsPolicy[]
  | FunctionOrProcedure[]
  | Trigger[]
  | TableConstraint[]
  | Index[]
  | Extension[];

/**
 * @function printSection
 * @description Imprime una sección del reporte en formato de tabla, ahora 100% type-safe.
 */
function printSection(title: string, data: ReportData | null) {
  console.log(chalk.blueBright.bold(`\n--- ${title.toUpperCase()} ---`));
  if (data && data.length > 0) {
    console.table(data);
  } else {
    console.log(chalk.yellow("No se encontraron datos para esta sección."));
  }
}

// --- [FIN DE REFACTORIZACIÓN DE ÉLITE] ---

async function diagnoseSchema(): Promise<ScriptActionResult<string>> {
  const traceId = scriptLogger.startTrace("diagnoseSupabaseSchema_v6.0");
  scriptLogger.startGroup("🔬 Auditando esquema de Supabase...");

  try {
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
    scriptLogger.traceEvent(traceId, "Cliente de Supabase creado.");

    const { data, error } = await supabaseAdmin.rpc("get_system_diagnostics");

    if (error) {
      throw new Error(
        `Fallo al ejecutar RPC 'get_system_diagnostics': ${error.message}`
      );
    }
    scriptLogger.success(
      "✅ RPC 'get_system_diagnostics' ejecutada con éxito."
    );

    const report = data as SystemDiagnostics;

    printSection("Columnas del Esquema", report.schema_columns);
    printSection("Políticas RLS", report.rls_policies);
    printSection("Funciones y Procedimientos", report.functions_and_procedures);
    printSection("Triggers", report.triggers);
    printSection("Restricciones de Tabla", report.table_constraints);
    printSection("Índices", report.indexes);
    printSection("Extensiones", report.extensions);

    const reportDir = path.resolve(process.cwd(), "reports", "supabase");
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.resolve(
      reportDir,
      `latest-schema-diagnostics.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    const relativePath = path.relative(process.cwd(), reportPath);

    console.log(
      chalk.blueBright.bold(
        `\n📄 Reporte JSON completo guardado en: ${chalk.yellow(relativePath)}`
      )
    );

    return { success: true, data: `Reporte guardado en: ${relativePath}` };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    scriptLogger.error("Fallo crítico durante la auditoría de esquema.", {
      error: errorMessage,
      traceId,
    });
    return { success: false, error: errorMessage };
  } finally {
    scriptLogger.endGroup();
    scriptLogger.endTrace(traceId);
  }
}

export default diagnoseSchema;
