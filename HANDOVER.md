# Guía de Traspaso (Handover) — Tejiendo Redes

Guía práctica para el nuevo equipo de desarrollo. Léela antes de hacer cualquier cambio en el proyecto.

---

## Primeros Pasos

1. Lee el [README.md](./README.md) y sigue la instalación.
2. Lee el [ARCHITECTURE.md](./ARCHITECTURE.md) para entender la estructura.
3. Lee el [DATABASE.md](./DATABASE.md) para entender los scripts de BD.
4. Levanta el proyecto con `npm run dev:turbo`.
5. Prueba iniciar sesión con los usuarios de prueba del seed.

---

## Convenciones de Código

### Estructura de Archivos

| Tipo | Ubicación | Nombrado |
|---|---|---|
| Páginas/Rutas | `src/app/[ruta]/page.tsx` | Directorio en kebab-case |
| Server Actions (escritura) | `src/actions/[entidad]-actions.ts` | kebab-case + sufijo `-actions` |
| Server Actions (lectura) | `src/queries/[entidad]-actions.ts` | kebab-case + sufijo `-actions` |
| Componentes | `src/components/[categoria]/` | PascalCase (ej. `PatientForm.tsx`) |
| Schemas de validación | `src/schemas/[entidad].ts` | kebab-case |
| Schemas de BD | `src/db/schema/[entidad].ts` | kebab-case |
| Tipos globales | `src/types/` | kebab-case |

### Imports

Orden recomendado en cada archivo:

```typescript
// 1. React y Next.js
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Librerías de terceros
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

// 3. Alias absolutos (@/)
import { db, schema } from '@/db';
import { Button } from '@/components/ui/button';

// 4. Imports relativos (si los hay)
import { localHelper } from './helpers';
```

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar entrega de medicamentos
fix: corregir cálculo de inventario
refactor: reorganizar componentes de abordajes
docs: actualizar README con nuevos scripts
```

---

## Cómo Agregar una Nueva Entidad a la Base de Datos

### Paso 1: Crear el Schema

Crea `src/db/schema/mi-entidad.ts`:

```typescript
import { mysqlTable, varchar, int, date, timestamp } from 'drizzle-orm/mysql-core';

export const miEntidad = mysqlTable('mi_entidad', {
    codigoMiEntidad: varchar('codigo_mi_entidad', { length: 20 }).primaryKey(),
    nombre: varchar('nombre', { length: 100 }).notNull(),
    // ... más campos
    createdAt: timestamp('created_at').defaultNow(),
});

// Tipos inferidos automáticamente
export type MiEntidad = typeof miEntidad.$inferSelect;
export type NewMiEntidad = typeof miEntidad.$inferInsert;
```

### Paso 2: Registrar en el Index

En `src/db/schema/index.ts`, agrega:

```typescript
export * from './mi-entidad';
```

### Paso 3: Definir Relaciones (si aplica)

En `src/db/schema/relations.ts`, agrega las relaciones con Drizzle:

```typescript
export const miEntidadRelations = relations(miEntidad, ({ one, many }) => ({
    comunidad: one(comunidades, {
        fields: [miEntidad.codigoComunidad],
        references: [comunidades.codigoComunidad],
    }),
}));
```

### Paso 4: Generar y Aplicar Migración

```bash
npm run db:refresh
```

### Paso 5: Crear Schema de Validación (Zod)

Crea `src/schemas/mi-entidad.ts`:

```typescript
import { z } from 'zod';

export const miEntidadSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    // ... validaciones
});

export type MiEntidadInput = z.infer<typeof miEntidadSchema>;
```

### Paso 6: Crear Server Actions

Crea `src/actions/mi-entidad-actions.ts`:

```typescript
'use server';
import { db, schema } from '@/db';
import { getNextCode } from '@/lib/id-generator';
import { getErrorMessage } from '@/lib/error-handler';
import { revalidatePath } from 'next/cache';

export async function createMiEntidad(data: MiEntidadInput) {
    try {
        const codigo = await getNextCode(schema.miEntidad, schema.miEntidad.codigoMiEntidad, 'MIE-');
        await db.insert(schema.miEntidad).values({ codigoMiEntidad: codigo, ...data });
        revalidatePath('/mi-ruta');
        return { success: true };
    } catch (error) {
        return { success: false, error: getErrorMessage(error, 'mi entidad', 'crear') };
    }
}
```

Y `src/queries/mi-entidad-actions.ts` para las queries de lectura.

---

## Cómo Crear una Nueva Página/Módulo

### Paso 1: Crear la Ruta

Crea `src/app/mi-modulo/page.tsx`:

```typescript
import { getMiEntidades } from '@/queries/mi-entidad-actions';
import { MiEntidadList } from '@/components/mi-modulo/MiEntidadList';

export default async function MiModuloPage() {
    const entidades = await getMiEntidades();
    return <MiEntidadList data={entidades} />;
}
```

### Paso 2: Crear el Componente Cliente

Crea `src/components/mi-modulo/MiEntidadList.tsx`:

```typescript
'use client';
import { DataTable } from '@/components/shared/DataTable';
// ... componentes de UI

export function MiEntidadList({ data }: { data: MiEntidad[] }) {
    // ... lógica del componente
}
```

### Paso 3: Agregar al Menú de Navegación

En `src/config/navigation.tsx`, agrega la entrada del menú:

```typescript
{
    label: 'Mi Módulo',
    path: '/mi-modulo',
    icon: <SomeIcon className="w-5 h-5" />,
    roles: ['admin', 'superuser'],  // ¿Quién puede ver este menú?
}
```

---

## Patrones Importantes

### Manejo de Errores

**Siempre usa** `getErrorMessage()` de `lib/error-handler.ts` en los catch de Server Actions. Genera mensajes en español y detecta errores MySQL automáticamente.

### Códigos Autogenerados

**Nunca generes códigos manualmente.** Usa `getNextCode()` de `lib/id-generator.ts`. Es thread-safe y previene duplicados:

```typescript
const codigo = await getNextCode(schema.miEntidad, schema.miEntidad.codigoMiEntidad, 'PREFIJO-');
```

### Notificaciones al Usuario

Usa `sonner` (toast) para feedback visual:

```typescript
import { toast } from 'sonner';

toast.success('Registro creado exitosamente');
toast.error('Error al crear el registro');
```

### Validación Doble

Valida en cliente (UX rápida) Y en servidor (seguridad):

```
Cliente: React Hook Form + Zod  →  feedback inmediato al usuario
Servidor: Server Action + Zod   →  protección contra manipulación
```

---

## Preguntas Frecuentes

**¿Dónde van los nuevos componentes de UI?**  
Si es reutilizable → `src/components/shared/`. Si es específico de un módulo → `src/components/[modulo]/`.

**¿Por qué hay `src/actions/` y `src/queries/` separados?**  
`actions/` contiene mutaciones (POST/PUT/DELETE). `queries/` contiene lecturas (GET). Esto facilita auditorías de seguridad y mantiene la separación de responsabilidades.

**¿Cómo agrego un nuevo rol?**  
1. Actualiza el middleware (`src/middleware.ts`) con las rutas permitidas.
2. Actualiza `src/config/navigation.tsx` con los items de menú visibles.
3. Actualiza la función `redirectToDashboard()` en el middleware.

**¿Puedo usar `db:push` en producción?**  
**No.** Usa siempre `db:refresh` (migraciones versionadas) en producción.

**¿Dónde reporto un bug?**  
Crea un issue en el repositorio con el formato: `[BUG] Descripción breve`.
