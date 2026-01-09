# Testing Setup

Este proyecto incluye configuración para testing con Vitest y React Testing Library.

## Instalación de Dependencias de Testing

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui vitest jsdom
```

## Ejecutar Tests

```bash
# Ejecutar tests
npm test

# Ejecutar tests con UI
npm run test:ui

# Ejecutar tests con cobertura
npm run test:coverage
```

## Estructura de Tests

```
src/
  test/
    setup.js          # Configuración global de tests
    App.test.jsx      # Ejemplo de test
```

## Escribir Tests

Ejemplo de test para un componente:

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText(/some text/i)).toBeInTheDocument();
  });
});
```

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
