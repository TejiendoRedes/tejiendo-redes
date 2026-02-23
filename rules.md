# 📜 Reglas de Oro para IA: Proyecto Tejiendo Redes

Este documento define los estándares arquitectónicos y de codificación obligatorios. Cualquier IA que trabaje en este proyecto debe leer esto primero para garantizar coherencia y mantenibilidad.

## 🏗 Arquitectura de Capas (Clean Architecture)

El proyecto sigue una estructura de capas estricta para separar la persistencia, la lógica y la interfaz.

### 1. Capa de Datos (Drizzle ORM)
- **Ubicación**: `src/db/schema/`
- **Regla**: No modificar esquemas sin aprobación expresa. Usar tipos inferidos: `typeof table.$inferSelect`.

### 2. Capa de Servicios: Consultas (Lectura)
- **Ubicación**: `src/queries/`
- **Regla**: Solo lectura (SELECT). **PROHIBIDO** usar `"use server"` aquí. 
- **Patrón**: Todas las funciones deben retornar el **Result Pattern**: `{ success: boolean, data?: T, error?: string }`.

### 3. Capa de Servicios: Actions (Escritura)
- **Ubicación**: `src/actions/`
- **Regla**: Solo mutaciones (INSERT, UPDATE, DELETE). **OBLIGATORIO** usar `"use server"`.
- **Patrón**: Debe retornar `{ success: boolean, message: string, data?: T, error?: string }`.

### 4. Capa de Interfaz (Frontend)
- **Componentes Base**: `src/components/ui/` (Componentes visuales puros).
- **Componentes de Negocio**: `src/components/features/` (Contienen lógica de dominio).
- **Formularios**: `src/components/forms/` (Centralizar validaciones Zod aquí).

## 🤖 Directrices para el Desarrollo con IA

### 1. IA-Friendly Naming & Structure
- **Archivos**: Siempre `kebab-case.tsx` (ej. `listado-pacientes.tsx`).
- **Exportaciones**: Preferir exportaciones nombradas (`export function Name`) sobre defaults.
- **Importaciones**: Usar siempre aliases `@/...`.

### 2. Manejo de Errores (Resilience)
- Envolver toda lógica en `try/catch`.
- Nunca dejar bloques `catch` vacíos; registrar el error y devolver un mensaje amigable al usuario.

### 3. Tipado Estricto
- **Ajuste Prohibido**: `any` es pecado. Si un tipo es complejo, créalo en `src/types/`.
- Validar todas las entradas de formularios y APIs con **Zod**.

### 4. Comentarios y JSDoc
- Cada función exportada **debe** tener JSDoc indicando:
  ```typescript
  /**
   * [Descripción breve en español]
   * @param {Type} param - [Descripción]
   * @returns {Promise<Result<Type>>}
   */
  ```

## 🚀 Flujo de Trabajo para Refactorización
- **Principio**: Si vas a mover un código, asegúrate de que el destinatario siga los estándares de arriba.
- **Verificación**: Después de cualquier cambio estructural, ejecuta `npm run build` para asegurar la integridad de los tipos.

---
*Este proyecto es el legado de un servicio comunitario. Mantén el código digno para quienes vendrán después.*
