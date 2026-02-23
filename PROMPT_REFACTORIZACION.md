# 🚀 Prompt Global de Refactorización: Tejiendo Redes

Este documento contiene un súper-prompt diseñado para ser copiado y entregado a una IA (Cursor, ChatGPT, Claude) para realizar un "lavado de cara" arquitectónico al proyecto sin romper la funcionalidad actual.

---

## 📝 Instrucciones para la IA

### Contexto del Proyecto
Eres un ingeniero de software senior experto en Next.js 15, TypeScript y Drizzle ORM. Estás trabajando en "Tejiendo Redes", una plataforma de servicio comunitario para la gestión de salud y atención social.

### Objetivo
Reestructurar el código para que sea 100% consistente con una arquitectura moderna de Server Components y Server Actions, eliminando deuda técnica y mejorando la legibilidad para futuros desarrollos.

### Reglas de Oro
1.  **NO ROMPAS LA LÓGICA**: La funcionalidad debe ser idéntica.
2.  **NO CAMBIES LA DB**: No modifiques archivos en `src/db/schema/` ni añadas/quites columnas.
3.  **RESULT PATTERN**: Asegura que todas las funciones en `queries/` y `actions/` retornen `{ success, data, error }`.

### Tareas Paso a Paso (Checklist para la IA)

#### 1. Estandarización de Tipos y Retornos
- Revisa `src/queries/` y asegúrate de que todas las funciones manejen errores con `try/catch` y retornen el patrón de resultado.
- Usa tipos de Drizzle (`InferSelectModel`) para los argumentos de las funciones en lugar de interfaces personalizadas duplicadas.

#### 2. Migración de Lógica de Componentes
- Identifica lógica de base de datos o cálculos complejos dentro de componentes en `src/app/` o `src/components/features/`.
- Mueve las lecturas a `src/queries/` y las mutaciones a `src/actions/`.
- Asegura que los componentes de página sean Server Components (`async function Page()`) que pasen datos a componentes de cliente de forma limpia.

#### 3. Limpieza y Consistencia (Look & Feel)
- Elimina comentarios JSDoc vacíos o referencias a funciones que ya no existen.
- Normaliza los nombres de archivos: usa `kebab-case` para archivos y carpetas.
- Mueve formularios de autenticación a `src/components/forms/` si no están allí.

#### 4. Documentación Automática
- Genera JSDoc útil para cada función exportada indicando qué hace y qué parámetros recibe.

### Prompt Maestro (Copia esto):

> "Analiza la arquitectura actual del proyecto basándote en el archivo `.rules`. Tu tarea es realizar una refactorización progresiva de los módulos de [NOMBRE_DEL_MODULO] siguiendo el patrón de Capas (Queries para lectura, Actions para escritura). Debes asegurar que todas las funciones retornen `{ success, data, error }`, usar tipos estrictos de TypeScript/Drizzle, y extraer cualquier lógica de negocio de los componentes hacia la capa de servicios correspondiente. No modifiques la estructura de la base de datos ni cambies el comportamiento de cara al usuario. Presenta los cambios en bloques pequeños y explicados."

---
*Este prompt asegura que cualquier equipo futuro pueda heredar el proyecto y reestructurarlo con una IA de forma segura y eficiente.*
