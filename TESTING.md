# 🧪 Guia de Testes - Venlo

## Visão Geral

Este projeto utiliza **Jest** e **React Testing Library** para testes automatizados.

## 📋 Comandos Disponíveis

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch (desenvolvimento)
npm run test:watch

# Rodar testes com cobertura
npm run test:coverage

# Rodar testes no CI
npm run test:ci
```

## 🏗️ Estrutura de Testes

```
__tests__/
├── components/          # Testes de componentes React
│   ├── Logo.test.tsx
│   └── ShareChatLink.test.tsx
├── lib/                 # Testes de funções utilitárias
│   └── auth-helpers.test.ts
└── pages/              # Testes de páginas (futuro)
```

## ✅ Testes Implementados

### 1. Componentes
- **Logo**: Testa renderização e tamanhos
- **ShareChatLink**: Testa funcionalidade de compartilhamento

### 2. Helpers
- **auth-helpers**: Testa funções de autenticação e URLs

## 📊 Cobertura de Código

Execute `npm run test:coverage` para ver o relatório completo.

Meta: **>80% de cobertura**

## 🔄 CI/CD

Os testes rodam automaticamente no GitHub Actions:
- ✅ Em cada push para `main` ou `develop`
- ✅ Em cada Pull Request
- ✅ Testa em Node.js 18.x e 20.x
- ✅ Verifica linting
- ✅ Gera relatório de cobertura

## 📝 Como Escrever Testes

### Teste de Componente

```tsx
import { render, screen } from '@testing-library/react'
import { MeuComponente } from '@/components/MeuComponente'

describe('MeuComponente', () => {
  it('renderiza corretamente', () => {
    render(<MeuComponente />)
    expect(screen.getByText('Texto')).toBeInTheDocument()
  })
})
```

### Teste de Função

```ts
import { minhaFuncao } from '@/lib/helpers'

describe('minhaFuncao', () => {
  it('retorna o valor esperado', () => {
    expect(minhaFuncao('input')).toBe('output')
  })
})
```

## 🐛 Debugging

Para debugar testes:

```bash
# Rodar um teste específico
npm test -- Logo.test.tsx

# Rodar com mais detalhes
npm test -- --verbose
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
