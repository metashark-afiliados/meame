// RUTA: scripts/data/dump-all-tables-content.ts
/**
 * @file dump-all-tables-content.ts
 * @description Script de diagnóstico de élite para realizar un volcado completo y
 *              estructurado del contenido de todas las tablas públicas de Supabase.
 *              Genera un informe detallado para su análisis y depuración.
 * @version 4.1.0 (RPC-Driven & Resilient)
 * @author L.I.A. Legacy (IA Ingeniera de Software Senior)
 */
import { promises as fs } from "fs";
import * as path from "path";
import chalk from "chalk";
import { createScriptClient } from "../supabase/script-client";
import { logger } from "../../src/shared/lib/logging";
import type { ActionResult } from "../../src/shared/lib/types/actions.types";

interface ContentDumpReport {
  metadata: {
    generatedAt: string;
    environmentUrl: string;
    tablesProcessed: number;
    tablesWithErrors: number;
    totalRecordsDumped: number;
  };
  data: Record<
    string,
    { count: number; records: unknown[] } | { error: string }
  >;
}

async function dumpAllTablesContent(): Promise<ActionResult<string>> {
  const traceId = logger.startTrace("dumpAllTablesContent_v4.1");
  logger.startGroup(
    "[DB Dumper] Iniciando volcado de contenido de Supabase (v4.1)..."
  );
  const supabase = createScriptClient();

  try {
    logger.info(
      "Paso 1: Obteniendo la lista de tablas vía RPC 'get_public_table_names'..."
    );
    // --- [INICIO DE CORRECCIÓN DE CAUSA RAÍZ] ---
    // Se invoca la función RPC en lugar de consultar pg_tables directamente.
    const { data: tablesData, error: rpcError } = await supabase.rpc(
      "get_public_table_names"
    );

    if (rpcError) throw rpcError;
    // --- [FIN DE CORRECCIÓN DE CAUSA RAÍZ] ---

    const tableNames = tablesData.map((t: { table_name: string }) => t.table_name);

    logger.success(
      `Se han encontrado ${tableNames.length} tablas para procesar.`
    );

    const report: ContentDumpReport = {
      metadata: {
        generatedAt: new Date().toISOString(),
        environmentUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Desconocido",
        tablesProcessed: 0,
        tablesWithErrors: 0,
        totalRecordsDumped: 0,
      },
      data: {},
    };

    logger.info("Paso 2: Procesando cada tabla individualmente...");
    for (const tableName of tableNames) {
      report.metadata.tablesProcessed++;
      logger.trace(`   -> Procesando tabla: '${tableName}'...`);

      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select("*");

      if (tableError) {
        report.metadata.tablesWithErrors++;
        const errorMessage = `Fallo al obtener datos: ${tableError.message}`;
        report.data[tableName] = { error: errorMessage };
        logger.warn(`   ⚠️  Error en tabla '${tableName}': ${errorMessage}`);
      } else {
        const recordCount = tableData.length;
        report.data[tableName] = {
          count: recordCount,
          records: tableData,
        };
        report.metadata.totalRecordsDumped += recordCount;
        logger.trace(
          `      ✅ Éxito: Se volcaron ${recordCount} registros de '${tableName}'.`
        );
      }
    }
    logger.success(
      `Procesamiento de tablas finalizado. ${report.metadata.tablesWithErrors} tablas fallaron.`
    );

    logger.info("Paso 3: Escribiendo el informe de volcado en el disco...");
    const reportDir = path.resolve(process.cwd(), "supabase", "reports");
    await fs.mkdir(reportDir, { recursive: true });
    // Se cambia el nombre del archivo para no sobreescribir el de `diagnose-content`
    const reportPath = path.resolve(reportDir, "latest-full-content-dump.json");
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    const relativePath = path.relative(process.cwd(), reportPath);
    console.log(
      chalk.green.bold(
        `\n📄 Informe de volcado de contenido guardado exitosamente en: ${chalk.yellow(
          relativePath
        )}`
      )
    );

    return {
      success: true,
      data: `Informe de ${report.metadata.tablesProcessed} tablas guardado en: ${relativePath}`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Fallo crítico durante el proceso de volcado.", { error });
    return {
      success: false,
      error: `No se pudo completar el volcado: ${errorMessage}`,
    };
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

// Cumple con el Contrato del Orquestador al exportar por defecto.
export default dumpAllTablesContent;
