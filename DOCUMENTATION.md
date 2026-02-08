# Documentación del Proyecto: Tejiendo Redes

## Descripción General
Este proyecto es una aplicación web construida con **Next.js** para la gestión de "Tejiendo Redes". Utiliza una arquitectura moderna basada en React Component Server (RSC) y Drizzle ORM para la interacción con la base de datos.

## Arquitectura

### Stack Tecnológico
- **Frontend/Framework**: [Next.js 15](https://nextjs.org/) (App Router).
- **Base de Datos**: MySQL (usando driver `mysql2`).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) para definición de esquemas y consultas tipadas.
- **Estilos**: Tailwind CSS + ShadcnUI (componentes en `src/components/ui`).

### Estructura de Carpetas

```
/
├── src/
│   ├── app/                 # Páginas y rutas de Next.js (App Router)
│   │   ├── api/             # Endpoints de API (si existen)
│   │   ├── abordajes/       # Página de gestión de Abordajes
│   │   ├── consultas/       # Página de gestión de Consultas
│   │   └── ...
│   ├── components/          # Componentes de React reutilizables
│   │   ├── ui/              # Componentes base (botones, inputs, etc.)
│   │   └── ...
│   ├── db/                  # Configuración de Base de Datos
│   │   ├── schema/          # Definición de tablas (esquemas)
│   │   ├── client.ts        # Conexión a la BD
│   │   ├── index.ts         # Exportaciones de DB
│   │   └── hard-reset.ts    # Script de mantenimiento
│   └── lib/                 # Utilidades y funciones auxiliares
├── drizzle.config.ts        # Configuración de Drizzle Kit
├── COMMANDS.md              # Guía de comandos del proyecto
└── package.json             # Dependencias y scripts
```

## Flujo de Trabajo Recomendado

1.  **Modificar Base de Datos**:
    - Editar archivos en `src/db/schema/`.
    - Ejecutar `npm run db:soft-refresh` para aplicar cambios sin perder datos.
2.  **Desarrollo**:
    - Ejecutar `npm run dev:turbo`.
3.  **Reiniciar Entorno** (Si es necesario limpiar todo):
    - `npm run db:refresh` (Borra datos y recrea tablas).
    - `npm run db:seed` (Opcional, si tienes script de seed para datos iniciales).

## Mantenimiento

### Base de Datos
La lógica de base de datos está centralizada en `src/db`.
- **`schema/`**: Cada archivo aquí representa una entidad (ej. `aspirantes.ts`, `users.ts`).
- **`hard-reset.ts`**: Script crítico que limpia la base de datos desactivando FK checks temporalmente.

### Buenas Prácticas
- Mantener los componentes de UI pequeños y reutilizables.
- Usar Server Actions para mutaciones de datos (POST, PUT, DELETE).
- Usar Componentes de Servidor (RSC) para hacer fetch de datos (GET).
