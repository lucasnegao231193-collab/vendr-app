# 🧪 GUIA DE TESTES PRÁTICOS - Vendr UI/UX Update

## ✅ Servidor Status
**Servidor rodando:** http://localhost:3000  
**Status:** ✅ Ativo (porta 3000)

---

## 📋 TESTES RÁPIDOS (5 minutos)

### Teste 1: TopBar Azul Global ⭐
**O que testar:** TopBar azul #0057FF em todas as páginas

**Passos:**
1. Abrir no navegador: http://localhost:3000/dashboard
2. Verificar: TopBar azul no topo ✅
3. Verificar: Logo branca visível ✅
4. Verificar: Botão laranja "Suporte" **NÃO aparece** ✅
5. Verificar: Botão "Configurações" presente ✅

**Testar em outras rotas:**
- http://localhost:3000/solo
- http://localhost:3000/vendedores
- http://localhost:3000/estoque
- http://localhost:3000/relatorios

**Resultado esperado:** TopBar azul consistente em TODAS

---

### Teste 2: Página de Configurações ⭐⭐
**O que testar:** Nova página /configuracoes com 7 tabs

**Passos:**
1. Abrir: http://localhost:3000/configuracoes
2. Verificar: 7 tabs visíveis no topo
3. Clicar em cada tab e verificar conteúdo:

**✅ Tab 1: Perfil da Empresa**
- [ ] Avatar circular aparece
- [ ] Botão "Escolher Foto" funciona
- [ ] Formulário: Nome, CNPJ, Endereço, Telefone
- [ ] Horário de funcionamento (3 campos)
- [ ] Botão "Salvar Alterações"

**✅ Tab 2: Equipe**
- [ ] Título "Equipe" aparece
- [ ] Botão "Convidar Membro"
- [ ] Lista de vendedores (se houver)

**✅ Tab 3: Billing**
- [ ] Mostra "Plano Atual"
- [ ] Badge do plano (Solo Free/Pro)
- [ ] Botão "Fazer Upgrade"

**✅ Tab 4: Integrações**
- [ ] Stripe, WhatsApp, Export CSV
- [ ] Botões "Conectar"
- [ ] Toggle switches

**✅ Tab 5: Aparência**
- [ ] Seletor de cor primária
- [ ] Preview da cor
- [ ] Botão "Salvar"

**✅ Tab 6: Segurança**
- [ ] Toggle 2FA
- [ ] Botão "Alterar Senha"
- [ ] Lista de sessões ativas

**✅ Tab 7: Suporte**
- [ ] Formulário de contato (Assunto + Mensagem)
- [ ] Botão "Enviar Mensagem"
- [ ] Botão WhatsApp
- [ ] Informações de contato

---

### Teste 3: Upload de Avatar ⭐⭐⭐ (PRINCIPAL)
**O que testar:** Sistema de upload funcionando

**IMPORTANTE:** Requer que as migrações SQL tenham sido executadas no Supabase!

**Passos:**
1. Ir para: http://localhost:3000/configuracoes
2. Tab "Perfil da Empresa"
3. Clicar no avatar circular ou botão "Escolher Foto"
4. Selecionar uma imagem (< 2MB, JPG/PNG/WebP)

**Resultado esperado:**
- ✅ Preview aparece imediatamente
- ✅ Mensagem de sucesso (toast)
- ✅ Avatar atualizado no TopBar

**Se der erro:**
```
⚠️ Erro comum: "Não autenticado" ou "Bucket não encontrado"
Causa: Migrações SQL não foram executadas no Supabase
Solução: Executar supabase-storage-setup.sql no Supabase SQL Editor
```

---

### Teste 4: Navegação ⭐
**O que testar:** Navegação global funcionando

**Passos:**
1. Clicar no avatar no TopBar → Menu dropdown abre
2. Verificar opções:
   - [ ] Nome do usuário
   - [ ] Role (Empresa/Autônomo/Vendedor)
   - [ ] "Configurações"
   - [ ] "Suporte"
   - [ ] "Sair" (vermelho)

