# 🎯 Guía Rápida - Sistema de Migraciones

## ⚡ Uso Diario

### Cuando modificas el esquema (agregar/modificar tablas):

```bash
npm run db:refresh
```

**Eso es todo.** Este comando:
- ✅ Genera los archivos de migración
- ✅ Los aplica a la base de datos
- ✅ Preserva tus datos

---

## 🆘 Solución de Problemas

### Error: "Cannot drop index PRIMARY"

```bash
npm run db:drop-bridge
npm run db:refresh
```

### Empezar desde cero (borra todo)

```bash
npm run db:hard-reset
npm run db:refresh
```

---

## 📋 Todos los Comandos

| Comando | ¿Qué hace? | ¿Borra datos? |
|---------|------------|---------------|
| `npm run db:refresh` | Actualiza el esquema | 🟢 NO |
| `npm run db:generate` | Solo genera migraciones | 🟢 NO |
| `npm run db:migrate` | Solo aplica migraciones | 🟢 NO |
| `npm run db:drop-bridge` | Elimina tablas de relación | 🟡 PARCIAL |
| `npm run db:hard-reset` | Borra TODO | 🔴 SÍ |
| `npm run db:studio` | Abre UI visual de BD | 🟢 NO |

---

## 💡 Ejemplos

### Ejemplo 1: Agregaste una nueva tabla

```bash
# 1. Creaste src/db/schema/mi-tabla.ts
# 2. La exportaste en src/db/schema/index.ts
# 3. Ejecuta:
npm run db:refresh
```

### Ejemplo 2: Agregaste una columna

```bash
# 1. Editaste el schema correspondiente
# 2. Ejecuta:
npm run db:refresh
```

### Ejemplo 3: Trabajando en equipo

```bash
# Después de hacer git pull:
npm run db:migrate

# Esto aplica las migraciones de tus compañeros
```

---

## ⚠️ Importante

- **Antes era:** `npm run db:push` (arriesgado, sin control)
- **Ahora es:** `npm run db:refresh` (seguro, profesional)

### Beneficios del nuevo sistema:
- ✅ Control total sobre cambios
- ✅ Historial en Git
- ✅ Rollback posible
- ✅ Listo para producción

---

## 📚 Más Información

- Ver `COMMANDS.md` - Documentación completa
- Ver `MIGRATION_SYSTEM.md` - Explicación detallada del nuevo sistema
