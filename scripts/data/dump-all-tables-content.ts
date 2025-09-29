// RUTA: scripts/data/dump-all-tables-content.ts
/**
 * @file dump-all-tables-content.ts
 * @description Script de élite para realizar un volcado completo del contenido
 *              de todas las tablas en el schema 'public' de Supabase.
 * @version 1.0.0
 * @author L.I.A. Legacy
 * @usage pnpm tsx scripts/run-with-env.ts scripts/data/dump-all-tables-content.ts
 */
import 'server-only';
import { promises as fs } from 'fs';
import * as path from 'path';
import { createScriptClient } from '@/shared/lib/supabase/script-client';
import { logger } from '@/shared/lib/logging';
import type { ActionResult } from '@/shared/lib/types/actions.types';

async function dumpAllTables(): Promise<ActionResult<string>> {
  const traceId = logger.startTrace('dumpAllTablesContent');
  logger.startGroup('[DB Dumper] Iniciando volcado de contenido de Supabase...');
  const supabase = createScriptClient();

  try {
    // 1. Obtener dinámicamente todas las tablas del schema 'public'
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) throw tablesError;

    const tableNames = tables.map(t => t.tablename).filter(t => !t.startsWith('pg_'));
    logger.info(`Se encontraron ${tableNames.length} tablas para volcar.`);

    const fullDump: Record<string, unknown[]> = {};

    // 2. Iterar y hacer SELECT * de cada tabla
    for (const tableName of tableNames) {
      logger.trace(`   -> Volcando tabla: ${tableName}...`);
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*');

      if (tableError) {
        logger.warn(`No se pudo volcar la tabla '${tableName}'. Saltando.`, { error: tableError.message });
        fullDump[tableName] = [{ error: `Failed to fetch: ${tableError.message}` }];
      } else {
        fullDump[tableName] = tableData;
      }
    }

    // 3. Escribir el resultado en un archivo JSON
    const reportDir = path.resolve(process.cwd(), 'supabase', 'reports');
    await fs.mkdir(reportDir, { recursive: true });
    const reportPath = path.resolve(reportDir, 'latest-content-dump.json');
    await fs.writeFile(reportPath, JSON.stringify(fullDump, null, 2));

    logger.success(`[DB Dumper] Volcado de contenido completado con éxito.`);
    return { success: true, data: `Reporte guardado en: ${reportPath}` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    logger.error("[DB Dumper] Fallo crítico durante el volcado de la base de datos.", { error: errorMessage });
    return { success: false, error: "No se pudo completar el volcado de la base de datos." };
  } finally {
    logger.endGroup();
    logger.endTrace(traceId);
  }
}

dumpAllTables();
