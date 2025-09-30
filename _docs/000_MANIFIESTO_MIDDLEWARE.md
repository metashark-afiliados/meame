# Manifiesto Canónico: El Pipeline del Middleware (Guardián de la Puerta de Entrada)

## 1. Filosofía Raíz: "Cada Solicitud es Verificada, Enriquecida y Enrutada con Precisión de Élite."

Este documento es la **Única Fuente de Verdad (SSoT)** para la arquitectura y el flujo lógico del middleware de la aplicación. Actúa como la primera línea de defensa y de inteligencia, procesando cada solicitud entrante antes de que llegue a una página o ruta de API.

El pipeline está diseñado para ser:
- **Atómico:** Cada manejador (`handler`) tiene una única y clara responsabilidad.
- **Secuencial:** Los manejadores se ejecutan en un orden predefinido y estricto.
- **Cortocircuitable:** Un manejador puede finalizar el flujo de forma temprana si es necesario (ej. una redirección).
- **Observable:** Cada paso y cada decisión son registrados para una depuración y auditoría completas.

## 2. Diagrama de Flujo de Solicitud (El "Grapho")

El siguiente diagrama visualiza el viaje de una solicitud (`NextRequest`) a través del pipeline del middleware.

```mermaid
graph TD
    A[Request Entrante] --> B{Middleware Invoked};
    B --> C[Visitor Intelligence Handler];
    C --> D{¿Es un Bot Conocido?};
    D -- Sí --> E[Enriquecer Headers & Continuar];
    D -- No --> F{¿GeoIP de Vercel disponible?};
    F -- Sí --> G[Enriquecer con Geo Vercel & Continuar];
    F -- No --> H[Llamar a API de GeoIP Externa];
    H --> G;
    E --> I[i18n Handler];
    G --> I;

    I --> J{¿Ruta ya tiene /locale/?};
    J -- Sí --> K[Continuar sin cambios];
    J -- No --> L{¿País conocido?};

    L -- Sí --> M{¿Locale soportado para el país?};
    M -- Sí --> N[Redirigir a /<locale-país>/ruta];
    M -- No --> O[Redirigir a /select-language];

    L -- No --> P[Detectar locale del navegador];
    P --> Q[Redirigir a /<locale-navegador>/ruta];

    K --> R[Auth Handler];

    R --> S{¿Es una Ruta Protegida?};
    S -- No --> T[Continuar sin cambios];
    S -- Sí --> U{¿Usuario Autenticado?};

    U -- Sí --> V[Continuar a la ruta protegida];
    U -- No --> W[Redirigir a /<locale>/login];

    T --> X[Response Final a Next.js];
    V --> X;

    subgraph "Inteligencia del Visitante"
        C
        D
        E
        F
        G
        H
    end

    subgraph "Internacionalización (i18n)"
        I
        J
        L
        M
        N
        O
        P
        Q
    end

    subgraph "Autenticación (Auth)"
        R
        S
        U
        V
        W
    end
3. Orden y Responsabilidad de los Manejadores
visitorIntelligenceHandler:
Responsabilidad: Identificar el tipo de visitante (humano/bot), su dispositivo, navegador, S.O. y su ubicación geográfica.
Salida: Enriquece las cabeceras de la solicitud (x-visitor-*) para que puedan ser utilizadas por los manejadores posteriores o en las páginas.
i18nHandler:
Responsabilidad: Asegurar que cada ruta esté correctamente localizada.
Lógica: Si una ruta no tiene prefijo de locale, determina el locale más apropiado (primero por país, luego por navegador) y emite una redirección. No se ejecuta si la ruta ya está localizada.
authHandler:
Responsabilidad: Proteger las rutas del Developer Command Center (DCC).
Lógica: Verifica si la ruta solicitada es una ruta protegida. Si lo es, valida la sesión del usuario. Si el usuario no está autenticado, lo redirige a la página de login.
