# ICD Code Converter

## Descripción General
Aplicación web profesional para convertir códigos médicos ICD10 a ICD9 con clasificación automática de comorbilidades ELIXHAUSER. Diseñada para profesionales médicos que necesitan conversiones rápidas y precisas.

## Funcionalidades Principales
- **Conversión ICD10 → ICD9**: Base de datos con 261,000+ conversiones (150,854 códigos ICD10 únicos)
- **Clasificación ELIXHAUSER CMR v2025.1**: Sistema oficial con 39 categorías y 4,542 códigos ICD-10 categorizados
- **Búsqueda Bidireccional**: ICD10 → ICD9 e ICD9 → ICD10 (búsqueda inversa)
- **Filtros Avanzados**: Filtrado por categoría ELIXHAUSER con 39 categorías oficiales
- **Historial de Búsquedas**: PostgreSQL con persistencia, permite repetir búsquedas anteriores
- **Exportación Profesional**: Descarga CSV y PDF con metadata completa
- **Búsqueda en Tiempo Real**: Resultados instantáneos mientras se escribe
- **Interfaz Profesional**: Diseño médico limpio con modo oscuro/claro
- **Responsive**: Optimizado para desktop, tablet y móvil

## Stack Tecnológico
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Base de Datos**: PostgreSQL (Neon) + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Datos**: In-memory storage (conversiones) + PostgreSQL (historial)
- **Exportación**: PapaParse (CSV) + jsPDF + jspdf-autotable (PDF)
- **Fuentes**: Inter (interfaz) + JetBrains Mono (códigos médicos)

## Arquitectura de Datos

### Esquema Principal
```typescript
// CodeConversion: Mapeo ICD10 → ICD9
{ icd10: string, icd9: string, flags?: string }

// ElixhauserCategory: Clasificaciones ELIXHAUSER
{ category: string, icd10Codes: string[] }

// SearchResult: Resultado combinado
{ icd10: string, icd9Codes: string[], elixhauserCategory: string | null }
```

### Categorías ELIXHAUSER CMR v2025.1 (39 oficiales)
- AIDS/HIV (8 códigos)
- Alcohol abuse (57 códigos)
- Deficiency anemia (26 códigos)
- Autoimmune conditions (598 códigos)
- Blood loss anemia (1 código)
- Leukemia (100 códigos)
- Lymphoma (447 códigos)
- Metastatic cancer (54 códigos)
- Cancer in situ (110 códigos)
- Solid tumor without metastasis (598 códigos)
- Cerebrovascular disease POA (184 códigos)
- Cerebrovascular disease sequelae (127 códigos)
- Coagulopathy (57 códigos)
- Dementia (93 códigos)
- Depression (19 códigos)
- Diabetes with complications (445 códigos)
- Diabetes without complications (65 códigos)
- Drug abuse (259 códigos)
- Heart failure (37 códigos)
- Hypertension with complications (61 códigos)
- Hypertension without complications (10 códigos)
- Liver disease mild (59 códigos)
- Liver disease severe (19 códigos)
- Chronic pulmonary disease (68 códigos)
- Neurological movement disorders (68 códigos)
- Other neurological disorders (69 códigos)
- Seizures and epilepsy (61 códigos)
- Obesity (36 códigos)
- Paralysis (180 códigos)
- Peripheral vascular disease (356 códigos)
- Psychoses (145 códigos)
- Pulmonary circulation disorders (18 códigos)
- Renal failure moderate (6 códigos)
- Renal failure severe (15 códigos)
- Hypothyroidism (18 códigos)
- Other thyroid disorders (27 códigos)
- Peptic ulcer disease (36 códigos)
- Valvular disease (109 códigos)
- Weight loss (18 códigos)

