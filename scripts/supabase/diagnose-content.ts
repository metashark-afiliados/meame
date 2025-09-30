// RUTA: scripts/supabase/diagnose-content.ts
/**
 * @file diagnose-content.ts
 * @description Herramienta de auditoría de contenido, ahora resiliente y
 *              100% compatible con el Contrato del Orquestador de Scripts.
 * @version 4.0.0 (Orchestrator-Compliant & Resilient)
 * @author L.I.A. Legacy
 */
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";
import { promises as fs } from "fs";
import * as path from "path";
import { loadEnvironment } from "./_utils";
import type { ActionResult } from "../../src/shared/lib/types/actions.types";

// --- [INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
async function diagnoseContent(): Promise<ActionResult<string>> {
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
    chalk.cyan(`\n📊 Iniciando censo de contenido en el entorno remoto...`)
  );

  const { data: report, error } = await supabaseAdmin.rpc(
    "get_content_diagnostics"
  );

  if (error) {
    return {
      success: false,
      error: `Fallo al ejecutar RPC 'get_content_diagnostics': ${error.message}`,
    };
  }

  console.log(chalk.green("✅ Censo de contenido completado."));

  if (!report) {
    console.warn(
      chalk.yellow(
        "La base de datos devolvió un resultado vacío. No hay datos que mostrar."
      )
    );
    return { success: true, data: "La RPC no devolvió datos." };
  }

  console.log(chalk.blueBright.bold(`\n--- CENSO DE ENTIDADES ---`));
  console.table(
    Object.entries(report.entity_counts ?? {}).map(([Tabla, Registros]) => ({
      Tabla,
      Registros,
    }))
  );

  console.log(chalk.blueBright.bold(`\n--- MÉTRICAS DE RELACIÓN ---`));
  console.table(
    Object.entries(report.relationship_metrics ?? {}).map(
      ([Metrica, Valor]) => ({
        Metrica,
        Valor:
          typeof Valor === "number" && Valor !== null
            ? Valor.toFixed(2)
            : "N/A",
      })
    )
  );

  console.log(chalk.blueBright.bold(`\n--- DISTRIBUCIÓN DE ESTADOS ---`));
  console.log(
    chalk.white("Sitios:"),
    report.status_distribution?.sites || { "N/A": 0 }
  );
  console.log(
    chalk.white("Campañas:"),
    report.status_distribution?.campaigns || { "N/A": 0 }
  );

  console.log(chalk.blueBright.bold(`\n--- SALUD DEL SISTEMA ---`));
  console.table(
    Object.entries(report.system_health ?? {}).map(([Metrica, Valor]) => ({
      Metrica,
      Valor,
    }))
  );

  const reportDir = path.resolve(process.cwd(), "supabase/reports");
  await fs.mkdir(reportDir, { recursive: true });
  const reportPath = path.resolve(reportDir, `latest-content-diagnostics.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  const relativePath = path.relative(process.cwd(), reportPath);

  console.log(
    chalk.blueBright.bold(
      `\n📄 Reporte JSON completo guardado en: ${chalk.yellow(relativePath)}`
    )
  );

  return { success: true, data: `Reporte guardado en: ${relativePath}` };
}

export default diagnoseContent;
// --- [FIN DE REFACTORIZACIÓN ARQUITECTÓNICA] ---
