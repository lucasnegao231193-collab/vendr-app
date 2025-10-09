# 🚀 Guia Rápido - Vendr

## ⚡ Setup em 5 Minutos

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Configurar Supabase

**A) Criar Projeto:**
- Acesse https://supabase.com
- Clique em "New Project"
- Escolha nome, senha e região

**B) Executar SQL:**
- Vá em SQL Editor
- Cole todo o conteúdo de `supabase-schema.sql`
- Clique em "Run"

**C) Copiar Credenciais:**
- Vá em Settings → API
- Copie:
  - `Project URL`
  - `anon public` key

### 3️⃣ Configurar .env.local

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
NEXT_PUBLIC_VENDR_PIX_KEY=11999887766
NEXT_PUBLIC_TZ=America/Sao_Paulo
```

### 4️⃣ Executar

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🎯 Primeiro Uso

### Cadastrar Owner

1. Acesse http://localhost:3000
2. Clique em "Não tem conta? Cadastrar"
3. Email: `admin@vendr.com`
4. Senha: `123456` (mínimo 6 caracteres)
5. Clique em "Cadastrar"

### Configurar Empresa

1. Preencha nome da empresa
2. (Opcional) CNPJ e Chave PIX
3. Clique em "Criar Empresa"

### Cadastrar Produtos

1. Vá em `/produtos`
2. Clique "Novo Produto"
3. Exemplo:
   - Nome: Picolé
   - Preço: 6.00
   - Unidade: un
4. Repita para mais produtos

### Cadastrar Vendedores

1. Vá em `/vendedores`
2. Clique "Novo Vendedor"
3. Exemplo:
   - Nome: João Silva
   - Telefone: 11999887766
   - Comissão: 10 (%)
4. Clique em "Criar"

### Atribuir Kit Diário

1. Ainda em `/vendedores`
2. Clique na aba "Atribuir Kit"
3. Selecione:
   - Vendedor: João Silva
   - Data: hoje
   - Comissão: 10%
4. Adicione produtos:
   - Picolé: 50 unidades
   - Água: 30 unidades
5. Clique em "Criar Kit"

---

## 📱 Testar como Vendedor

### Opção 1: Mesmo Navegador (Aba Anônima)

1. Abra aba anônima
2. Acesse http://localhost:3000/vendedor
3. (MVP: usa mesmo login)

### Opção 2: Dispositivo Móvel

1. Descubra IP do seu PC:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. No celular, acesse:
   ```
   http://SEU-IP:3000/vendedor
   ```

3. Instale como PWA:
   - Android: Menu → Adicionar à tela inicial
   - iOS: Compartilhar → Adicionar à tela inicial

### Registrar Venda

1. Na home do vendedor, clique "Nova Venda"
2. Selecione produtos com +/-
3. Escolha meio de pagamento
4. Se PIX: gere QR Code
5. Se Dinheiro: informe valor recebido
6. Confirme venda

---

## 🧪 Testar Funcionalidades

### Realtime Dashboard

1. Abra `/dashboard` em uma aba
2. Em outra aba, registre venda em `/vendedor/venda`
3. Veja dashboard atualizar automaticamente

### Offline Mode

1. Abra `/vendedor/venda`
2. Abra DevTools (F12) → Network
3. Selecione "Offline"
4. Registre uma venda
5. Veja toast "Venda salva offline"
6. Volte "Online"
7. Veja toast "Venda sincronizada"

### Fechar Dia

1. Como owner, vá em `/operacoes`
2. Clique "Fechar Dia" de um vendedor
3. Veja totais e comissão
4. Confirme fechamento

### Exportar Relatórios

1. Vá em `/relatorios`
2. Selecione período
3. Clique "Filtrar"
4. Clique "Exportar CSV"

---

## 🐛 Troubleshooting

### "Cannot find module 'next'" (Erro de Lint)
✅ **Normal!** Execute `npm install` primeiro.

### "User not found" no login
✅ Cadastre-se primeiro em `/login`

### "Empresa não encontrada"
✅ Complete onboarding em `/onboarding`

### Realtime não funciona
1. Verifique Supabase → Database → Replication
2. Confirme que `vendas` está publicado
3. Execute no SQL Editor:
   ```sql
   alter publication supabase_realtime add table public.vendas;
   ```

### Offline não funciona no localhost HTTP
✅ Offline/PWA requer HTTPS ou localhost

### Service Worker não atualiza
```bash
# Limpar cache
DevTools → Application → Service Workers → Unregister
DevTools → Application → Storage → Clear site data
```

---

## 📊 Dados de Teste (Seeds)

Para popular com dados de exemplo:

1. Crie primeiro usuário normalmente
2. Copie o UUID do usuário:
   - Supabase → Authentication → Users
   - Clique no usuário → Copie UUID

3. No SQL Editor, execute o bloco comentado no final de `supabase-schema.sql`
4. Substitua `SEU-USER-UUID-AQUI` pelo UUID copiado

---

## 🚢 Deploy Produção

### Vercel (Mais Rápido)

```bash
# 1. Push para GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin sua-url-github
git push -u origin main

# 2. Importe no Vercel
# - Acesse vercel.com
# - New Project → Import Git Repository
# - Configure Environment Variables
# - Deploy!
```

### Configurar Variáveis:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VENDR_PIX_KEY`
- `NEXT_PUBLIC_TZ`

### Atualizar Supabase:
- Supabase → Authentication → URL Configuration
- Adicione URL do Vercel em "Site URL" e "Redirect URLs"

---

## 📚 Próximos Passos

1. ✅ Familiarize-se com o dashboard
2. ✅ Teste vendas offline
3. ✅ Configure chave PIX real
4. ✅ Personalize cores em `globals.css`
5. ✅ Adicione logo nos ícones PWA
6. 🚀 Deploy em produção
7. 📱 Distribua para vendedores

---

## 💡 Dicas

- **Comissão**: configure por vendedor ou sobrescreva no kit diário
- **Offline**: funciona apenas após primeira visita online
- **RLS**: garante isolamento total entre empresas
- **Backup**: exporte relatórios regularmente
- **Celular**: instale como PWA para melhor UX

---

Precisa de ajuda? Consulte o `README.md` completo!
