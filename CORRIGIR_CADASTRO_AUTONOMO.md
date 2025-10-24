# 🔧 CORRIGIR CADASTRO DE AUTÔNOMO

## 🐛 Problema:
Erro 500 ao criar conta autônoma - RLS (Row Level Security) do Supabase está bloqueando a criação de empresa e perfil.

---

## ✅ SOLUÇÃO RÁPIDA - Execute no Supabase:

### 1. Acesse o Supabase SQL Editor
```
https://supabase.com/dashboard → Seu Projeto → SQL Editor
```

### 2. Execute este SQL:

```sql
-- Permitir usuários criarem empresas durante cadastro
CREATE POLICY "Usuários podem criar empresas"
ON empresas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir usuários criarem seus perfis durante cadastro
CREATE POLICY "Usuários podem criar seu próprio perfil"
ON perfis
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Permitir usuários verem suas empresas
CREATE POLICY "Usuários podem ver suas empresas"
ON empresas
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT empresa_id 
    FROM perfis 
    WHERE user_id = auth.uid()
  )
);

-- Permitir usuários verem seus perfis
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON perfis
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### 3. Clique em "RUN" ou "Executar"

---

## ✅ Após executar o SQL:

1. **Recarregue a página** de cadastro
2. **Tente criar conta** novamente
3. ✅ **Deve funcionar!**

---

## 📊 O que essas políticas fazem:

| Política | Tabela | Ação | Permite |
|----------|--------|------|---------|
| **Criar empresas** | empresas | INSERT | Usuário autenticado criar empresa |
| **Ver empresas** | empresas | SELECT | Usuário ver suas próprias empresas |
| **Criar perfil** | perfis | INSERT | Usuário criar seu próprio perfil |
| **Ver perfil** | perfis | SELECT | Usuário ver seu próprio perfil |

---

## 🔐 Segurança:

- ✅ **Cada usuário só cria suas próprias empresas**
- ✅ **Cada usuário só vê suas próprias empresas**
- ✅ **Cada usuário só cria seu próprio perfil**
- ✅ **Dados isolados entre usuários**

---

## 🎯 Teste Completo:

### Após executar o SQL:

1. Acesse: `http://localhost:3000/cadastro`
2. Clique em **"Modo Pessoal"**
3. Preencha:
   - Email: `teste@exemplo.com`
   - Senha: `123456`
   - Nome: `Meu Negócio`
4. Clique em **"Criar Conta Solo (Grátis)"**
5. ✅ **Deve criar conta com sucesso!**
6. ✅ **Deve fazer login automático**
7. ✅ **Deve redirecionar para /solo**

---

## 🔍 Verificar se funcionou:

### No Supabase:

1. **Table Editor** → **empresas**
   - Deve aparecer nova empresa com `is_solo: true`

2. **Table Editor** → **perfis**
   - Deve aparecer novo perfil com `role: owner`

3. **Authentication** → **Users**
   - Deve aparecer novo usuário

---

## ⚠️ Se ainda não funcionar:

### Verifique se RLS está habilitado:

1. **Table Editor** → **empresas** → **⚙️ Settings**
2. Verifique: **Enable Row Level Security (RLS)** = ✅ ON

3. **Table Editor** → **perfis** → **⚙️ Settings**
4. Verifique: **Enable Row Level Security (RLS)** = ✅ ON

---

## 📝 Políticas Alternativas (se necessário):

### Se quiser ser mais restritivo:

```sql
-- Permitir criar empresa APENAS durante cadastro (sem perfil ainda)
CREATE POLICY "Usuários podem criar empresas no cadastro"
ON empresas
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM perfis WHERE user_id = auth.uid()
  )
);
```

---

## 🎉 Resultado Esperado:

Após executar o SQL:
- ✅ Cadastro de autônomo funciona
- ✅ Empresa Solo criada
- ✅ Perfil criado
- ✅ Login automático
- ✅ Acesso ao /solo

**Execute o SQL no Supabase e teste!** 🚀
