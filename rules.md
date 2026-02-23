# 📜 Reglas de Oro para IA: Tejiendo Redes (v2.1)

Este documento es la ley para cualquier IA que trabaje en este proyecto. El objetivo es mantener una arquitectura limpia, predecible y altamente mantenible.

## 🏗 Arquitectura y Flujo de Datos

### 1. El Patrón de Resultado (Result Pattern)
Todas las **Server Actions** (`src/actions`) DEBEN devolver un objeto con esta estructura:
```typescript
{
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```
Esto asegura que el frontend pueda manejar errores de forma consistente.

### 2. Separación de Responsabilidades
- **`src/queries/`**: Lógica de LECTURA. Solo funciones de Drizzle. **NUNCA** uses `"use server"` aquí.
- **`src/actions/`**: Lógica de ESCRITURA. Solo Server Actions con `"use server"`.
- **`src/components/ui/`**: Componentes visuales puros (Shadcn). No conocen la lógica de negocio.
- **`src/components/features/`**: Componentes con lógica de dominio (ej. `FormularioPaciente`).

### 3. Tipado Estricto (TypeScript)
- **Prohibido el uso de `any`**.
- Usa los tipos generados por Drizzle: `typeof consultas.$inferSelect`.
- Las validaciones de formularios deben estar en `src/schemas/` usando **Zod**.

## 🤖 Directrices para la IA

1. **Documentación:** Cada función nueva debe incluir JSDoc explicando qué hace, sus parámetros y su retorno.
2. **Naming:** 
   - Archivos: `kebab-case.tsx`
   - Componentes: `PascalCase`
   - Funciones: `camelCase`
3. **No Romper Lógica:** Antes de refactorizar, entiende el flujo existente. Si algo funciona, muévelo a la capa correcta pero mantén su funcionalidad.
4. **Verificación:** Siempre que cambies algo estructural, pide al usuario correr `npm run build` para verificar tipos.

---
*Este proyecto es de servicio comunitario. La claridad del código es tan importante como su funcionamiento.*
