// eslint.config.mjs
/**
 * @file eslint.config.mjs
 * @description SSoT para la configuración de ESLint v9+ (Flat Config).
 * @version 2.2.0 (Vendor Code Isolation)
 * @author RaZ Podestá - MetaShark Tech
 */
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = tseslint.config(
  {
    // --- [INICIO DE MEJORA DE AISLAMIENTO] ---
    // Se añade la ruta `public/vendor/**/*.js` al array de ignores globales.
    // Esto asegura que los scripts de terceros, como webvork.js, no sean
    // procesados por ESLint, previniendo errores de linting irrelevantes y
    // mejorando ligeramente el rendimiento.
    ignores: ["**/.next/**", "**/node_modules/**", "public/vendor/**/*.js"],
    // --- [FIN DE MEJORA DE AISLAMIENTO] ---
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: jsxA11yPlugin.configs.recommended.rules,
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
  prettierConfig
);

export default config;
// eslint.config.mjs
