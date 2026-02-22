# Base de Datos — Tejiendo Redes

## Visión General

El proyecto utiliza **Drizzle ORM** como capa de abstracción sobre una base de datos **MySQL**. Los esquemas se definen en TypeScript en `src/db/schema/`, y Drizzle genera migraciones SQL versionadas en la carpeta `drizzle/`.

### Arquitectura de Archivos

```
src/db/
├── schema/                 # Definición de tablas en TypeScript
│   ├── index.ts            # Barrel export de todos los schemas
│   ├── relations.ts        # Relaciones entre tablas (Drizzle relations API)
│   ├── users.ts            # Usuarios del sistema
│   ├── tejedores.ts        # Voluntarios
│   ├── aspirantes.ts       # Aspirantes a tejedores
│   ├── pacientes.ts        # Pacientes
│   ├── comunidades.ts      # Comunidades atendidas
│   ├── responsable.ts      # Responsables comunitarios
│   ├── abordajes.ts        # Eventos de abordaje
│   ├── abordaje-asistencia.ts  # Asistencia en abordajes
│   ├── consultas.ts        # Consultas médicas
│   ├── medicamentos.ts     # Inventario farmacéutico
│   ├── peticiones.ts       # Solicitudes/entregas de medicamentos
│   ├── medicos.ts          # Médicos (tejedores con especialidad)
│   ├── especialidades.ts   # Catálogo de especialidades médicas
│   ├── enfermedades.ts     # Catálogo de enfermedades
│   ├── organismos.ts       # Instituciones asociadas
│   ├── antecedentes.ts     # Historial médico de pacientes
│   ├── solicitudes-abordajes.ts  # Solicitudes de nuevos abordajes
│   ├── mantenimiento.ts    # Registro de mantenimiento del sistema
│   └── audit_logs.ts       # Logs de auditoría
├── client.ts               # Pool de conexión MySQL (mysql2/promise)
├── index.ts                # Instancia Drizzle + exports
├── migrate.ts              # Script de migración programática
├── hard-reset.ts           # Reset destructivo completo
├── reset.ts                # Truncar tablas y re-sembrar
├── drop-bridge-tables.ts   # Eliminar solo tablas puente
├── seed-complex.ts         # Datos de prueba complejos
├── manual-migrate.ts       # Migración manual
├── apply-logistics.ts      # Aplicar campos logísticos
└── seeds/                  # Archivos de seed data
```

---

## Configuración Inicial

### 1. Variables de Entorno

En `.env.local`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=tu_contraseña
DATABASE_NAME=bd_sistema_abordajes
```

### 2. Crear la Base de Datos

```sql
CREATE DATABASE IF NOT EXISTS `bd_sistema_abordajes`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
```

### 3. Aplicar Esquema

```bash
npm run db:refresh
```

---

## Scripts de Base de Datos — Guía Detallada

### `npm run db:generate`

**Qué hace:** Lee los archivos TypeScript en `src/db/schema/` y genera archivos de migración SQL en `drizzle/`. No toca la base de datos.

**Cuándo usarlo:** Después de modificar cualquier archivo de schema (agregar tabla, columna, etc.).

**¿Borra datos?** 🟢 No.

---

### `npm run db:migrate`

**Qué hace:** Aplica las migraciones pendientes (archivos SQL en `drizzle/`) a la base de datos. Solo ejecuta las que no se han aplicado aún.

**Cuándo usarlo:** Después de `db:generate`, o al clonar el proyecto por primera vez.

**¿Borra datos?** 🟢 No (a menos que una migración incluya `DROP` o `ALTER` destructivos).

---

### `npm run db:refresh`

**Qué hace:** Ejecuta `db:generate` + `db:migrate` en secuencia. Es el atajo para el flujo diario de desarrollo.

**Cuándo usarlo:** ⭐ **Este es el comando más usado en el día a día.** Úsalo cada vez que modifiques un schema.

**¿Borra datos?** 🟢 No (normalmente).

---

### `npm run db:push`

**Qué hace:** Sincroniza el esquema TypeScript directamente con la BD, sin generar archivos de migración. Es más rápido pero no deja trazabilidad.

**Cuándo usarlo:** Solo para prototipado rápido cuando trabajas solo y no te importa la trazabilidad.

**¿Borra datos?** ⚠️ Posible — puede hacer `ALTER` destructivos automáticamente.

> **Recomendación:** Usa `db:refresh` en lugar de `db:push` siempre que sea posible.

---

### `npm run db:seed`

**Qué hace:** Inserta datos iniciales básicos: usuarios por defecto del sistema (superusuario, admin, etc.).

**Cuándo usarlo:** Después de un `db:hard-reset` o al configurar el proyecto por primera vez.

**¿Borra datos?** 🟢 No — solo inserta.

---

### `npm run db:seed:complex`

**Qué hace:** Inserta datos de prueba complejos: tejedores, pacientes, comunidades, abordajes, consultas y medicamentos de ejemplo. Genera un dataset realista para testing.

**Cuándo usarlo:** Cuando necesitas datos realistas para probar funcionalidades o hacer demos.

**¿Borra datos?** 🟢 No — solo inserta. Puede fallar si ya existen datos con las mismas claves.

---

### `npm run db:reset`

**Qué hace:** Trunca (vacía) todas las tablas de datos y luego ejecuta el seed básico para recrear usuarios por defecto. Las tablas y la estructura se mantienen intactas.

**Cuándo usarlo:** Cuando quieres empezar con datos limpios sin alterar la estructura de las tablas.

**¿Borra datos?** 🔴 Sí — elimina todos los datos pero mantiene la estructura.

---

### `npm run db:hard-reset`

**Qué hace:** Elimina TODAS las tablas de la base de datos. Desactiva temporalmente las comprobaciones de claves foráneas (`SET FOREIGN_KEY_CHECKS = 0`) para poder eliminar tablas en cualquier orden. Después de esto, necesitas ejecutar `db:refresh` para recrear las tablas.

**Cuándo usarlo:** Cuando hay conflictos graves de migraciones, o cuando necesitas empezar completamente desde cero.

**¿Borra datos?** 🔴 Sí — **DESTRUCCIÓN TOTAL**. Elimina datos y estructura.

**Flujo completo después de un hard-reset:**
```bash
npm run db:hard-reset
npm run db:refresh
npm run db:seed        # Opcional: datos iniciales
```

---

### `npm run db:soft-refresh`

**Qué hace:** Verifica si hay conflictos potenciales en el esquema antes de aplicar cambios. Es una versión más segura y cautelosa de `db:refresh`.

**Cuándo usarlo:** Cuando quieres validar que los cambios de esquema no causen problemas antes de aplicarlos.

**¿Borra datos?** 🟢 No.

---

### `npm run db:drop-bridge`

**Qué hace:** Elimina las tablas puente (many-to-many) que conectan entidades: tablas como `abordaje_comunidad`, `tejedores_abordaje`, `consultas_enfermedades`, etc. Es útil cuando las claves foráneas de estas tablas impiden modificar las tablas principales.

**Cuándo usarlo:** Cuando recibes errores como `Cannot drop index 'PRIMARY': needed in a foreign key constraint` al intentar modificar tablas principales.

**¿Borra datos?** 🟡 Parcial — solo las tablas puente.

**Flujo típico:**
```bash
npm run db:drop-bridge
npm run db:refresh
```

---

### `npm run db:studio`

**Qué hace:** Abre Drizzle Studio, una interfaz web visual para explorar la base de datos en `https://local.drizzle.studio`.

