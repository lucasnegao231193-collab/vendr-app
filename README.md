# 🛒 Venlo - Sistema de Gestão de Vendas Externas

Sistema completo para gestão de vendas ambulantes e externas. Funciona 100% offline com sincronização automática.

**🌐 Site:** https://venlo.com.br  
**📚 Documentação Completa:** [DOCS.md](./DOCS.md)

## 🚀 Tecnologias

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Supabase** (Auth, Postgres, Realtime, RLS)
- **Zod** (validação)
- **Zustand** + IndexedDB (fila offline)
- **Recharts** (gráficos)
- **PWA** (manifest + service worker)
- **QRCode** (PIX)

## 📋 Funcionalidades

### 👔 Owner (Administrador)
- ✅ Dashboard em tempo real com KPIs
- ✅ CRUD de produtos e vendedores
- ✅ Atribuir kit diário aos vendedores
- ✅ Acompanhar vendas por vendedor
- ✅ Fechar dia e calcular comissões
- ✅ Relatórios com exportação CSV
- ✅ Gráficos de vendas por produto

### 📱 Vendedor
- ✅ Ver kit do dia
- ✅ Registrar vendas (pix/cartão/dinheiro)
- ✅ Calculadora de troco
- ✅ PIX com QR Code + Copia e Cola
- ✅ Histórico de vendas
- ✅ Fechamento do dia
- ✅ **Funciona offline** (fila local + sync automática)

### 🔒 Segurança
- ✅ Row Level Security (RLS) no Supabase
- ✅ Autenticação via Supabase Auth
- ✅ Isolamento por empresa

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repo>
cd windsurf-project
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `supabase-schema.sql` no SQL Editor
3. Copie as credenciais do projeto

### 4. Configure as variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
NEXT_PUBLIC_VENDR_PIX_KEY=sua-chave-pix@email.com
NEXT_PUBLIC_TZ=America/Sao_Paulo
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📊 Estrutura do Banco de Dados

```
empresas
├── perfis (vincula user → empresa + role)
├── vendedores
├── produtos
├── kits (atribuição diária)
│   └── kit_itens
├── vendas
└── fechamentos
```

## 🔄 Fluxo de Uso

### Setup Inicial (Owner)

1. Cadastre-se em `/login`
2. Configure sua empresa em `/onboarding`
3. Cadastre produtos em `/produtos`
4. Cadastre vendedores em `/vendedores`
5. Atribua kit diário em `/vendedores` (aba "Atribuir Kit")

### Dia a Dia (Vendedor)

1. Acesse `/vendedor` (home)
2. Veja seu kit do dia
3. Registre vendas em `/vendedor/venda`
4. Use calculadora de troco em `/vendedor/troco`
5. Feche o dia em `/vendedor/fechar`

### Gestão (Owner)

1. Acompanhe dashboard em tempo real em `/dashboard`
2. Veja operações do dia em `/operacoes`
3. Feche dia dos vendedores
4. Gere relatórios em `/relatorios`

## 🌐 PWA (Progressive Web App)

O Venlo é instalável como aplicativo:

### No Android/iOS:
1. Acesse pelo navegador
2. Menu → "Adicionar à tela inicial"
3. Use como app nativo

### Features PWA:
- ✅ Instalável
- ✅ Funciona offline
- ✅ Sincronização automática
- ✅ Ícones personalizados

## 📱 Funcionalidade Offline

### Como funciona:
1. Vendedor perde conexão
2. Vendas são salvas no **IndexedDB** local
3. Banner mostra "Offline" + vendas pendentes
4. Ao reconectar, sincroniza automaticamente
5. Toast confirma "Venda sincronizada"

### Testar offline:
1. Abra DevTools → Network → "Offline"
2. Registre uma venda
3. Volte online
4. Veja a sincronização automática

## 💰 PIX (MVP Manual)

### Versão atual:
- Gera QR Code e "Pix Copia e Cola"
- Confirmação manual pelo vendedor
- Chave PIX fixa (configurável)

### Próximos passos:
- Integração com OpenPix/Gerencianet
- Webhook para confirmação automática
- Geração de QR dinâmico por venda

