# ICD Converter Elixhauser

Aplicación web de pila completa para convertir códigos clínicos entre ICD-10 e ICD-9 y clasificarlos según el sistema de comorbilidades Elixhauser (CMR 2025.1). La interfaz permite buscar códigos en ambas direcciones, filtrar por categorías clínicas y exportar resultados, mientras que el backend Express sirve la API y persiste el historial de búsquedas en PostgreSQL mediante Drizzle ORM.

## Características principales
- 🔍 **Búsqueda inteligente**: consulta códigos ICD-10 → ICD-9 o búsqueda inversa (ICD-9 → ICD-10) con normalización de formatos.
- 🗂️ **Clasificación Elixhauser**: cada coincidencia se acompaña de una o varias categorías de comorbilidad CMR.
- 🎯 **Filtros por categoría**: explora directamente los códigos asociados a una categoría de Elixhauser.
- 💾 **Historial persistente**: guarda y recupera búsquedas recientes mediante PostgreSQL.
- 📤 **Exportación**: genera reportes de los resultados en varios formatos para compartir con tu equipo clínico.
- 🌓 **Modo claro/oscuro**: alterna el tema de la interfaz con un clic.

## Requisitos previos
- Node.js 20 o superior
- npm 10+ (incluido con Node)
- Base de datos PostgreSQL con compatibilidad para conexiones encriptadas (se usa Neon Serverless en desarrollo hospedado, pero puedes emplear cualquier instancia accesible por URL)

## Configuración inicial
1. Clona el repositorio y entra en la carpeta del proyecto:
   ```bash
   git clone <url-del-repo>
   cd ICDConverterElixhauser
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz con la URL de tu base de datos PostgreSQL:
   ```bash
   echo "DATABASE_URL=postgres://usuario:password@host:puerto/base" > .env
   ```
4. Empuja el esquema a la base de datos (crea la tabla `search_history` si aún no existe):
   ```bash
   npm run db:push
   ```
5. Inicia el servidor de desarrollo (Express + Vite en modo middleware):
   ```bash
   npm run dev
   ```
   El backend escuchará en `http://localhost:5000` y servirá tanto la API (`/api/*`) como la aplicación React.

## Scripts disponibles
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Ejecuta la API Express y el cliente Vite en modo desarrollo con recarga en caliente. |
| `npm run build` | Genera el build de producción del cliente y del servidor (bundle con esbuild). |
| `npm start` | Inicia la aplicación en modo producción usando los artefactos generados en `dist/`. |
| `npm run check` | Ejecuta comprobación de tipos con TypeScript. |
| `npm run db:push` | Sincroniza el esquema de Drizzle con la base de datos configurada. |

## Variables de entorno
- `DATABASE_URL` (obligatoria): cadena de conexión de PostgreSQL. Es requerida en tiempo de arranque del servidor; sin ella la aplicación no iniciará.
- `PORT` (opcional): puerto para servir la API y la SPA. Por defecto se usa `5000`.

## Arquitectura del proyecto
```
├── client/                 # Aplicación React + Tailwind (Vite)
│   ├── src/components/     # Componentes UI (SearchBar, ResultsTable, etc.)
│   ├── src/pages/          # Vistas principales (Home)
│   └── src/lib/            # React Query y utilidades del cliente
├── server/                 # API Express + lógica de negocio
│   ├── routes.ts           # Definición de endpoints REST
│   ├── storage.ts          # Capa de acceso a datos (búsqueda y persistencia)
│   ├── data-loader.ts      # Carga y parseo del CSV ICD10↔ICD9
│   └── db.ts               # Configuración de Drizzle ORM sobre PostgreSQL
├── shared/                 # Tipos y esquemas compartidos (Zod + Drizzle)
├── attached_assets/        # Dataset `ICD_9_10_d_v1.1_1760516226717.csv`
└── README.md
```

## Datos y fuentes
Los mapeos ICD-10 ↔ ICD-9 se leen desde `attached_assets/ICD_9_10_d_v1.1_1760516226717.csv`. Las categorías Elixhauser CMR provienen de los archivos JSON en `server/` y se actualizan a la versión 2025.1.

## Flujo de trabajo sugerido
1. Realiza tu búsqueda de códigos desde la página principal.
2. Ajusta filtros de categoría o cambia al modo inverso según necesites.
3. Exporta los resultados cuando tengas el listado deseado.
4. Consulta el panel lateral para repetir o depurar búsquedas previas.

## Despliegue
1. Ejecuta `npm run build` para generar los artefactos de producción.
2. Establece `NODE_ENV=production` y `DATABASE_URL` en el entorno de tu servidor.
3. Ejecuta `npm start`. Express servirá la SPA desde `server/public/` y expondrá la API en el mismo puerto.

## Licencia
Proyecto publicado bajo licencia MIT.
