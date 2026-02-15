# Testing Guide - Tejiendo Redes

Esta guía documenta la infraestructura de testing para desarrolladores e IA.

## 🚀 Quick Start

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests en modo watch
npm run test -- --watch

# Ejecutar tests con interfaz UI
npm run test:ui

# Ejecutar tests con coverage
npm run test:coverage
```

## 📁 Estructura de Testing

```
src/__tests__/
├── setup.ts                    # Setup global para tests
├── actions/                    # Tests de server actions
│   └── enfermedades-actions.test.ts
├── components/                 # Tests de componentes React
│   └── EnfermedadForm.test.tsx
└── README.md                   # Esta guía
```

## 🧪 Tipos de Tests

### 1. Tests de Server Actions

Tests para funciones del servidor que interactúan con la base de datos.

**Ejemplo**: `src/__tests__/actions/enfermedades-actions.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getEnfermedades, createEnfermedad } from '@/actions/enfermedades-actions';

describe('Enfermedades Actions', () => {
  it('should fetch all diseases', async () => {
    const result = await getEnfermedades();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should create a new disease', async () => {
    const newDisease = {
      nombreEnfermedad: 'Test Disease',
      tipoPatologia: 'Respiratorias',
      descripcion: 'Test description'
    };
    const result = await createEnfermedad(newDisease);
    expect(result.success).toBe(true);
  });
});
```

### 2. Tests de Componentes

Tests para componentes React usando Testing Library.

**Ejemplo**: `src/__tests__/components/EnfermedadForm.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnfermedadForm } from '@/components/forms/EnfermedadForm';

describe('EnfermedadForm', () => {
  it('renders with initial data', () => {
    const mockData = {
      codigoEnfermedad: 'ENF-001',
      nombreEnfermedad: 'Test Disease',
      tipoPatologia: 'Respiratorias',
      descripcion: 'Test'
    };

    render(
      <EnfermedadForm
        initialData={mockData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Test Disease')).toBeInTheDocument();
  });
});
```

### 3. Tests de Integración

Tests que verifican la interacción entre múltiples componentes/funciones.

```typescript
describe('Disease Management Flow', () => {
  it('should create, update, and delete a disease', async () => {
    // Create
    const created = await createEnfermedad({ ... });
    expect(created.success).toBe(true);

    // Update
    const updated = await updateEnfermedad(code, { ... });
    expect(updated.success).toBe(true);

    // Delete
    const deleted = await deleteEnfermedad(code);
    expect(deleted.success).toBe(true);
  });
});
```

## 📋 Convenciones

### Naming

- **Archivos de test**: `*.test.ts` o `*.test.tsx`
- **Describe blocks**: Nombre del módulo/componente
- **Test cases**: Descripción clara de lo que se prueba

### Estructura

```typescript
describe('ComponentName or ModuleName', () => {
  // Setup común
  beforeEach(() => {
    // Reset state, mocks, etc.
  });

  describe('Specific Feature', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## 🎯 Best Practices

### Para Desarrolladores

1. **AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Descriptive test names**: "should do X when Y"
4. **Test edge cases**: empty data, errors, etc.
5. **Mock external dependencies**: database, APIs, etc.

### Para IA

1. **Read existing tests first** antes de crear nuevos
2. **Follow project conventions** para consistency
3. **Test critical paths** primero (happy path + error cases)
4. **Keep tests simple** y focalizados
5. **Document complex setups** con comentarios

## 🔧 Mocking

### Database Queries

```typescript
import { vi } from 'vitest';
import { db } from '@/db';

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));
```

### Server Actions

```typescript
vi.mock('@/actions/enfermedades-actions', () => ({
  getEnfermedades: vi.fn().mockResolvedValue({
    success: true,
    data: []
  }),
}));
```

### Components

```typescript
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));
```

## 📊 Coverage

### Ver Coverage

```bash
npm run test:coverage
```

Reporte HTML disponible en: `coverage/index.html`

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## 🐛 Debugging Tests

### Con VSCode

1. Instalar extensión "Vitest"
2. Usar breakpoints en tests
3. Run/Debug test directamente

### Con Console

```typescript
it('should debug this test', () => {
  console.log('Debug info:', someVariable);
  // ... test logic
});
```

### Con UI

```bash
npm run test:ui
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## ⚠️ Common Issues

### "Cannot find module '@/...'"

Verificar que `vitest.config.ts` tiene los alias correctos.

### "ReferenceError: window is not defined"

Verificar que `environment: 'jsdom'` está en `vitest.config.ts`.

### Tests lentos

- Usar `vi.mock()` para dependencias externas
- Evitar operaciones de I/O reales
- Usar datos mock en lugar de datos reales

## 🎓 Ejemplos Completos

Consultar:
- `src/__tests__/actions/enfermedades-actions.test.ts`
- `src/__tests__/components/EnfermedadForm.test.tsx`

Para patrones y ejemplos específicos del proyecto.
