# 🚀 Mega-Prompt de Reestructuración Arquitectónica

Este documento contiene las instrucciones definitivas para una IA (Claude 3.5 Sonnet, GPT-4o o similares) para realizar el "lavado de cara" final al proyecto **Tejiendo Redes**.

---

## 📝 Instrucciones para el Usuario
Copia el bloque de texto de abajo ("EL PROMPT") y pégalo en tu chat de IA preferido una vez que hayas adjuntado (o dado acceso) a los archivos del proyecto.

---

## 🔥 EL PROMPT (Copiar desde aquí)

> Eres un **Principal Software Engineer** especializado en arquitecturas de alto rendimiento con **Next.js 15**, **TypeScript** y **Drizzle ORM**. Tu misión es realizar un "lavado de cara" arquitectónico al proyecto "Tejiendo Redes" para garantizar que sea modular, escalable y 100% amigable para futuras IAs.
>
> ### 🎯 OBJETIVO GENERAL
> Reubicar y estandarizar el código siguiendo el **Patrón de Capas** definido en el archivo `.rules`. El código debe quedar limpio, documentado y sin deuda técnica, **SIN ALTERAR** la lógica de negocio ni la base de datos.
>
> ### 🛠 PROTOCOLO DE REESTRUCTURACIÓN
>
> #### Fase 1: Estandarización de la Capa de Datos
> 1. Asegura que todas las funciones en `src/queries/` y `src/actions/` usen el **Result Pattern** (`{ success, data, error }`).
> 2. Implementa `try/catch` robustos en cada función de servicio.
> 3. Utiliza tipos inferidos de Drizzle (`InferSelectModel`, `InferInsertModel`) para evitar interfaces redundantes.
>
> #### Fase 2: Saneamiento de Componentes
> 1. Extrae cualquier lógica de `useEffect` o cálculos pesados de los componentes hacia funciones de utilidad o hooks personalizados.
> 2. Convierte componentes de página en **Server Components** puros, delegando la interactividad a componentes de cliente pequeños.
> 3. Mueve componentes a sus carpetas correctas:
>    - UI Genérica ➡ `src/components/ui/`
>    - Lógica de Dominio ➡ `src/components/features/`
>    - Formularios ➡ `src/components/forms/`
>
> #### Fase 3: Documentación y Calidad
> 1. Elimina comentarios JSDoc "placeholder" (vacíos).
> 2. Genera documentación JSDoc en cada función exportada indicando propósito y tipos.
> 3. Renombra archivos a `kebab-case` si no lo están.
>
> ### ⚠️ RESTRICCIONES CRÍTICAS
> - NO crees nuevas migraciones de base de datos.
> - NO cambies el comportamiento de los formularios de cara al usuario.
> - Mantén el stack tecnológico: Tailwind v4 / ShadcnUI / Lucide React.
>
> **¿Estás listo? Comienza analizando el módulo de [INSERTAR_NOMBRE_MODULO] y propón los cambios por bloques.**

---

## 💡 Consejos para la IA
- **Prioridad**: Empieza por los módulos más críticos (Abordajes, Consultas).
- **Consistencia**: Un error en un archivo debe ser corregido en todos los archivos similares.
- **Limpieza**: Si ves un archivo `.js` que debería ser `.ts` o `.tsx`, propón la migración.

---
*Este prompt garantiza una transición fluida entre grupos de desarrollo, manteniendo la excelencia técnica.*
