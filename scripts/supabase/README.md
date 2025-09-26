# Arsenal de Diagnóstico de Supabase

Este directorio contiene un conjunto de herramientas de línea de comandos de élite para auditar, analizar y gestionar nuestra infraestructura de Supabase.

## Filosofía

La observabilidad no es un lujo, es un requisito. Estos scripts nos proporcionan una "radiografía" bajo demanda del estado de nuestra base de datos, permitiéndonos tomar decisiones informadas, depurar eficientemente y garantizar la integridad de nuestro sistema.

## Scripts Disponibles y Casos de Uso

### 1. Diagnóstico Completo

**Comando:**

```bash
pnpm diag:supabase
```

Caso de Uso: Este es el comando principal y recomendado. Ejecuta una auditoría holística de la conexión, el esquema y el contenido en un solo paso. Es la herramienta perfecta para obtener una visión completa del estado de la base de datos antes de una sesión de desarrollo o después de una migración. 2. Diagnóstico de Conexión
Comando:

```bash
pnpm diag:supabase:connect
```

Caso de Uso: Utiliza este script para una verificación rápida y atómica de que las credenciales en tu archivo .env.local son correctas y que tu red permite la conexión a Supabase.

3. Diagnóstico de Esquema
   Comando:

```bash
pnpm diag:supabase:schema
```

Caso de Uso: Genera una instantánea completa de la arquitectura de la base de datos: tablas, columnas, políticas de RLS, funciones, triggers, etc. El resultado se guarda en supabase/reports/latest-schema-diagnostics.json. Este informe es fundamental para la IA, ya que le proporciona el contexto exacto de la estructura de la base de datos en cada sesión. 4. Diagnóstico de Contenido
Comando:

```bash
pnpm diag:supabase:content
```

Caso de Uso: Realiza un censo de las entidades en la base de datos, contando los registros en cada tabla y calculando métricas clave. El resultado se guarda en supabase/reports/latest-content-diagnostics.json. Es ideal para verificar el resultado de operaciones de "seeding" (siembra de datos) o para monitorizar el crecimiento del contenido.
