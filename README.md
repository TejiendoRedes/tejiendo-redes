# Tejiendo Redes — Sistema de Gestión de Abordajes Comunitarios

Sistema web para la gestión integral de abordajes comunitarios en salud. Permite administrar tejedores (voluntarios), pacientes, comunidades, abordajes, consultas médicas, farmacia y reportes.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.x |
| **Lenguaje** | TypeScript | 5.x |
| **UI** | React | 19.x |
| **Estilos** | Tailwind CSS + shadcn/ui | v4 |
| **Base de Datos** | MySQL | 8.x |
| **ORM** | Drizzle ORM | 0.45+ |
| **Autenticación** | JWT custom (jose + bcryptjs) | — |
| **Estado global** | Zustand | 5.x |
| **Formularios** | React Hook Form + Zod | — |
| **Reportes** | jsPDF + xlsx | — |
| **Testing** | Vitest + React Testing Library | — |

---

## Requisitos Previos

- **Node.js** >= 20.x
- **npm** >= 10.x
- **MySQL** >= 8.0 (local o remoto — ej. Aiven, PlanetScale)

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd tejiendo-redes
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Conexión a MySQL
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=tu_contraseña
DATABASE_NAME=bd_sistema_abordajes

# Secreto para JWT (OBLIGATORIO — usa un string largo y aleatorio)
JWT_SECRET_KEY=tu_clave_secreta_super_segura_aqui
```

### 4. Crear la base de datos

```sql
CREATE DATABASE IF NOT EXISTS `bd_sistema_abordajes`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
```

### 5. Generar y aplicar migraciones

```bash
npm run db:refresh
```

### 6. (Opcional) Poblar datos de prueba

```bash
npm run db:seed
```

### 7. Iniciar el servidor de desarrollo

```bash
npm run dev:turbo
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Scripts de NPM

### Desarrollo

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo Next.js |
| `npm run dev:turbo` | Inicia servidor con Turbopack (más rápido) ⭐ **Recomendado** |
| `npm run build` | Compila la app para producción |
| `npm run start` | Inicia servidor de producción (requiere `build` previo) |
| `npm run lint` | Ejecuta ESLint para verificar calidad de código |

### Base de Datos

| Script | Descripción | ¿Borra datos? |
|---|---|:---:|
| `npm run db:generate` | Genera archivos de migración SQL desde schemas TypeScript | 🟢 No |
| `npm run db:migrate` | Aplica migraciones pendientes a la BD | 🟢 No* |
| `npm run db:refresh` | `generate` + `migrate` en un solo comando | 🟢 No* |
| `npm run db:push` | Sincroniza esquema directamente sin migraciones (solo dev) | ⚠️ Posible |
| `npm run db:seed` | Puebla con datos iniciales (usuarios por defecto) | 🟢 No |
| `npm run db:seed:complex` | Puebla con datos complejos de prueba | 🟢 No |
| `npm run db:soft-refresh` | Verifica conflictos antes de actualizar esquema | 🟢 No |
| `npm run db:reset` | Trunca todas las tablas y re-siembra usuarios | 🔴 Sí |
| `npm run db:hard-reset` | Elimina TODAS las tablas y datos | 🔴 Sí |
| `npm run db:drop-bridge` | Elimina solo tablas puente (many-to-many) | 🟡 Parcial |
| `npm run db:studio` | Abre Drizzle Studio (UI visual para explorar la BD) | — |

\* *Depende del contenido de las migraciones.*

> Para documentación detallada de la base de datos, ver [DATABASE.md](./DATABASE.md).

### Testing

| Script | Descripción |
|---|---|
| `npm run test` | Ejecuta Vitest en modo watch |
| `npm run test:ui` | Abre la UI visual de Vitest |
| `npm run test:coverage` | Genera reporte de cobertura de tests |

---

## Estructura del Proyecto

```
src/
├── app/                    # Rutas y páginas (Next.js App Router)
│   ├── api/                # Endpoints REST (auth, admin, backup)
│   ├── abordajes/          # Módulo de abordajes comunitarios
│   ├── atencion-medica/    # Módulo de consultas médicas
│   ├── dashboard/          # Dashboards por rol
│   ├── datos-basicos/      # CRUD de entidades base
│   ├── farmacia/           # Módulo de medicamentos y entregas
│   ├── reportes/           # Generación de reportes PDF/CSV
│   └── login/              # Autenticación
├── actions/                # Server Actions (mutaciones de datos)
├── queries/                # Server Actions de lectura (queries)
├── components/             # Componentes React reutilizables
│   ├── ui/                 # Componentes base (shadcn/ui)
│   ├── forms/              # Formularios de entidades
│   ├── layout/             # Sidebar, header, contenedores
│   └── shared/             # Componentes compartidos
├── db/                     # Base de datos (Drizzle ORM)
│   ├── schema/             # Definición de tablas (TypeScript)
│   └── seeds/              # Datos de prueba
├── lib/                    # Utilidades y lógica compartida
│   ├── security/           # CSRF, rate limiting, headers, sanitización
│   └── store/              # Zustand stores
├── schemas/                # Esquemas de validación Zod
├── contexts/               # React Context (AuthContext)
├── hooks/                  # Custom hooks
├── types/                  # Tipos TypeScript globales
├── config/                 # Configuración (navegación)
├── data/                   # Datos estáticos (estados, patologías)
└── middleware.ts            # Middleware Next.js (auth + seguridad)
```

> Para detalles arquitectónicos, ver [ARCHITECTURE.md](./ARCHITECTURE.md).  
> Para guía del nuevo equipo, ver [HANDOVER.md](./HANDOVER.md).

---

## Roles de Usuario

| Rol | Dashboard | Acceso |
|---|---|---|
| `superuser` | `/dashboard/super-usuario` | Acceso total al sistema |
| `admin` | `/dashboard/admin` | Administración y operaciones |
| `tejedor` | `/dashboard/tejedor` | Operaciones de campo |
| `medico` | `/atencion-medica` | Consultas médicas |
| `operador` | `/datos-basicos` | Gestión de datos |

---

## Despliegue

El proyecto está configurado para desplegarse en **Vercel**. Asegúrate de configurar las variables de entorno en el panel de Vercel.

---

## Licencia

Proyecto de servicio comunitario. Uso interno.
