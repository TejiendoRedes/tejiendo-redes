# Prompt de Re-estructuración Arquitectónica (V2.0)

Actúa como un Arquitecto de Software Senior experto en Next.js, Drizzle ORM y patrones de diseño modernos. Tu objetivo es re-estructurar el proyecto "Tejiendo Redes" para que sea 100% IA-friendly y siga una arquitectura limpia basada en capacidades (Features).

## 🎯 Objetivo
Transformar el código actual hacia el estándar definido en `.cursorrules` sin romper la lógica de negocio ni modificar las tablas de la base de datos.

## 🏗 Arquitectura Objetivo

1.  **Thin Pages (`src/app/`):** Las páginas deben ser mínimas. Solo obtienen datos (usando queries) y pasan props a los componentes de feature.
2.  **Feature-Based Components (`src/components/features/`):** Mueve la lógica de negocio de los componentes genéricos a carpetas por funcionalidad.
3.  **Result Pattern (`src/actions/`):** Todas las Server Actions deben devolver `{ success: boolean, message: string, data?: T, error?: string }`.
4.  **Drizzle Queries (`src/queries/`):** Centraliza todas las lecturas de BD aquí. Usa tipado estricto de Drizzle (`InferSelectModel`).
5.  **Zod Schemas (`src/schemas/`):** Define todas las validaciones en archivos `.schema.ts`.

## 🛠 Instrucciones de Proceso (Paso a Paso)

### Paso 1: Análisis de Dependencias
- Identifica componentes "monolíticos" (más de 200 líneas).
- Lista las queries inline en componentes de cliente que deben moverse a `src/queries/`.

### Paso 2: Refactorización de Datos
- Crea o actualiza archivos en `src/queries/` para cada entidad.
- Asegúrate de que cada función tenga JSDoc descriptivo.

### Paso 3: Estandarización de Acciones
- Envuelve los retornos de todas las acciones en `src/actions/` con el `Result Pattern`.
- Añade validación de Zod al inicio de cada acción si no existe.

### Paso 4: Limpieza de UI
- Separa los componentes de Shadcn (`src/components/ui/`) de los componentes con lógica (`src/components/features/`).
- Elimina comentarios JSDoc vacíos y referencias a funciones muertas.

## ⚠️ Reglas Críticas
- **NUNCA** modifiques la estructura de las tablas en `src/db/schema/` durante este refactor.
- **SIEMPRE** usa `"use server"` solo en `src/actions/`.
- **PROHIBIDO** el uso de `any`.
- **MANTÉN** la funcionalidad actual; el sistema debe seguir siendo operativo tras cada pequeño cambio (Small Commits).

---
**Nota para la IA:** Antes de empezar cada archivo, lee completamente su contenido y el de sus dependencias para no perder contexto de negocio.
