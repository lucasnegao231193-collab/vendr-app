# 🧪 TESTE - Gerenciar Usuários - GUIA COMPLETO

## ✅ Correções Aplicadas

### 1. API Reescrita
- **Problema**: API estava tentando usar `auth.admin.listUsers()` que não funciona
- **Solução**: Reescrita para buscar dados das tabelas `perfis` e `admins` diretamente
- **Logs**: Adicionados logs detalhados para diagnóstico

### 2. Funcionalidades Adicionadas
- ✅ **Editar Nome do Usuário**
- ✅ **Bloquear Conta**
- ✅ **Desbloquear Conta**
- ✅ **Resetar Senha** (envia email)
- ✅ **Exportar Relatório** (CSV)

### 3. Interface Melhorada
- ✅ Modal de ações para cada usuário
- ✅ Botão de exportar no topo
- ✅ Visual moderno e intuitivo

---

## 🧪 Como Testar

### 1️⃣ Acessar Gerenciar Usuários

```
http://localhost:3000/admin/usuarios
```

### 2️⃣ Verificar Logs no Console (F12)

Você deve ver:
```
🔍 Carregando usuários...
📡 Response status: 200
✅ Usuários carregados: X itens
📊 Dados: [...]
```

**No Terminal (onde roda `npm run dev`):**
```
🔍 API /admin/usuarios - Iniciando...
✅ Usuário autenticado: ...
✅ Admin verificado, buscando dados...
📋 Perfis encontrados: X
👑 Admins encontrados: X
✅ Total de usuários: X
```

### 3️⃣ Verificar Estatísticas no Topo

Deve mostrar:
- **Total**: Número total de usuários
- **Empresas**: Empresas com múltiplos vendedores
- **Autônomos**: Usuários Solo
- **Vendedores**: Total de vendedores

### 4️⃣ Testar Funcionalidades

#### A. Ver Detalhes do Usuário
- Clique em **"Ver Detalhes"** em qualquer usuário
- **Modal abre** com opções

#### B. Editar Nome
- No modal, altere o nome no campo
- Clique no ícone de editar (lápis)
- ✅ Nome deve ser atualizado

#### C. Resetar Senha
- No modal, clique em **"Resetar Senha"**
- ✅ Sistema envia email de redefinição

#### D. Bloquear/Desbloquear
- No modal, clique em **"Bloquear Conta"** ou **"Desbloquear Conta"**
- ✅ Status da conta muda

#### E. Exportar Relatório
- Clique no botão **"Exportar CSV"** no topo da página
- ✅ Arquivo CSV é baixado com dados dos usuários

---

## 🔧 Se Não Aparecer Usuários

### Causa 1: Não Há Usuários Cadastrados

**Solução**: Cadastre usuários pelo app primeiro:
1. Vá para `/login`
2. Clique em "Criar conta"
3. Complete o onboarding

### Causa 2: Erro na API

**Verifique os logs**:

**Console do Navegador:**
```javascript
❌ Erro na resposta: { error: "..." }
```

**Terminal do Servidor:**
```
❌ Erro ao buscar perfis: ...
```

**Me envie esses logs para diagnosticar!**

### Causa 3: Problema de Permissão

**Verifique**:
1. Você está logado como admin?
2. Execute no Supabase SQL Editor:

```sql
-- Verificar se você é admin
SELECT * FROM admins WHERE email = 'venloapp365@gmail.com';
```

Deve retornar uma linha.

---

## 📊 Estrutura de Dados Retornados

```typescript
{
  id: string;              // User ID
  email: string;           // Email do usuário
  created_at: string;      // Data de criação
  perfil: {
    id: string;
    nome: string;         // Nome do usuário
    role: string;         // 'owner' | 'seller' | 'admin'
    empresa: {
      nome: string;
      is_solo: boolean;   // true = autônomo
    } | null
  } | undefined;
  is_admin: boolean;      // Se é admin da plataforma
}
```

---

## 🛠️ APIs Criadas

### GET `/api/admin/usuarios`
- **Função**: Listar todos os usuários
- **Retorno**: Array de usuários com perfis e empresas

### PATCH `/api/admin/usuarios/[id]/edit`
- **Função**: Editar nome do usuário
- **Body**: `{ nome: string }`

### POST `/api/admin/usuarios/[id]/block`
- **Função**: Bloquear conta do usuário

### POST `/api/admin/usuarios/[id]/unblock`
- **Função**: Desbloquear conta do usuário

### POST `/api/admin/usuarios/[id]/reset-password`
- **Função**: Enviar email de redefinição de senha

---

## 📝 Próximos Passos (Se Necessário)

Se os usuários não aparecerem, execute:

```sql
-- Ver quantos perfis existem
SELECT COUNT(*) as total FROM perfis;

-- Ver últimos perfis criados
SELECT * FROM perfis ORDER BY criado_em DESC LIMIT 5;

-- Ver quantas empresas existem
SELECT COUNT(*) as total FROM empresas;

-- Ver empresas Solo vs Normal
SELECT is_solo, COUNT(*) as total FROM empresas GROUP BY is_solo;
```

Me envie os resultados!

---

## ✅ Checklist Final

- [ ] Abrir `/admin/usuarios`
- [ ] Verificar se aparecem usuários na lista
- [ ] Verificar estatísticas no topo (Total, Empresas, Autônomos, Vendedores)
- [ ] Clicar em "Ver Detalhes" de um usuário
- [ ] Testar editar nome
- [ ] Testar resetar senha
- [ ] Testar bloquear/desbloquear
- [ ] Testar exportar CSV
- [ ] Verificar logs no Console (F12)
- [ ] Verificar logs no Terminal

---

## 🎉 Tudo Funcionando?

Se sim: **Parabéns! O sistema de gerenciamento de usuários está completo!**

Se não: **Me envie os logs** do Console (F12) e do Terminal para eu corrigir! 🚀
