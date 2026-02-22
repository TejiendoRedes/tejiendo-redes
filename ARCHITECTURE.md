# Arquitectura — Tejiendo Redes

Este documento describe la arquitectura técnica del proyecto para que cualquier desarrollador pueda entender cómo está organizado y por qué.

---

## Estructura de Carpetas

### `src/app/` — Rutas y Páginas (App Router)

Next.js App Router. Cada subdirectorio es una ruta del sistema:

| Ruta | Descripción |
|---|---|
| `app/login/` | Página de inicio de sesión |
| `app/unirse/` | Registro público de aspirantes |
| `app/dashboard/` | Dashboards por rol (super-usuario, admin, tejedor) |
| `app/datos-basicos/` | CRUDs: tejedores, pacientes, comunidades, especialidades, etc. |
| `app/abordajes/` | Gestión de abordajes y solicitudes |
| `app/atencion-medica/` | Consultas médicas |
| `app/farmacia/` | Medicamentos y entregas |
| `app/reportes/` | Generación de reportes |
| `app/estadisticas/` | Estadísticas del sistema |
| `app/api/` | Endpoints REST (auth, admin, backup) |

Cada página usa **Server Components** por defecto para fetch de datos. Los formularios y componentes interactivos se marcan con `'use client'`.

### `src/actions/` — Server Actions (Escritura)

Contiene las Server Actions que **mutan datos** (crear, actualizar, eliminar). Cada archivo corresponde a una entidad:

```
actions/
├── abordajes-actions.ts        # Crear, actualizar, eliminar abordajes
├── pacientes-actions.ts        # CRUD de pacientes
├── consultas-actions.ts        # CRUD de consultas médicas
├── peticiones-actions.ts       # Entregas de medicamentos
├── tejedores-actions.ts        # CRUD de tejedores
├── promote-aspirante.ts        # Promover aspirante a tejedor
└── ...                         # Una por entidad
```

Todas usan `'use server'` y siguen este patrón:

```typescript
'use server';

export async function createEntity(data: EntityInput) {
    try {
        // 1. Validar con Zod
        // 2. Generar código con getNextCode()
        // 3. Insertar en DB con Drizzle
        // 4. Llamar revalidatePath()
        return { success: true };
    } catch (error) {
        return { success: false, error: getErrorMessage(error, 'entidad', 'crear') };
    }
}
```

### `src/queries/` — Server Actions (Lectura)

Queries de solo lectura separadas de las mutaciones. Se llaman desde Server Components (`page.tsx`) para obtener datos iniciales:

```typescript
// queries/pacientes-actions.ts
'use server';

export async function getPacientes() {
    return await db.select().from(schema.pacientes);
}
```

### `src/components/` — Componentes React

```
components/
├── ui/              # Componentes base de shadcn/ui (Button, Input, Dialog, etc.)
├── forms/           # Formularios de cada entidad
├── layout/          # Sidebar, Header, MainContent, contenedores del layout
├── shared/          # Componentes compartidos (DataTable, SearchBar, etc.)
├── edit-dialogs/    # Diálogos de edición por entidad
├── dashboard/       # Widgets del dashboard
├── abordajes/       # Componentes específicos de abordajes
├── features/        # Componentes de features complejas
└── figma/           # Componentes auxiliares (ImageWithFallback)
```

### `src/db/` — Capa de Datos

Documentación completa en [DATABASE.md](./DATABASE.md).

### `src/lib/` — Utilidades

| Archivo/Carpeta | Descripción |
|---|---|
| `auth.ts` | JWT (encrypt, decrypt, getSession, hashPassword) |
| `error-handler.ts` | Manejo de errores MySQL con mensajes en español |
| `export-utils.ts` | Exportación a CSV y PDF |
| `id-generator.ts` | Generador thread-safe de códigos secuenciales |
| `db-utils.ts` | Monitoreo de performance de queries |
| `utils.ts` | Utilidad `cn()` para clases CSS |
| `security/` | CSRF, rate limiting, headers CSP, sanitización |
| `store/` | Zustand stores |

### `src/schemas/` — Validación con Zod

Esquemas de validación que se comparten entre formularios (cliente) y Server Actions (servidor):

```typescript
// schemas/pacientes.ts
import { z } from 'zod';

export const pacienteSchema = z.object({
    cedulaPaciente: z.string().min(1, 'La cédula es obligatoria'),
    nombrePaciente: z.string().min(1, 'El nombre es obligatorio'),
    // ...
});
```

### Otros Directorios

| Directorio | Descripción |
|---|---|
| `src/contexts/` | `AuthContext.tsx` — Provider de autenticación con React Context |
| `src/hooks/` | `use-breakpoint.ts` (responsive), `use-debounce.ts` |
| `src/types/` | `models.ts` (tipos de entidades), `app-types.ts` (tipos de UI) |
| `src/config/` | `navigation.tsx` — menú del sidebar con roles |
| `src/data/` | Datos estáticos: estados de Venezuela, tipos de patologías |
| `src/styles/` | CSS: fonts, theme, tailwind imports |

---

## Autenticación y Seguridad

### Flujo de Autenticación

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐
│  Login   │────▶│ /api/auth/  │────▶│  lib/auth.ts │
│  Form    │     │   login     │     │  (JWT+bcrypt)│
└─────────┘     └──────┬──────┘     └──────────────┘
                       │
                       ▼
                  Cookie 'session'
                  (JWT, HttpOnly, 24h)
                       │
                       ▼
               ┌───────────────┐
               │  middleware.ts │──── Rate Limiting
               │               │──── CSRF Validation
               │               │──── Role-Based Access
               └───────────────┘
