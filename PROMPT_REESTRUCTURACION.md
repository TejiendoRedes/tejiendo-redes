# Prompt de Reestructuración Masiva: Tejiendo Redes

Actúa como un **Arquitecto Senior de Software Experto en Next.js 15 y Drizzle ORM**. Tu misión es realizar un "lavado de cara" completo a la arquitectura del proyecto sin alterar la lógica de negocio ni la estructura de la base de datos.

## 🎯 Objetivos de la Tarea

1.  **Estandarización de Retornos:**
    - Refactoriza todas las funciones en `src/actions/` para que sigan el **Result Pattern**: `{ success: boolean, message: string, data?: T, error?: string }`.
2.  **Organización de Componentes:**
    - Mueve componentes de lógica compleja de la carpeta `ui/` a `components/features/`.
    - Asegura que `src/components/ui/` contenga solo componentes visuales puros.
3.  **Refuerzo de Tipado:**
    - Elimina cualquier uso de `any`.
    - Usa `InferSelectModel` e `InferInsertModel` de Drizzle para tipar los argumentos y retornos de Queries y Actions.
4.  **Limpieza de Código:**
    - Elimina comentarios JSDoc vacíos o redundantes.
    - Asegura que cada Query y Action tenga un JSDoc descriptivo.
5.  **Actualización de Importaciones:** 
    - Después de mover archivos, actualiza todas las referencias e importaciones para asegurar que el proyecto compile.

## 📜 Reglas de Ejecución

- **NO** modifiques los archivos en `src/db/schema/`.
- **NO** cambies la lógica de las validaciones Zod, solo muévelas si es necesario a `src/schemas/`.
- **Verifica** el build después de cada grupo de cambios usando `npm run build`.
- Si encuentras un flujo extremadamente complejo, **documenta** el proceso en lugar de simplificarlo agresivamente para evitar bugs.

---
*Instrucción final: Analiza primero toda la estructura actual y propón un plan de migración paso a paso antes de empezar a editar.*