3. Clicar em "Configurações" → Redireciona para /configuracoes
4. Clicar botão "Voltar" → Volta para página anterior
5. Clicar botão "Dashboard" → Vai para dashboard

---

### Teste 5: Responsividade (Mobile) ⭐
**O que testar:** Layout em telas pequenas

**Passos:**
1. Abrir DevTools (F12)
2. Clicar no ícone de dispositivo móvel
3. Selecionar "iPhone 12 Pro" ou similar
4. Acessar /configuracoes

**Resultado esperado:**
- ✅ Tabs em grid 2 colunas (mobile)
- ✅ Botões mostram apenas ícones
- ✅ TopBar responsivo
- ✅ Avatar uploader funciona em touch

---

## 🔍 VALIDAÇÃO VISUAL

### Checklist Visual Rápido

Abrir cada rota e verificar:

**Dashboard (/dashboard)**
- [ ] TopBar azul #0057FF
- [ ] Logo branca
- [ ] Sem botão laranja "Suporte"
- [ ] Avatar do usuário no canto direito

**Solo (/solo)**
- [ ] TopBar azul consistente
- [ ] Badge "Solo Free" ou "Solo Pro"
- [ ] Navegação funciona

**Configurações (/configuracoes)**
- [ ] 7 tabs carregam
- [ ] Conteúdo renderiza sem erros
- [ ] Forms funcionais

---

## 🐛 POSSÍVEIS ERROS E SOLUÇÕES

### Erro 1: "Bucket 'avatars' não encontrado"
**Causa:** Storage não configurado  
**Solução:**
```sql
-- No Supabase SQL Editor:
-- Executar: supabase-storage-setup.sql
```

### Erro 2: "Não autenticado" ao fazer upload
**Causa:** Sessão expirada  
**Solução:**
```
1. Fazer logout
2. Login novamente
3. Tentar upload novamente
```

### Erro 3: TopBar não aparece azul
**Causa:** Cache do navegador  
**Solução:**
```
1. Ctrl + Shift + R (hard reload)
2. Ou limpar cache do navegador
```

### Erro 4: Erro 500 na página /configuracoes
**Causa:** Componentes não compilados  
**Solução:**
```bash
# Parar servidor (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run dev
```

---

## ✅ CHECKLIST FINAL

Após todos os testes, verificar:

**UI/UX:**
- [ ] TopBar azul em TODAS as páginas
- [ ] Logo branca visível
- [ ] Botão Suporte removido
- [ ] Navegação funciona

**Configurações:**
- [ ] Página /configuracoes acessível
- [ ] 7 tabs carregam sem erro
- [ ] Forms aparecem corretamente

**Upload:**
- [ ] Botão "Escolher Foto" funciona
- [ ] Preview aparece
- [ ] Upload completa (SE migrações executadas)

**Navegação:**
- [ ] Dropdown de usuário funciona
- [ ] Botões Voltar/Dashboard funcionam
- [ ] Links redirecionam corretamente

---

## 🎯 PRÓXIMO PASSO

Se todos os testes acima passarem:
✅ **Implementação validada!**
✅ **Pronto para deploy em staging**

Se houver erros:
1. Anotar qual teste falhou
2. Verificar console do navegador (F12)
3. Reportar o erro específico

---

## 📊 STATUS DOS TESTES

Marque conforme for testando:

- [ ] Teste 1: TopBar Azul
- [ ] Teste 2: Página Configurações
- [ ] Teste 3: Upload de Avatar (requer SQL)
- [ ] Teste 4: Navegação
- [ ] Teste 5: Responsividade

**Todos passaram?** ✅ Implementação 100% funcional!

---

**⚡ Comece pelo Teste 1 (mais rápido) para validação inicial!**