```

1. El usuario envía credenciales al formulario de login.
2. `AuthContext.tsx` (cliente) hace fetch a `/api/auth/login`.
3. El endpoint verifica las credenciales con `bcryptjs.compare()`.
4. Si son válidas, genera un JWT con `jose` (HS256, 24h de expiración).
5. Se almacena en una cookie `session` (HttpOnly).
6. El `middleware.ts` intercepta cada request y:
   - Valida el JWT.
   - Aplica rate limiting (5 intentos/15min para login).
   - Valida tokens CSRF en requests POST.
   - Redirige según el rol del usuario.

### Componentes de Seguridad

| Módulo | Archivo | Función |
|---|---|---|
| **JWT** | `lib/auth.ts` | Encriptar/desencriptar tokens, gestión de sesión |
| **Rate Limiting** | `lib/security/rate-limiter.ts` | Limita intentos de login (5/15min) y registro (3/hora) |
| **CSRF** | `lib/security/csrf.ts` | Tokens CSRF firmados con JWT para requests POST |
| **Headers** | `lib/security/headers.ts` | CSP, X-Frame-Options, HSTS y otros headers de seguridad |
| **Sanitización** | `lib/security/sanitize.ts` | Limpieza de HTML/XSS en inputs del usuario |
| **Middleware** | `middleware.ts` | Orquesta todo: auth, rate limiting, CSRF, RBAC |

---

## Gestión de Estado con Zustand

El proyecto usa **Zustand** para estado global del cliente, específicamente para el manejo de modales de edición:

```typescript
// lib/store/edit-modal-store.ts
export const useEditModalStore = create<EditModalState>((set) => ({
    isOpen: false,
    entityType: null,       // 'paciente' | 'tejedor' | 'comunidad' | etc.
    entityId: null,
    openEditModal: (type, id) => set({ isOpen: true, entityType: type, entityId: id }),
    closeEditModal: () => set({ isOpen: false, entityType: null, entityId: null }),
}));
```

**Principio:** Zustand se usa solo para estado de UI que necesita ser compartido entre componentes sin relación padre-hijo. Los datos del servidor se manejan con Server Components y Server Actions.

---

## Manejo de Formularios

Patrón utilizado en todos los formularios del sistema:

```
React Hook Form  →  Zod (validación)  →  Server Action (mutación)
```

1. **`react-hook-form`** controla el estado del formulario.
2. **`@hookform/resolvers/zod`** conecta la validación Zod al formulario.
3. El `onSubmit` llama a una **Server Action** que valida de nuevo en el servidor.

```typescript
const form = useForm<PacienteInput>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: { /* ... */ },
});

async function onSubmit(data: PacienteInput) {
    const result = await createPaciente(data);
    if (result.success) {
        toast.success('Paciente creado');
        router.refresh();
    } else {
        toast.error(result.error);
    }
}
```

---

## Generación de Reportes

### PDF (jsPDF + jspdf-autotable)

```typescript
// lib/export-utils.ts → exportToPDF()
// Genera PDFs con tablas formateadas, incluyendo:
// - Título y fecha de generación
// - Columnas configurables con renders custom
// - Estilos alternos por fila
```

### CSV/Excel (xlsx)

```typescript
// lib/export-utils.ts → exportToCSV()
// Genera archivos CSV descargables usando la librería xlsx
// Soporta columnas con renders custom para formatear datos
```

Ambas funciones usan la interfaz `ExportColumn<T>` que permite definir columnas con headers, keys y funciones render personalizadas.

---

## Testing

### Stack

- **Vitest** como test runner (compatible con la API de Jest).
- **React Testing Library** para tests de componentes.
- **jsdom** como entorno de navegador simulado.

### Configuración

```
vitest.config.ts        # Configuración principal
src/__tests__/
├── setup.ts            # Setup global (configuración de matchers, mocks)
├── actions/            # Tests de Server Actions
├── components/         # Tests de componentes
└── README.md           # Documentación de testing
```

### Ejecutar Tests

```bash
npm run test           # Modo watch
npm run test:ui        # UI visual
npm run test:coverage  # Con cobertura
```

---

## Middleware (middleware.ts)

El middleware intercepta **todas** las requests (excepto assets estáticos) y ejecuta en orden:

1. **Rate Limiting** — Limita intentos de login y registro por IP.
2. **CSRF Validation** — Valida tokens en requests POST a rutas de auth.
3. **Session Validation** — Desencripta la cookie JWT.
4. **Route Protection** — Redirige a login si no hay sesión.
5. **Role-Based Access** — Redirige al dashboard correcto según el rol.
6. **Security Headers** — Aplica CSP, HSTS, X-Frame-Options a todas las respuestas.

---

## Manejo de Errores

El archivo `lib/error-handler.ts` proporciona un sistema centralizado que:

- Detecta tipos de error MySQL (foreign key, duplicate, required field, connection).
- Genera mensajes en **español** legibles para el usuario.
- Traduce nombres de campos técnicos a nombres humanos.
- Proporciona mensajes específicos por entidad para operaciones de eliminación.

Uso en Server Actions:

```typescript
import { getErrorMessage } from '@/lib/error-handler';

catch (error) {
    return { success: false, error: getErrorMessage(error, 'paciente', 'crear') };
}
```
