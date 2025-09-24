// scripts/diagnostics/diag-supabase.ts
/**
 * @file diag-supabase.ts
 * @description Herramienta de diagnóstico para verificar la configuración local de Supabase.
 * @version 2.0.0 (Elite Linter Compliance)
 * @author RaZ Podestá - MetaShark Tech
 * @usage pnpm diag:supabase
 */
import chalk from "chalk";
import dotenv from "dotenv";
import path from "path";

function runSupabaseDiagnostics() {
  console.clear();
  console.log(
    chalk.cyan.bold("🔬 Iniciando Auditoría de Configuración de Supabase...")
  );

  // 1. Cargar Variables de Entorno
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let hasErrors = false;

  console.log(chalk.gray("\nVerificando variables de entorno..."));

  if (SUPABASE_URL && SUPABASE_URL.startsWith("http")) {
    console.log(
      chalk.green(
        "  ✅ NEXT_PUBLIC_SUPABASE_URL está presente y parece válida."
      )
    );
  } else {
    console.error(
      chalk.red.bold(
        "  ❌ [FALLO] NEXT_PUBLIC_SUPABASE_URL falta o es inválida."
      )
    );
    hasErrors = true;
  }

  if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 50) {
    console.log(
      chalk.green("  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY está presente.")
    );
  } else {
    console.error(
      chalk.red.bold(
        "  ❌ [FALLO] NEXT_PUBLIC_SUPABASE_ANON_KEY falta o parece incorrecta."
      )
    );
    hasErrors = true;
  }

  if (hasErrors) {
    console.error(
      chalk.red.bold(
        "\n❌ Auditoría fallida. Faltan variables de entorno críticas para Supabase."
      )
    );
    console.error(
      chalk.white(
        "   Ve a tu dashboard de Supabase -> Project Settings -> API y copia los valores correctos en tu archivo .env.local."
      )
    );
    process.exit(1);
  }

  // --- [INICIO DE CORRECCIÓN DE HIGIENE DE CÓDIGO] ---
  // Se ha eliminado la variable 'error' no utilizada del bloque catch.
  try {
    // Esta sección puede expandirse en el futuro para realizar una prueba de conexión real.
    // Por ahora, su propósito es validar que las variables existen.
  } catch {
    // Este bloque catch está aquí para futuras pruebas de conexión.
    // Actualmente no se espera que se active, pero se mantiene por resiliencia.
    console.error(chalk.red.bold("Error inesperado durante la verificación."));
    process.exit(1);
  }
  // --- [FIN DE CORRECCIÓN DE HIGIENE DE CÓDIGO] ---

  console.log(
    chalk.green.bold(
      "\n✨ Auditoría de Supabase completada. ¡La configuración local parece correcta!"
    )
  );
}

runSupabaseDiagnostics();
