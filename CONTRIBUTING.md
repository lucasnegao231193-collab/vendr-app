# 🤝 Contribuindo para o Vendr

Obrigado por considerar contribuir com o Vendr!

## 🚀 Como Contribuir

### 1. Fork & Clone

```bash
# Fork no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/vendr.git
cd vendr
```

### 2. Criar Branch

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

### 3. Desenvolver

```bash
npm install
npm run dev
```

### 4. Testar

- Teste todas as funcionalidades afetadas
- Teste em desktop e mobile
- Teste offline (se aplicável)
- Verifique RLS no Supabase

### 5. Commit

Use commits semânticos:

```bash
git commit -m "feat: adicionar filtro por vendedor nos relatórios"
git commit -m "fix: corrigir cálculo de troco com centavos"
git commit -m "docs: atualizar README com nova feature"
```

Tipos:
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação
- `refactor`: refatoração
- `test`: testes
- `chore`: manutenção

### 6. Push & PR

```bash
git push origin feature/minha-feature
```

Abra Pull Request no GitHub.

## 📋 Checklist

Antes de abrir PR, verifique:

- [ ] Código segue o estilo do projeto (Prettier)
- [ ] Sem erros de lint (ESLint)
- [ ] Funciona em Chrome e Safari
- [ ] Funciona em mobile
- [ ] RLS testado (se aplicável)
- [ ] README atualizado (se necessário)
- [ ] Comentários em pontos complexos

## 🎨 Padrões de Código

### TypeScript
- Use tipagem forte
- Evite `any`
- Use interfaces para objetos complexos

### React
- Componentes funcionais
- Hooks para estado
- Evite prop drilling (use Context se necessário)

### Estilo
```bash
npm run format  # Prettier
npm run lint    # ESLint
```

## 🐛 Reportar Bugs

Abra uma Issue com:

1. **Título**: resumo claro
2. **Descrição**: o que esperava vs o que aconteceu
3. **Passos**: como reproduzir
4. **Ambiente**: navegador, OS, mobile/desktop
5. **Screenshots**: se aplicável

## 💡 Sugerir Features

Abra uma Issue com:

1. **Problema**: qual dor a feature resolve
2. **Solução**: como você imagina funcionando
3. **Alternativas**: outras formas de resolver
4. **Contexto**: quem se beneficiaria

## ⚠️ Segurança

**Nunca** inclua no código:
- Chaves de API
- Senhas
- Tokens
- Dados sensíveis

Use variáveis de ambiente!

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a MIT License.

---

Obrigado por ajudar a melhorar o Vendr! 🙏
