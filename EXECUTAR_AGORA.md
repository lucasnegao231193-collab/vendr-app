# 🚨 ERRO NA PÁGINA TRANSFERÊNCIAS - SOLUÇÃO

**Erro:** `500 Internal Server Error` em `/api/transferencias/empresa`

**Causa:** Tabelas `transferencias` e `transferencia_itens` não existem no banco

---

## ✅ **SOLUÇÃO RÁPIDA:**

### **1. Abra o Supabase SQL Editor**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Venlo**
3. Vá em: **SQL Editor** (menu lateral esquerdo)
4. Clique em: **New Query**

---

### **2. Copie e Execute o SQL Completo**

**Arquivo:** `supabase-transferencias-migration.sql`

**Ou copie direto daqui:**

```sql
-- ============================================================
-- VENLO - MÓDULO DE TRANSFERÊNCIAS DE ESTOQUE
-- Migração completa: transferencias, devolucoes, logs
-- ============================================================

-- 1) ESTOQUE DO VENDEDOR
CREATE TABLE IF NOT EXISTS public.vendedor_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade int NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendedor_id, produto_id)
);

CREATE INDEX IF NOT EXISTS idx_vendedor_estoque_vendedor ON public.vendedor_estoque(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_vendedor_estoque_produto ON public.vendedor_estoque(produto_id);

-- 2) TRANSFERÊNCIAS (Empresa → Vendedor)
CREATE TABLE IF NOT EXISTS public.transferencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id) ON DELETE CASCADE,
  criado_por uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL CHECK (status IN ('aguardando_aceite','aceito','recusado','cancelado')) DEFAULT 'aguardando_aceite',
  total_itens int NOT NULL DEFAULT 0,
  observacao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transferencia_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transferencia_id uuid NOT NULL REFERENCES public.transferencias(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade int NOT NULL CHECK (quantidade > 0),
  preco_unit numeric(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transferencias_empresa ON public.transferencias(empresa_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transferencias_vendedor ON public.transferencias(vendedor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transferencia_itens_transferencia ON public.transferencia_itens(transferencia_id);

-- 3) RLS POLICIES

-- Transferências
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem transferências da empresa ou vendedor" ON public.transferencias;
CREATE POLICY "Usuários veem transferências da empresa ou vendedor"
ON public.transferencias FOR SELECT
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

DROP POLICY IF EXISTS "Empresa pode criar transferências" ON public.transferencias;
CREATE POLICY "Empresa pode criar transferências"
ON public.transferencias FOR INSERT
TO authenticated
WITH CHECK (
  empresa_id = public.empresa_id_for_user(auth.uid())
  AND public.role_for_user(auth.uid()) IN ('owner', 'admin')
);

DROP POLICY IF EXISTS "Empresa pode atualizar transferências" ON public.transferencias;
CREATE POLICY "Empresa pode atualizar transferências"
ON public.transferencias FOR UPDATE
TO authenticated
USING (
  empresa_id = public.empresa_id_for_user(auth.uid())
  OR vendedor_id = public.vendedor_id_for_user(auth.uid())
);

-- Transferência Itens
ALTER TABLE public.transferencia_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem itens de transferências acessíveis" ON public.transferencia_itens;
CREATE POLICY "Usuários veem itens de transferências acessíveis"
ON public.transferencia_itens FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.transferencias t
    WHERE t.id = transferencia_itens.transferencia_id
      AND (
        t.empresa_id = public.empresa_id_for_user(auth.uid())
        OR t.vendedor_id = public.vendedor_id_for_user(auth.uid())
      )
  )
);

DROP POLICY IF EXISTS "Sistema pode gerenciar itens" ON public.transferencia_itens;
CREATE POLICY "Sistema pode gerenciar itens"
ON public.transferencia_itens FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4) TRIGGER UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transferencias_updated_at ON public.transferencias;
CREATE TRIGGER update_transferencias_updated_at
    BEFORE UPDATE ON public.transferencias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

---

### **3. Execute o SQL**

1. Cole o SQL no editor
2. Clique em **Run** (ou `Ctrl + Enter`)
3. Aguarde mensagem de sucesso ✅

---

### **4. Verifique se Funcionou**

Execute esta query para confirmar:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename LIKE '%transferencia%' OR tablename = 'vendedor_estoque');
```

**Resultado esperado:**
```
transferencias
transferencia_itens
vendedor_estoque
```

---

### **5. Teste a Aplicação**

1. **Recarregue a página:** https://vendr-app.vercel.app/empresa/transferencias
2. **Limpe o cache:** `Ctrl + Shift + R`
3. **Verifique:** Erro 500 deve ter sumido ✅

---

## 🆘 **SE DER ERRO NA EXECUÇÃO:**

### **Erro: "function empresa_id_for_user does not exist"**

Execute primeiro:

```sql
CREATE OR REPLACE FUNCTION public.empresa_id_for_user(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT empresa_id FROM public.perfis 
    WHERE user_id = empresa_id_for_user.user_id 
    LIMIT 1
  );
END;
$$;
```

### **Erro: "function role_for_user does not exist"**

Execute:

```sql
CREATE OR REPLACE FUNCTION public.role_for_user(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT role FROM public.perfis 
    WHERE user_id = role_for_user.user_id 
    LIMIT 1
  );
END;
$$;
```

### **Erro: "function vendedor_id_for_user does not exist"**

Execute:

```sql
CREATE OR REPLACE FUNCTION public.vendedor_id_for_user(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT id FROM public.vendedores 
    WHERE user_id = vendedor_id_for_user.user_id 
    LIMIT 1
  );
END;
$$;
```

---

## ✅ **CHECKLIST:**

- [ ] Abrir Supabase SQL Editor
- [ ] Copiar SQL de migração
- [ ] Executar SQL
- [ ] Ver mensagem de sucesso
- [ ] Verificar tabelas criadas
- [ ] Recarregar página `/empresa/transferencias`
- [ ] Confirmar que erro 500 sumiu

---

## 📝 **IMPORTANTE:**

Depois que executar o SQL, a página de transferências vai funcionar perfeitamente! 🚀

Se precisar de ajuda, me avise qual erro apareceu no Supabase.
