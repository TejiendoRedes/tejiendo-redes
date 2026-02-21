---
trigger: always_on
---

tengo un proyecto que voy pasar a otro grupo es de servicio comunitario y ya termine sin embargo quiero reestruccturar el codigo para que tenga una mejor arquitectura para los proximos grupos queiro que sea ia frendly tambien ya que se ha estarizadod mcuho el desarrolo con ia entoces  quiero un lavado de cara a la arquitetura es por eso te pido dos prompt importate .rules y la prompt que usara para re-estructura todo el proyecto {
  "name": "next-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx src/db/seed.ts",
    "db:seed:complex": "tsx src/db/seed-complex.ts",
    "db:reset": "tsx src/db/reset.ts",
    "db:hard-reset": "tsx src/db/hard-reset.ts",
    "db:refresh": "npm run db:generate && npm run db:migrate",
    "db:soft-refresh": "tsx src/db/soft-refresh.ts",
    "db:drop-bridge": "tsx src/db/drop-bridge-tables.ts",
    "db:studio": "drizzle-kit studio",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "bcryptjs": "^3.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "dotenv": "^17.2.4",
    "drizzle-orm": "^0.45.1",
    "jose": "^6.1.3",
    "jspdf": "^4.1.0",
    "jspdf-autotable": "^5.0.7",
    "lucide-react": "^0.563.0",
    "mysql2": "^3.16.3",
    "next": "^16.1.6",
    "next-themes": "^0.4.6",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-hook-form": "^7.71.1",
    "recharts": "^3.7.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "xlsx": "^0.18.5",
    "zod": "^3.24.1",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/coverage-v8": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "drizzle-kit": "^0.31.8",
    "eslint": "^9",
    "eslint-config-next": "15.1.6",
    "jsdom": "^23.2.0",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5",
    "vitest": "^1.2.0"
  }
}
hay esta las de algo de contexto ten encuenta que la idea principal sigue pero se agrgado mucho funcionalidad sin embargo necsito un lavado de cara mas o menos esete el proeycto "# Documentación del Proyecto: Tejiendo Redes

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
" impornte ya el codigo el funcional no quiero que rompa nada