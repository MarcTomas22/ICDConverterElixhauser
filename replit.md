# ICD Code Converter

## Descripción General
Aplicación web profesional para convertir códigos médicos ICD10 a ICD9 con clasificación automática de comorbilidades ELIXHAUSER. Diseñada para profesionales médicos que necesitan conversiones rápidas y precisas.

## Funcionalidades Principales
- **Conversión ICD10 → ICD9**: Base de datos con 261,000+ conversiones
- **Clasificación ELIXHAUSER**: Identificación automática de categorías de comorbilidad
- **Búsqueda en Tiempo Real**: Resultados instantáneos mientras se escribe
- **Interfaz Profesional**: Diseño médico limpio con modo oscuro/claro
- **Responsive**: Optimizado para desktop, tablet y móvil

## Stack Tecnológico
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **UI**: Tailwind CSS + shadcn/ui
- **Datos**: In-memory storage (MemStorage)
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

### Categorías ELIXHAUSER
- Congestive heart failure (Insuficiencia cardíaca congestiva)
- Cardiac arrhythmias (Arritmias cardíacas)
- Valvular disease (Enfermedad valvular)
- Pulmonary circulation disorders (Trastornos circulación pulmonar)
- Peripheral vascular disorders (Trastornos vasculares periféricos)
- Hypertension (Hipertensión)
- Paralysis (Parálisis)
- Other neurological disorders (Otros trastornos neurológicos)
- Chronic pulmonary disease (Enfermedad pulmonar crónica)
- Diabetes (con/sin complicaciones)
- Hypothyroidism (Hipotiroidismo)
- Liver disease (Enfermedad hepática)
- Peptic ulcer disease (Úlcera péptica)
- AIDS/HIV
- Lymphoma (Linfoma)
- Metastatic cancer (Cáncer metastásico)
- Solid tumor without metastasis (Tumor sólido sin metástasis)
- Rheumatoid arthritis/collagen vascular diseases
- Coagulopathy (Coagulopatía)
- Obesity (Obesidad)
- Weight loss (Pérdida de peso)
- Fluid and electrolyte disorders (Trastornos electrolíticos)
- Blood loss anemia (Anemia por pérdida de sangre)
- Deficiency anemia (Anemia por deficiencia)
- Alcohol abuse (Abuso de alcohol)
- Drug abuse (Abuso de drogas)
- Psychoses (Psicosis)
- Depression (Depresión)
- Renal failure (Insuficiencia renal)

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
│   │   │   └── ThemeToggle.tsx            # Toggle modo oscuro/claro
│   │   ├── pages/
│   │   │   └── Home.tsx                   # Página principal
│   │   └── index.css                      # Estilos con design tokens
├── server/
│   ├── routes.ts                          # API endpoints
│   └── storage.ts                         # In-memory storage
└── shared/
    └── schema.ts                          # Esquemas TypeScript compartidos

## API Endpoints
- `GET /api/search?q={code}` - Buscar código ICD10 y obtener conversión + clasificación

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
- **PDF ELIXHAUSER**: `attached_assets/Copia de ICD10 to ICD9 (2)_1760516217232.pdf`
  - Categorías con patrones de códigos (rangos, comodines)

## Lógica de Matching ELIXHAUSER
El sistema debe identificar categorías usando:
- Códigos exactos: `I09.9`
- Rangos: `I44.1 - I44.3`
- Comodines: `I50.x`, `J40.x - J47.x`
- Múltiples códigos separados por coma

## Estado Actual del Desarrollo
- ✅ Fase 1: Schema & Frontend completado
- 🔄 Fase 2: Backend en progreso
- ⏳ Fase 3: Integración pendiente

## Notas de Desarrollo
- Usar in-memory storage (javascript_mem_db blueprint)
- NO usar datos mock en implementación final
- Seguir design_guidelines.md para UI
- Búsqueda debe soportar códigos parciales
- Clasificación ELIXHAUSER: "No clasificado" si no hay match
