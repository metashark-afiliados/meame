// RUTA: scripts/supabase/seed-superuser.ts
/**
 * @file seed-superuser.ts
 * @description Script de seed para crear un superusuario de desarrollo en Supabase.
 * @version 1.0.0
 * @author RaZ Podestá - MetaShark Tech
 * @usage pnpm tsx scripts/run-with-env.ts scripts/supabase/seed-superuser.ts
 */
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";
import { logger } from "@/shared/lib/logging";

async function createSuperUser() {
  logger.startGroup("🌱 Iniciando creación de Superusuario en Supabase...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Las variables de entorno de Supabase no están configuradas."
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const superUserEmail = "superuser@webvork.dev";
  const superUserPassword = "superuserpassword123"; // Cambia esto por una contraseña segura si lo deseas

  // 1. Verificar si el usuario ya existe
  const {
    data: { users },
    error: listError,
  } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  const existingUser = users.find((user) => user.email === superUserEmail);

  if (existingUser) {
    logger.warn(
      `El superusuario con email ${superUserEmail} ya existe. Saltando creación.`
    );
    logger.endGroup();
    return;
  }

  // 2. Crear el nuevo usuario
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: superUserEmail,
    password: superUserPassword,
    email_confirm: true, // Auto-confirma el email
    user_metadata: {
      full_name: "Super Usuario Webvork",
      role: "admin", // Metadata para identificarlo en RLS
    },
  });

  if (error) {
    logger.error("Error al crear el superusuario.", { error });
    throw error;
  }

  if (data.user) {
    logger.success("✅ Superusuario creado con éxito en Supabase!");
    console.log(chalk.blue("   Email:"), chalk.yellow(data.user.email));
    console.log(chalk.blue("   Password:"), chalk.yellow(superUserPassword));
    console.log(chalk.blue("   User ID:"), chalk.yellow(data.user.id));
  }

  logger.endGroup();
}

createSuperUser().catch((error) => {
  logger.error("Fallo catastrófico en el script de creación de superusuario.", {
    error,
  });
  process.exit(1);
});