**Cuándo usarlo:** Para explorar datos, verificar registros, ejecutar queries manuales, o depurar.

---

## Modelo de Datos

### Entidades Principales

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  responsable │────▶│  comunidades │     │ especialidad │
└──────────────┘     └──────────────┘     └──────┬───────┘
                           │                     │
                     ┌─────┘                     │
                     ▼                           ▼
               ┌──────────┐              ┌──────────┐
               │ abordaje │◀─────────────│  medicos  │
               └──────────┘              └──────────┘
                  │    │                       │
          ┌───────┘    └────────┐              │
          ▼                    ▼              ▼
    ┌──────────┐        ┌──────────┐   ┌──────────────┐
    │ tejedor  │        │ paciente │───│  consultas   │
    └──────────┘        └──────────┘   └──────────────┘
         │                   │                │
         │                   │                ▼
         │                   │         ┌──────────────┐
         │              ┌────┘         │ enfermedades │
         │              ▼              └──────────────┘
         │        ┌──────────┐
         │        │anteceden.│
         │        └──────────┘
         │              │
         ▼              ▼
    ┌─────────────────────────┐
    │   peticiones/entregas   │◀───┌──────────────┐
    │   (medicamentos)        │    │ medicamentos  │
    └─────────────────────────┘    └──────────────┘
```

### Códigos Autogenerados

Cada entidad usa códigos con formato `PREFIJO-NNN` generados secuencialmente:

| Entidad | Prefijo | Ejemplo |
|---|---|---|
| Comunidad | `COM-` | `COM-001` |
| Abordaje | `ABD-` | `ABD-015` |
| Consulta | `CON-` | `CON-042` |
| Medicamento | `MED-` | `MED-003` |
| Especialidad | `ESP-` | `ESP-001` |

La generación se realiza de forma thread-safe usando `MAX() + FOR UPDATE` en transacciones (ver `src/lib/id-generator.ts`).

---

## Uso en el Código

### Importar

```typescript
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
```

### Queries Tipados

```typescript
// SELECT
const pacientes = await db.select().from(schema.pacientes);

// INSERT
await db.insert(schema.comunidades).values({
  codigoComunidad: 'COM-001',
  nombreComunidad: 'San Martín',
  cedulaResponsable: '12345678',
});

// UPDATE
await db.update(schema.medicamentos)
  .set({ existencia: 50 })
  .where(eq(schema.medicamentos.codigoMedicamento, 'MED-001'));

// DELETE
await db.delete(schema.abordaje)
  .where(eq(schema.abordaje.codigoAbordaje, 'ABD-001'));
```

---

## Troubleshooting

| Error | Solución |
|---|---|
| `Cannot connect to MySQL` | Verifica que MySQL esté corriendo y las credenciales en `.env.local` sean correctas |
| `Table doesn't exist` | Ejecuta `npm run db:refresh` para crear las tablas |
| `Foreign key constraint fails` | Verifica que los registros referenciados existan. Si es en migración, usa `npm run db:drop-bridge` y luego `npm run db:refresh` |
| `Cannot drop index 'PRIMARY'` | Ejecuta `npm run db:drop-bridge` seguido de `npm run db:refresh` |
| `Duplicate entry` | El registro ya existe. Verifica los datos antes de insertar |

---

## Seguridad

- ✅ Credenciales en `.env.local` (excluido del repositorio via `.gitignore`)
- ✅ Queries tipados con prepared statements (protección contra SQL injection)
- ✅ Claves foráneas configuradas para integridad referencial
- ✅ Character set `utf8mb4` para soporte completo de caracteres especiales
- ✅ Timezone configurado en UTC
