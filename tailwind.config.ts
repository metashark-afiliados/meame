// tailwind.config.ts
/**
 * @file tailwind.config.ts
 * @description Configuración de Tailwind CSS v4.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 * @see app/globals.css - Esta es la nueva SSoT para el sistema de diseño.
 *
 * @description_es En Tailwind CSS v4, la configuración principal del tema (colores,
 * fuentes, espaciado, etc.), el modo oscuro y los plugins se gestionan
 * directamente en el archivo CSS principal (`app/globals.css`) mediante directivas
 * como `@theme` y `@custom-variant`.
 *
 * Este archivo se mantiene por dos razones principales:
 * 1.  Compatibilidad con herramientas del ecosistema (como el CLI de ShadCN) que
 *     aún esperan encontrar un archivo de configuración JS/TS.
 * 2.  Para futuras configuraciones avanzadas que pudieran no ser compatibles
 *     con el enfoque "CSS-first".
 *
 * Por ahora, su rol es ser un guardián silencioso y un punto de entrada para
 * la configuración de `content`, aunque Tailwind v4 también puede inferirlo.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Asegura la inclusión de todos los directorios relevantes
  ],
  // No se necesitan las claves `darkMode`, `theme` y `plugins` aquí.
  // Esas se gestionan en `app/globals.css`.
};

export default config;
