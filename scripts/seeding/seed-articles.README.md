# README: Uso del Inyector de Artículos CogniRead
Este documento es la SSoT para el uso del script de siembra (`seed-articles.ts`), también conocido como "el inyector".

## Propósito
El propósito de este script es poblar la base de datos de Supabase con artículos de `CogniRead` definidos en archivos `json` locales (fixtures). Esto es esencial para pruebas de desarrollo, demostraciones y la inicialización de nuevos entornos.

## Uso Canónico
El script se invoca desde la raíz del proyecto utilizando `pnpm`, nuestro inyector de entorno (`run-with-env.ts`), y debe recibir la ruta al archivo `json` del fixture como argumento.

### Comando
```bash
pnpm tsx scripts/run-with-env.ts scripts/seeding/seed-articles.ts [ruta/al/fixture.json]
Ejemplo
Para inyectar el artículo de superalimentos:
```

```Bash
pnpm tsx scripts/run-with-env.ts scripts/seeding/seed-articles.ts content/cogniread/fixtures/5-superfoods-diet.article.json
```

### Arquitectura y Lógica
Entorno: El script run-with-env.ts se encarga de cargar las variables de entorno (.env.local) y de registrar los alias de ruta de TypeScript (tsconfig.scripts.json).
Cliente de BD: El script seed-articles.ts instancia un cliente de Supabase de servicio (script-client.ts), que utiliza la SERVICE_ROLE_KEY para autenticarse. Esto le permite operar con privilegios de administrador sin depender de una sesión de usuario o de cookies, resolviendo los errores de contexto de ejecución.
Lógica de Negocio: El script lee, valida (usando el CogniReadArticleSchema soberano) e inserta/actualiza (upsert) los datos del artículo directamente en la tabla cogniread_articles de la base de datos. No invoca Server Actions para mantener un desacoplamiento completo del runtime de Next.js.
---