## 📈 Dashboard Realtime

O dashboard do owner atualiza automaticamente quando:
- Vendedor registra nova venda
- Dia é fechado

Powered by **Supabase Realtime** (WebSocket).

## 🚢 Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Importe no [Vercel](https://vercel.com)
3. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_VENDR_PIX_KEY`
   - `NEXT_PUBLIC_TZ`
4. Deploy!

### Domínio customizado:
- Configure em Vercel → Settings → Domains
- Atualize em Supabase → Authentication → URL Configuration

## 🧪 Testes

### Testar RLS:
1. Crie dois usuários diferentes
2. Crie empresas para cada um
3. Verifique que não veem dados um do outro

### Testar Offline:
1. DevTools → Application → Service Workers
2. Network → Offline
3. Registre vendas
4. Volte online e veja sync

### Testar Realtime:
1. Abra dashboard em duas abas
2. Registre venda em outra aba
3. Veja atualização automática

## 📁 Estrutura de Arquivos

```
windsurf-project/
├── app/
│   ├── api/              # API Routes
│   ├── dashboard/        # Dashboard owner
│   ├── produtos/         # CRUD produtos
│   ├── vendedores/       # CRUD vendedores
│   ├── operacoes/        # Operações do dia
│   ├── relatorios/       # Relatórios + CSV
│   ├── vendedor/         # Páginas vendedor
│   │   ├── venda/
│   │   ├── troco/
│   │   └── fechar/
│   ├── login/
│   ├── onboarding/
│   └── layout.tsx
├── components/
│   ├── ui/               # shadcn/ui
│   ├── KpiCard.tsx
│   ├── SellerCard.tsx
│   ├── PixModal.tsx
│   ├── ProductGrid.tsx
│   ├── KitForm.tsx
│   └── CloseDayDialog.tsx
├── lib/
│   ├── supabase-browser.ts
│   ├── supabase-server.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── validation.ts
│   └── utils.ts
├── store/
│   ├── offlineQueue.ts   # Zustand + IndexedDB
│   └── ui.ts
├── types/
│   └── supabase.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── supabase-schema.sql   # Schema completo + RLS
└── README.md
```

## 🎨 Paleta de Cores

- **Azul Principal**: `#0057FF`
- **Laranja Secundário**: `#FF6B00`
- **Cinza Claro**: `#F5F6F8`
- **Texto**: `#3A3A3A`
- **Branco**: `#FFFFFF`

## 🐛 Troubleshooting

### Erro de RLS:
- Verifique se o usuário tem perfil criado
- Confirme que a empresa_id está correta
- Revise as policies no Supabase

### Offline não funciona:
- Verifique se está usando HTTPS (ou localhost)
- Limpe cache do Service Worker
- Confirme que IndexedDB está habilitado

### Realtime não atualiza:
- Verifique Supabase → Database → Replication
- Confirme que tabela `vendas` está publicada
- Revise RLS (pode bloquear subscription)

## 📝 Seeds (Dados de Teste)

Execute o bloco comentado no final de `supabase-schema.sql` para criar:
- Empresa demo
- 2 vendedores (João, Maria)
- 3 produtos (Picolé, Água, Refri)
- Kits do dia
- Vendas de exemplo

**⚠️ Importante**: Substitua `SEU-USER-UUID-AQUI` pelo UUID real do primeiro usuário criado.

## 🔐 Segurança

### Implementado:
- ✅ RLS em todas as tabelas
- ✅ Autenticação obrigatória
- ✅ Isolamento por empresa
- ✅ Validação server-side (Zod)

### Recomendações produção:
- Use variáveis de ambiente seguras
- Configure CORS no Supabase
- Ative 2FA para owners
- Monitore logs de acesso

## 📱 Compatibilidade

- ✅ Chrome/Edge (Desktop + Mobile)
- ✅ Safari (iOS)
- ✅ Firefox
- ✅ Opera

## 📄 Licença

MIT

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'Add nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: suporte@vendr.com
- 💬 Issues: GitHub Issues
- 📚 Docs: Este README

---

Feito com ❤️ para vendedores ambulantes
