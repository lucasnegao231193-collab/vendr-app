# 🧪 Guia de Teste - Funcionalidade Offline

## ✅ Configurações Aplicadas

1. **next-pwa habilitado** em produção (`next.config.js`)
2. **Service Worker customizado** para desenvolvimento (`/public/sw-dev.js`)
3. **PWARegister atualizado** para usar SW correto por ambiente
4. **Página offline** criada (`/public/offline.html`)
5. **Estratégias de cache** configuradas para diferentes tipos de recursos

---

## 🧪 Como Testar em Desenvolvimento

### 1. Verificar Registro do Service Worker

1. Abra o navegador em `http://localhost:3000`
2. Abra o DevTools (F12)
3. Vá para a aba **Console**
4. Você deve ver: `✅ Service Worker registrado: http://localhost:3000/`

### 2. Verificar Service Worker Ativo

1. No DevTools, vá para a aba **Application** (Chrome) ou **Storage** (Firefox)
2. No menu lateral, clique em **Service Workers**
3. Você deve ver o service worker ativo: `sw-dev.js`
4. Status deve ser: **activated and is running**

### 3. Testar Cache

1. Navegue por algumas páginas do app (Dashboard, Vendas, Estoque, etc.)
2. No DevTools > Application > Cache Storage
3. Você deve ver o cache `venlo-dev-v1` com os arquivos cacheados

### 4. Testar Modo Offline

**Método 1: DevTools**
1. No DevTools > Network
2. Marque a opção **Offline**
3. Recarregue a página (F5)
4. As páginas visitadas devem carregar do cache
5. Páginas não visitadas devem mostrar `/offline.html`

**Método 2: Desconectar Internet**
1. Desconecte o Wi-Fi ou cabo de rede
2. Tente navegar pelas páginas já visitadas
3. Deve funcionar normalmente
4. Tente acessar uma página nova - deve mostrar página offline

### 5. Verificar Reconexão

1. Volte online (reconecte Wi-Fi)
2. A página offline deve detectar e recarregar automaticamente
3. Verifique no console: `🌐 Voltou online`

---

## 🚀 Como Testar em Produção

### 1. Build de Produção

```bash
npm run build
npm start
```

### 2. Verificar Service Worker

1. Acesse `http://localhost:3000`
2. DevTools > Application > Service Workers
3. Deve mostrar `sw.js` (gerado pelo next-pwa)
4. Status: **activated and is running**

### 3. Verificar Caches

No DevTools > Application > Cache Storage, você deve ver:

- `workbox-precache-v2-...` - Arquivos estáticos
- `supabase-api` - Requisições da API
- `supabase-storage` - Imagens do storage
- `images` - Imagens locais
- `js` - Arquivos JavaScript
- `css` - Arquivos CSS
- `next-data` - Dados do Next.js
- `pages` - Páginas HTML

### 4. Testar Offline Completo

1. Navegue por todo o app
2. Ative modo offline (DevTools > Network > Offline)
3. Recarregue e navegue - tudo deve funcionar
4. Tente fazer uma venda offline - deve salvar localmente
5. Volte online - dados devem sincronizar

---

## 🔍 Debugging

### Service Worker não registra

**Problema**: Console não mostra mensagem de registro

**Soluções**:
1. Limpe o cache: DevTools > Application > Clear storage > Clear site data
2. Desregistre SWs antigos: Application > Service Workers > Unregister
3. Recarregue com Ctrl+Shift+R (hard reload)

### Páginas não carregam offline

**Problema**: Mostra erro ao invés de página offline

**Soluções**:
1. Verifique se navegou pelas páginas antes (cache precisa ser populado)
2. Verifique se o SW está ativo: Application > Service Workers
3. Verifique os caches: Application > Cache Storage

### Cache não atualiza

**Problema**: Mudanças no código não aparecem

**Soluções**:
1. Force update do SW: Application > Service Workers > Update
2. Marque "Update on reload"
3. Ou limpe o cache completamente

---

## 📱 Testar como PWA

### Desktop (Chrome/Edge)

1. Acesse o app
2. Clique no ícone de instalação na barra de endereço (➕)
3. Ou vá em Menu > Instalar Venlo
4. O app abre em janela própria
5. Teste offline - deve funcionar normalmente

### Mobile (Android/iOS)

1. Abra no navegador
2. Menu > Adicionar à tela inicial
3. O app aparece como ícone na tela
4. Abra o app instalado
5. Teste offline - deve funcionar

---

## ✨ Funcionalidades Offline Esperadas

### ✅ Devem Funcionar Offline

- Navegação entre páginas já visitadas
- Visualização de dados cacheados
- Registro de vendas (salvas localmente)
- Visualização de estoque
- Geração de relatórios com dados locais
- Interface completa do app

### ❌ Não Funcionam Offline (esperado)

- Login/Autenticação (requer servidor)
- Sincronização de dados novos
- Upload de imagens
- Pagamentos online
- Notificações push (envio)

### 🔄 Sincronização Automática

Quando voltar online:
- Dados locais são enviados ao servidor
- Novos dados são baixados
- Cache é atualizado
- Conflitos são resolvidos

---

## 📊 Métricas de Sucesso

- ✅ Service Worker registra em < 2s
- ✅ Páginas carregam offline em < 1s
- ✅ Cache ocupa < 50MB
- ✅ Sincronização completa em < 10s
- ✅ Zero erros no console offline

---

## 🐛 Problemas Conhecidos

1. **First Load**: Primeira visita sempre requer internet
2. **Cache Limit**: Navegadores limitam cache (geralmente 50-100MB)
3. **iOS Safari**: Algumas limitações de PWA
4. **Private Mode**: Service Workers não funcionam

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador
2. Verifique a aba Application > Service Workers
3. Tente limpar cache e recarregar
4. Verifique se está usando HTTPS (produção)
5. Teste em outro navegador

---

**Última atualização**: Outubro 2024
**Versão do Service Worker**: v1.0