## Estructura del Proyecto
```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClassificationBadge.tsx    # Badge para categorías ELIXHAUSER
│   │   │   ├── SearchBar.tsx              # Barra de búsqueda
│   │   │   ├── ResultsTable.tsx           # Tabla de resultados
│   │   │   ├── EmptyState.tsx             # Estado vacío
│   │   │   ├── LoadingState.tsx           # Estado de carga
│   │   │   ├── ThemeToggle.tsx            # Toggle modo oscuro/claro
│   │   │   ├── CategoryFilter.tsx         # Filtro de categorías
│   │   │   ├── HistoryPanel.tsx           # Panel de historial
│   │   │   └── ExportButtons.tsx          # Botones exportación CSV/PDF
│   │   ├── pages/
│   │   │   └── Home.tsx                   # Página principal
│   │   └── index.css                      # Estilos con design tokens
├── server/
│   ├── routes.ts                          # API endpoints
│   ├── storage.ts                         # Storage híbrido (memoria + DB)
│   ├── db.ts                              # Conexión PostgreSQL
│   ├── cmr-elixhauser.ts                  # Sistema CMR v2025.1
│   └── cmr-category-names.ts              # Nombres categorías ELIXHAUSER
└── shared/
    └── schema.ts                          # Esquemas compartidos + Drizzle

## API Endpoints
- `GET /api/search?q={code}&mode={mode}&category={category}` - Buscar códigos (normal/inverso) con filtros
- `GET /api/categories` - Obtener lista de 39 categorías ELIXHAUSER
- `POST /api/history` - Guardar búsqueda en historial
- `GET /api/history?limit={n}` - Obtener historial de búsquedas (últimas 50 por defecto)
- `DELETE /api/history/:id` - Eliminar entrada del historial

## Sistema de Diseño

### Colores (Modo Oscuro - Principal)
- Background: HSL(220, 15%, 12%)
- Card: HSL(220, 15%, 18%)
- Primary: HSL(210, 100%, 60%) - Azul médico
- Success: HSL(142, 70%, 50%) - Verde (clasificado)
- Warning: HSL(45, 90%, 60%) - Amarillo (no clasificado)

### Tipografía
- Interfaz: Inter (400, 500, 600, 700)
- Códigos Médicos: JetBrains Mono (monoespaciada)

### Espaciado
- Micro: 2-3 (form elements)
- Componentes: 4-6
- Secciones: 8
- Mayores: 12-16

## Datos de Entrada
- **CSV de Conversiones**: `attached_assets/ICD_9_10_d_v1.1_1760516226717.csv` (261K líneas)
  - Formato: `ICD10|ICD9|Flags`
  - 150,854 códigos ICD10 únicos procesados
- **Excel CMR Oficial**: `attached_assets/CMR-Reference-File-v2025-1_1760533108985.xlsx`
  - ELIXHAUSER Comorbidity Software Refined for ICD-10-CM v2025.1
  - Hoja DX_to_Comorb_Mapping: 4,543 filas con matriz binaria de categorías
  - 39 categorías oficiales con códigos exactos

## Lógica de Matching ELIXHAUSER CMR
El sistema usa el archivo oficial CMR-Reference-File-v2025-1.xlsx:
- **Matching Exacto**: Comparación directa con 4,542 códigos ICD-10 oficiales
- **Normalización**: Códigos normalizados (sin puntos) para matching: E10.10 → E1010
- **Multi-Categoría**: Un código puede pertenecer a múltiples categorías (se muestra la primera)
- **39 Categorías Oficiales**: Sistema ELIXHAUSER Comorbidity Software Refined v2025.1

## Estado Actual del Desarrollo  
- ✅ MVP Completado: Búsqueda ICD10→ICD9, clasificación ELIXHAUSER, UI profesional
- ✅ Búsqueda Inversa: ICD9→ICD10 implementada con tabs de modo
- ✅ Filtros por Categoría: 39 categorías ELIXHAUSER oficiales CMR v2025.1
- ✅ Sistema CMR: Matching exacto con normalización de códigos (4,542 códigos categorizados)
- ✅ Historial de Búsquedas: Base de datos PostgreSQL con persistencia completa
- ✅ Exportación CSV/PDF: Descarga de resultados con metadata profesional
- 🔄 Futuro: Descripciones detalladas de códigos médicos

## Notas de Desarrollo
- Usar in-memory storage (javascript_mem_db blueprint)
- NO usar datos mock en implementación final
- Seguir design_guidelines.md para UI
- Búsqueda debe soportar códigos parciales
- Clasificación ELIXHAUSER: "No clasificado" si no hay match
