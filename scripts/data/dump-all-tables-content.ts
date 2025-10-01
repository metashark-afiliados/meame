// RUTA: scripts/data/dump-all-tables-content.ts
/**
 * @file dump-all-tables-content.ts
 * @description Script de diagnóstico de élite para el volcado de contenido,
 *              ahora con manejo de errores de red resiliente.
 * @version 5.0.0 (Network Resilience & Elite Observability)
 *@author RaZ Podestá - MetaShark Tech
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
  const traceId = logger.startTrace("dumpAllTablesContent_v5.0");
  logger.startGroup(
    "[DB Dumper] Iniciando volcado de contenido de Supabase (v5.0)..."
  );
  const supabase = createScriptClient();

  try {
    logger.info(
      "Paso 1: Obteniendo la lista de tablas vía RPC 'get_public_table_names'..."
    );
    const { data: tablesData, error: rpcError } = await supabase.rpc(
      "get_public_table_names"
    );

    if (rpcError) throw rpcError; // Re-lanzar para ser capturado por el guardián.

    const tableNames = tablesData.map(
      (t: { table_name: string }) => t.table_name
    );
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
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select("*");

      if (tableError) {
        report.metadata.tablesWithErrors++;
        report.data[tableName] = { error: tableError.message };
      } else {
        report.data[tableName] = {
          count: tableData.length,
          records: tableData,
        };
        report.metadata.totalRecordsDumped += tableData.length;
      }
    }

    logger.info("Paso 3: Escribiendo el informe de volcado en el disco...");
    const reportDir = path.resolve(process.cwd(), "supabase", "reports");
    await fs.mkdir(reportDir, { recursive: true });
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
    // --- [INICIO DE REFACTORIZACIÓN DE RESILIENCIA v5.0.0] ---
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido.";
    logger.error("Fallo crítico durante el proceso de volcado.", {
      error: errorMessage,
      traceId,
    });

    if (errorMessage.includes("fetch failed")) {
      return {
        success: false,
        error:
          "Fallo de red al conectar con Supabase. Verifica tu conexión a internet, VPN o configuración de firewall.",
      };
    }

    return {
      success: false,
      error: `No se pudo completar el volcado: ${errorMessage}`,
    };
    // --- [FIN DE REFACTORIZACIÓN DE RESILIENCIA v5.0.0] ---
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

export default dumpAllTablesContent;
