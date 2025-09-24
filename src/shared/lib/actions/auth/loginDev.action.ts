// app/[locale]/(dev)/login/_actions/loginDev.action.ts
/**
 * @file loginDev.action.ts
 * @description Server Action para la autenticación en el DCC.
 * @version 1.1.0 (Code Hygiene): Se eliminan importaciones y parámetros no
 *              utilizados para cumplir con las reglas de linting y mejorar la
 *              claridad del código.
 * @author RaZ Podestá - MetaShark Tech
 */
"use server";

import { getSession } from "@/shared/lib/session";
import type { ActionResult } from "@/shared/lib/types/actions.types";

export async function loginDevAction(
  formData: FormData
): Promise<ActionResult<{ success: boolean }>> {
  const password = formData.get("password");

  if (password === process.env.DCC_PASSWORD) {
    const session = await getSession();
    session.isDevAuthenticated = true;
    await session.save();
    return { success: true, data: { success: true } };
  }

  return { success: false, error: "Contraseña incorrecta." };
}
// app/[locale]/(dev)/login/_actions/loginDev.action.ts
