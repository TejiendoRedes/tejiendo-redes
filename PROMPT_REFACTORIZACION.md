# Prompt Maestro de Reestructuración (Arquitectura por Capas)

Copia y pega este prompt exactamente como está en tu asistente de IA (Cursor, Windsurf, o GitHub Copilot) cuando vayas a iniciar la refactorización.

---
**INICIO DEL PROMPT**

Actúa como un Arquitecto de Software Senior y un Experto en Next.js (App Router), React 19 y Drizzle ORM. Vamos a reestructurar este proyecto hacia una arquitectura en capas orientada a "Features" (Feature-Sliced Design / Layered Architecture) para que sea altamente mantenible y amigable con futuras IAs ("AI-friendly").

**LA REGLA DE ORO:** NO PUEDES ROMPER NINGUNA FUNCIONALIDAD EXISTENTE. El código actual es funcional y debe permanecer 100% funcional en todo momento. Trabajaremos paso a paso y de manera iterativa.

**ESTRUCTURA OBJETIVO:**
```text
src/
├── app/                 # SOLO enrutamiento, layouts y llamadas a queries/actions.
├── actions/             # Server Actions ("use server") para mutaciones (crear, editar, borrar).
├── queries/             # Funciones de lectura de BD (fetching para Server Components).
├── components/
│   ├── ui/              # Componentes genéricos (Shadcn, botones, inputs).
│   └── features/        # Componentes específicos del dominio (ej. abordajes, consultas).
├── db/                  # (Mantener como está) Schemas de Drizzle y conexión.
├── lib/                 # Utilidades (formatters, constants, auth helpers).
├── schemas/             # Validaciones de Zod compartidas entre frontend y backend.
```

**METODOLOGÍA DE TRABAJO (Plan de Ejecución Paso a Paso):**
Sigue estrictamente este orden. No avances al siguiente paso hasta que yo te confirme explícitamente que el paso actual se completó correctamente y no hay errores.

**PASO 1: Auditoría y Mapeo**
- Analiza todos los archivos dentro de `src/app`.
- Identifica dónde hay "Server Actions" definidas inline o dentro de los archivos de página.
- Identifica dónde hay llamadas directas a Drizzle ORM desde los componentes de React o páginas.
- Hazme una lista/reporte detallado de lo que encontraste y propón qué moveremos primero.
- **Detente aquí y espera mi confirmación ("Adelante con el Paso 2").**

**PASO 2: Extracción de Validaciones (Zod)**
- Crea la carpeta `src/schemas` (si no existe).
- Localiza todos los esquemas de validación (generalmente usando Zod) que se usan en los formularios o acciones.
- Mueve estos esquemas a `src/schemas`, agrupándolos por dominio (ej. `src/schemas/abordajes.schema.ts`).
- Asegúrate de exportar tanto el schema como el Type de TypeScript inferido (`z.infer`).
- Actualiza las importaciones en todo el proyecto.
- **Detente aquí y espera mi confirmación ("Adelante con el Paso 3").**

**PASO 3: Extracción de Capa de Datos (Queries & Actions)**
- Crea las carpetas `src/queries` y `src/actions`.
- Extrae todas las peticiones de SOLO LECTURA (GETs a Drizzle) hacia `src/queries` agrupadas por dominio.
- Extrae todas las mutaciones (POST, PUT, DELETE) hacia archivos en `src/actions` con la directiva `"use server"` al inicio del archivo.
- En los actions, re-utiliza las validaciones de `src/schemas`.
- Actualiza las importaciones en los Server Components (para usar las queries) y Client Components (para usar los actions sin romper los hooks como `useTransition` o react-hook-form).
- Garantiza que los tiempos de carga y manejo de errores sigan funcionando (ej. manejando Server Action Responses).
- **Detente aquí y espera mi confirmación ("Adelante con el Paso 4").**

**PASO 4: Refactorización y Limpieza de UI (Features)**
- Mueve los componentes pesados, modales, formularios complejos y listas especializadas desde `src/app` hacia `src/components/features/` agrupándolos lógicamente (ej. `src/components/features/abordajes/AbordajeForm.tsx`).
- El objetivo es que los archivos `page.tsx` en `src/app` queden muy delgados: Solo deben leer parámetros (`params`, `searchParams`), llamar a las `queries/` y renderizar un contenedor o un componente de la carpeta `features/`.
- **Detente aquí y espera mi confirmación ("Proyecto reestructurado. Ejecuta el build final").**

**PASO 5: Verificación Final**
- Ejecuta el linter y soluciona cualquier problema de importaciones.
- Si todo está correcto, habremos terminado.

Por favor, confirma que entiendes la Regla de Oro y este flujo de trabajo. Cuando confirmes, empieza inmediatamente con el PASO 1.
**FIN DEL PROMPT**
---
