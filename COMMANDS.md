# Comandos del Proyecto

Este documento explica el sistema de gestión de base de datos y desarrollo del proyecto.

## 🚀 Desarrollo

- **`npm run dev`**: Inicia el servidor de desarrollo de Next.js.
- **`npm run dev:turbo`**: Inicia el servidor de desarrollo con Turbopack (más rápido).
- **`npm run build`**: Compila la aplicación para producción.
- **`npm run start`**: Inicia el servidor de producción (requiere `npm run build` previo).
- **`npm run lint`**: Ejecuta el linter (ESLint) para buscar errores en el código.

## 🗄️ Base de Datos - Sistema Profesional

Este proyecto usa un **sistema de migraciones versionadas** para máxima seguridad y control.

### 📋 Flujo de Trabajo Recomendado

#### 1️⃣ **Desarrollo Normal** (día a día)

Cuando cambias el esquema (agregras tablas, columnas, etc.):

```bash
# 1. Genera archivos de migración basados en tus cambios
npm run db:generate

# 2. Aplica las migraciones a la base de datos
npm run db:migrate
```

**O usa el atajo:**

```bash
npm run db:refresh
```

Esto hace ambos pasos automáticamente. ✅ **Método recomendado**.

#### 2️⃣ **Inicialización** (primera vez o reset completo)

```bash
# Elimina TODO y recrea desde cero
npm run db:hard-reset

# Luego genera y aplica migraciones
npm run db:refresh
```

#### 3️⃣ **Resolver Conflictos** (cuando hay errores con llaves foráneas)

Si recibes error como "Cannot drop index 'PRIMARY': needed in a foreign key constraint":

```bash
# Opción A: Eliminar solo las tablas de relación
npm run db:drop-bridge
npm run db:refresh

# Opción B: Reset completo (más seguro pero borra datos)
npm run db:hard-reset
npm run db:refresh
```

### 📚 Comandos Disponibles

#### Gestión de Esquema

| Comando | Descripción | ¿Borra Datos? |
| :--- | :--- | :---: |
| `npm run db:generate` | Genera archivos de migración SQL | 🟢 NO |
| `npm run db:migrate` | Aplica migraciones pendientes | 🟢 NO* |
| `npm run db:refresh` | `generate` + `migrate` en un solo comando | 🟢 NO* |
| `npm run db:push` | Sincroniza esquema directamente (legacy) | ⚠️ POSIBLE |

\* *Depende del contenido de las migraciones*

#### Gestión de Datos

| Comando | Descripción | ¿Borra Datos? |
| :--- | :--- | :---: |
| `npm run db:seed` | Pobla con datos de prueba | 🟢 NO |
| `npm run db:hard-reset` | Elimina TODAS las tablas y datos | 🔴 SÍ |
| `npm run db:soft-refresh` | Verifica conflictos antes de actualizar | 🟢 NO |
| `npm run db:drop-bridge` | Elimina solo tablas de relación | 🟡 PARCIAL |

#### Herramientas

| Comando | Descripción |
| :--- | :--- |
| `npm run db:studio` | Abre Drizzle Studio (UI visual para la BD) |

## 🎯 Casos de Uso

### Caso 1: Agregar una nueva tabla

```bash
# 1. Edita src/db/schema/mi-tabla.ts y crea la tabla
# 2. Exporta en src/db/schema/index.ts
# 3. Ejecuta:
npm run db:refresh
```

### Caso 2: Agregar una columna a tabla existente

```bash
# 1. Edita el archivo de esquema correspondiente
# 2. Ejecuta:
npm run db:refresh
```

### Caso 3: Error con tablas de relación

```bash
# Si recibes error de "foreign key constraint":
npm run db:drop-bridge
npm run db:refresh
```

### Caso 4: Empezar desde cero

```bash
npm run db:hard-reset
npm run db:refresh
npm run db:seed  # Opcional: cargar datos de prueba
```

## ⚠️ Importante

### Migraciones vs Push

**🎯 Usa `db:refresh` (migraciones)** cuando:
- Estás en desarrollo con datos que quieres conservar
- Trabajas en equipo (migraciones se comparten vía Git)
- Necesitas control sobre cambios de esquema
- Vas a producción

**⚡ Usa `db:push` solo** cuando:
- Estás prototipando rápido
- No te importa perder datos
- Trabajas solo

### Backups

Antes de hacer cambios destructivos:

```bash
# Exportar base de datos
mysqldump -u root -p tejiendo_redes > backup.sql

# Restaurar si algo sale mal
mysql -u root -p tejiendo_redes < backup.sql
```

## 📂 Estructura de Migraciones

```
drizzle/
├── meta/              # Metadatos de migraciones
└── 0001_xxx.sql       # Archivos de migración (generados automáticamente)
└── 0002_xxx.sql
└── ...
```

**No edites estos archivos manualmente.** Se generan con `db:generate`.

## 🔗 Enlaces Útiles

- [Drizzle ORM - Migrations](https://orm.drizzle.team/docs/migrations)
- [Drizzle Kit - Push vs Generate](https://orm.drizzle.team/kit-docs/overview#prototyping-with-db-push)
