# 🔍 DIAGNÓSTICO: Problema ao Criar Vendedores

## ✅ **VERIFICAÇÕES:**

### **1. Variável de Ambiente - CRITICAL!**

A API precisa da **Service Role Key** do Supabase.

**Verifique se existe no arquivo `.env.local`:**

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Como obter:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings** → **API**
4. Copie: **service_role** (secret key)
5. Cole no `.env.local`

**Depois reinicie o servidor:**
```bash
# Parar servidor (Ctrl+C)
npm run dev
```

---

### **2. Testar a API Diretamente**

Abra o console do navegador (F12) e execute:

```javascript
// Teste de criação de vendedor
fetch('/api/admin/create-seller', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Vendedor Teste',
    email: 'vendedor.teste@example.com',
    senha: 'senha12345678',
    telefone: '11999999999',
    comissao_padrao: 10
  })
})
.then(res => res.json())
.then(data => console.log('Resultado:', data))
.catch(err => console.error('Erro:', err));
```

**Resultado esperado:**
```json
{
  "success": true,
  "vendedor": {
    "id": "uuid...",
    "nome": "Vendedor Teste",
    "email": "vendedor.teste@example.com"
  },
  "message": "Vendedor criado com sucesso!"
}
```

**Erros possíveis:**

#### **Erro: "Não autenticado" (401)**
- Você não está logado
- Faça login primeiro

#### **Erro: "Apenas owners podem criar vendedores" (403)**
- Seu usuário não tem role='owner'
- Verifique a tabela `perfis` no Supabase

#### **Erro: "Erro ao criar usuário" (500)**
- **SUPABASE_SERVICE_ROLE_KEY não configurada**
- Adicione no `.env.local`

#### **Erro: "Limite de vendedores atingido" (422)**
- Você atingiu o limite do seu plano
- Plano 1: 3 vendedores
- Plano 2: 5 vendedores
- Plano 3: 10 vendedores

#### **Erro: "Email já existe"**
- Email já cadastrado no Supabase Auth
- Use outro email

---

### **3. Verificar RLS Policies no Supabase**

Execute no **Supabase SQL Editor**:

```sql
-- Ver policies da tabela vendedores
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'vendedores';
```

**Policies necessárias:**
- Owner pode inserir vendedores ✅
- Owner pode ver vendedores ✅
- Owner pode atualizar vendedores ✅

Se não existirem, execute:

```sql
-- Permitir owner criar vendedores
CREATE POLICY "Owner cria vendedores" 
ON public.vendedores 
FOR INSERT 
TO authenticated 
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) = 'owner'
);

-- Permitir owner ver vendedores
CREATE POLICY "Owner vê vendedores" 
ON public.vendedores 
FOR SELECT 
TO authenticated 
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
);
```

---

### **4. Verificar Perfil do Usuário**

Execute no **Supabase SQL Editor**:

```sql
-- Ver seu perfil
SELECT p.role, p.empresa_id, e.plano, e.nome_fantasia
FROM public.perfis p
LEFT JOIN public.empresas e ON e.id = p.empresa_id
WHERE p.user_id = auth.uid();
```

**Resultado esperado:**
```
role: owner
empresa_id: uuid...
plano: plano1, plano2 ou plano3
```

---

### **5. Verificar Console do Navegador**

1. Abra a página `/vendedores`
2. Pressione **F12**
3. Vá na aba **Console**
4. Tente criar um vendedor
5. **Copie todas as mensagens de erro**
6. Me envie

---

### **6. Verificar Logs do Servidor**

No terminal onde o `npm run dev` está rodando:
- Procure por erros em vermelho
- Mensagens como:
  - `SUPABASE_SERVICE_ROLE_KEY is not defined`
  - `Erro ao criar usuário`
  - `Erro ao criar vendedor`

---

## 🔧 **SOLUÇÃO RÁPIDA:**

### **Passo 1: Adicionar Service Role Key**

1. Abra: `.env.local`
2. Adicione:
```env
SUPABASE_SERVICE_ROLE_KEY=SUA_KEY_AQUI
```
3. Salve o arquivo

### **Passo 2: Reiniciar Servidor**
```bash
# Parar (Ctrl+C)
npm run dev
```

### **Passo 3: Testar**
1. Vá em: `/vendedores`
2. Clique em: **Criar Vendedor**
3. Preencha:
   - Nome: Teste
   - Email: teste@example.com
   - Senha: senha12345678
   - Comissão: 10%
4. Clique em: **Salvar**

---

## 📝 **CHECKLIST:**

- [ ] Service Role Key configurada no `.env.local`
- [ ] Servidor reiniciado
- [ ] Usuário logado como owner
- [ ] RLS policies configuradas
- [ ] Limite de vendedores não atingido
- [ ] Email único (não usado antes)
- [ ] Senha com 8+ caracteres

---

## 🆘 **AINDA NÃO FUNCIONA?**

**Me envie:**
1. Print da tela de criação (com o erro)
2. Console do navegador (F12 → Console)
3. Logs do terminal (npm run dev)
4. Resultado do SQL de verificação de perfil

---

**Arquivo criado para te ajudar a diagnosticar!** 🚀
