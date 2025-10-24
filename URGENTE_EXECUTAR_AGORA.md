# 🚨 URGENTE - EXECUTAR AGORA NO SUPABASE

## ⚡ SOLUÇÃO RÁPIDA - 2 MINUTOS

### 1️⃣ Abra o Supabase:
```
https://supabase.com/dashboard
```

### 2️⃣ Vá em SQL Editor:
- Clique no ícone **</>** (SQL Editor) no menu lateral

### 3️⃣ Cole e Execute este SQL:

```sql
-- REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Usuários podem criar empresas" ON empresas;
DROP POLICY IF EXISTS "Usuários podem ver suas empresas" ON empresas;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON perfis;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON perfis;

-- CRIAR POLÍTICAS CORRETAS
CREATE POLICY "allow_authenticated_insert_empresas"
ON empresas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "allow_select_own_empresas"
ON empresas FOR SELECT TO authenticated
USING (id IN (SELECT empresa_id FROM perfis WHERE user_id = auth.uid()));

CREATE POLICY "allow_insert_own_perfil"
ON perfis FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_select_own_perfil"
ON perfis FOR SELECT TO authenticated USING (user_id = auth.uid());

-- GARANTIR RLS HABILITADO
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
```

### 4️⃣ Clique em **RUN** (botão verde)

### 5️⃣ Aguarde aparecer: **Success. No rows returned**

### 6️⃣ Teste o cadastro novamente!

---

## ✅ PRONTO!

Agora o cadastro deve funcionar perfeitamente! 🚀

---

## 🔍 Se ainda não funcionar:

Abra o Console do navegador (F12) e veja o erro detalhado.
O código agora mostra exatamente qual é o problema.

---

## 📞 Erro Comum:

Se aparecer: **"new row violates row-level security policy"**
- Significa que você precisa executar o SQL acima no Supabase

---

## ⏱️ Tempo total: 2 minutos

1. Abrir Supabase (30s)
2. Ir em SQL Editor (10s)
3. Colar SQL (10s)
4. Executar (10s)
5. Testar cadastro (1min)

**EXECUTE AGORA!** ⚡
