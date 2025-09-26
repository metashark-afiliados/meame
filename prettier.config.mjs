// RUTA: prettier.config.mjs
/**
 * @file prettier.config.mjs
 * @description SSoT para las reglas de formateo de código de Prettier.
 *              v2.0.0 (Elite & Self-Documented): Nivelado para cumplir con
 *              los pilares de calidad y documentación del proyecto.
 * @version 2.0.0
 * @author RaZ Podestá - MetaShark Tech
 */

/** @type {import("prettier").Config} */
const config = {
  // Ancho de línea máximo.
  printWidth: 80,
  // Usa tabs para la indentación. Alineado con la configuración por defecto de muchos editores.
  useTabs: false,
  // Ancho de la tabulación en espacios.
  tabWidth: 2,
  // Imprime punto y coma al final de las declaraciones.
  semi: true,
  // Usa comillas simples en lugar de dobles.
  singleQuote: false,
  // Coma final en objetos y arrays de varias líneas. Mejora los diffs de git.
  trailingComma: "es5",
  // Espacio en los brackets de los objetos: { key: value } vs {key: value}.
  bracketSpacing: true,
  // Coloca el > de las etiquetas JSX de varias líneas en la última línea.
  jsxBracketSameLine: false,
};

export default config;
