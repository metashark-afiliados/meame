// RUTA: .pnpmfile.cjs
/* eslint-env node */ // <-- DIRECTIVA SOBERANA PARA ESLINT

/**
 * @file .pnpmfile.cjs
 * @description Manifiesto de Hooks de PNPM y SSoT para la anulación de
 *              comportamientos de dependencias. Este archivo es el guardián
 *              de la seguridad y la integridad del proceso de instalación.
 * @version 1.1.0 (ESLint Environment Compliance)
 * @author L.I.A. Legacy
 */

/**
 * @see https://pnpm.io/pnpmfile
 */
module.exports = {
  hooks: {
    readPackage(pkg, context) {
      context.log(
        `[PNPM Hook] Analizando dependencia: ${pkg.name}@${pkg.version}`
      );

      if (pkg.name === "@swc/core") {
        context.log(
          `[PNPM Hook] APROBANDO explícitamente los scripts de build para @swc/core.`
        );
        pkg.pnpm = {
          ...pkg.pnpm,
          neverBuilt: false,
        };
      }

      return pkg;
    },
  },
};
