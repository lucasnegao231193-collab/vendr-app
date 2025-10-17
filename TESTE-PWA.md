# 🧪 Guia de Teste do PWA - Venlo

## ✅ Pré-requisitos

- [x] Ícones gerados e na pasta `/public/`
- [x] `icon-192.png` ✅
- [x] `icon-512.png` ✅
- [x] Servidor rodando em `http://localhost:3004`

---

## 🖥️ Teste 1: Desktop (Chrome/Edge)

### Passo a Passo:

1. **Abra o Chrome ou Edge**
   ```
   http://localhost:3004
   ```

2. **Abra o DevTools** (F12)
   - Vá para a aba **"Application"**
   - No menu lateral, clique em **"Manifest"**

3. **Verificar Manifest:**
   - ✅ Nome: "Venlo - Gestão de Vendas Externas"
   - ✅ Short name: "Venlo"
   - ✅ Theme color: #415A77
   - ✅ Icons: Deve mostrar os 2 ícones
   - ✅ Start URL: /dashboard

4. **Verificar Service Worker:**
   - No menu lateral, clique em **"Service Workers"**
   - ✅ Deve mostrar um SW ativo
   - ✅ Status: "activated and is running"

5. **Testar Instalação:**
   - Aguarde 10 segundos
   - ✅ Banner de instalação deve aparecer no canto inferior
   - OU
   - Clique no ícone **➕** na barra de endereço
   - Clique em **"Instalar Venlo"**

6. **Após Instalação:**
   - ✅ App abre em janela standalone (sem barra do navegador)
   - ✅ Ícone do Venlo aparece na área de trabalho
   - ✅ Pode ser encontrado no menu iniciar

### Verificar Cache:

1. No DevTools, vá para **"Cache Storage"**
2. Deve ter 3 caches:
   - ✅ `supabase-cache`
   - ✅ `image-cache`
   - ✅ `static-resources`

### Testar Offline:

1. No DevTools, vá para **"Network"**
2. Marque **"Offline"**
3. Recarregue a página (F5)
4. ✅ Página deve carregar normalmente (assets em cache)

---

## 📱 Teste 2: Android (Chrome)

### Passo a Passo:

1. **Acesse pelo Chrome no Android:**
   ```
   http://SEU-IP-LOCAL:3004
   ```
   Exemplo: `http://192.168.1.100:3004`

2. **Aguarde 10 segundos:**
   - ✅ Banner de instalação aparece

3. **OU use o menu:**
   - Toque no menu (⋮) no canto superior direito
   - Toque em **"Adicionar à tela inicial"**
   - OU **"Instalar app"**

4. **Confirme a instalação:**
   - Toque em **"Instalar"**
   - ✅ Ícone aparece na tela inicial

5. **Abra o app:**
   - Toque no ícone na tela inicial
   - ✅ Abre em tela cheia (sem barra do Chrome)
   - ✅ Splash screen com logo Venlo

### Testar Shortcuts (Android 8+):

1. Pressione e segure o ícone do Venlo
2. ✅ Deve mostrar 3 atalhos:
   - Dashboard
   - Nova Venda
   - Estoque

---

## 🍎 Teste 3: iOS (Safari)

### Passo a Passo:

1. **Acesse pelo Safari no iPhone/iPad:**
   ```
   http://SEU-IP-LOCAL:3004
   ```

2. **Adicionar à tela inicial:**
   - Toque no botão de **compartilhar** (□↑)
   - Role para baixo
   - Toque em **"Adicionar à Tela de Início"**

3. **Personalize (opcional):**
   - Nome: Venlo (já preenchido)
   - Toque em **"Adicionar"**

4. **Abra o app:**
   - Toque no ícone na tela inicial
   - ✅ Abre em tela cheia
   - ✅ Barra de status com cor Trust Blue

---

## 🔍 Teste 4: Lighthouse (Score PWA)

### Passo a Passo:

1. **Abra o Chrome DevTools** (F12)

2. **Vá para a aba "Lighthouse"**

3. **Configure:**
   - ✅ Marque **"Progressive Web App"**
   - ✅ Marque **"Performance"** (opcional)
   - Device: Desktop ou Mobile

4. **Gere o relatório:**
   - Clique em **"Generate report"**
   - Aguarde a análise

5. **Verifique o score:**
   - ✅ PWA Score: Deve ser **90+**
   - ✅ Installable: ✅
   - ✅ PWA Optimized: ✅
   - ✅ Works Offline: ✅

### Itens que devem passar:

- ✅ Registers a service worker
- ✅ Responds with a 200 when offline
- ✅ Has a `<meta name="viewport">` tag
- ✅ Contains some content when JavaScript is not available
- ✅ Provides a valid `manifest.json`
- ✅ Has a maskable icon
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color

---

## 🧪 Teste 5: Funcionalidade Offline

### Cenário 1: Primeira Visita Offline

1. Abra o app pela primeira vez
2. ✅ Deve carregar normalmente (precisa de internet)
3. Feche o app

### Cenário 2: Segunda Visita Offline

1. **Desconecte da internet:**
   - WiFi: Desligar
   - Mobile: Modo avião

2. **Abra o app instalado**
   - ✅ Deve abrir normalmente
   - ✅ Assets carregam do cache
   - ✅ Layout aparece completo

3. **Navegue pelo app:**
   - ✅ Páginas já visitadas carregam
   - ✅ Imagens já vistas aparecem

### Cenário 3: Sincronização

1. **Offline:**
   - Registre uma venda (se implementado)
   - ✅ Deve salvar localmente

2. **Volte online:**
   - ✅ Dados sincronizam automaticamente
   - ✅ Notificação de sucesso

---

## 📊 Checklist de Validação

### Instalação:
- [ ] Banner de instalação aparece após 10s
- [ ] Botão "Instalar" funciona
- [ ] App instala com sucesso
- [ ] Ícone correto aparece
- [ ] Nome correto aparece

### Visual:
- [ ] Abre em modo standalone (sem barra)
- [ ] Cor do tema Trust Blue (#415A77)
- [ ] Splash screen aparece (Android)
- [ ] Ícone de alta qualidade

### Funcionalidade:
- [ ] Service Worker registra
- [ ] Cache funciona
- [ ] Funciona offline (após primeira visita)
- [ ] Sincronização funciona
- [ ] Shortcuts aparecem (Android)

### Performance:
- [ ] Lighthouse PWA Score 90+
- [ ] Carregamento rápido
- [ ] Transições suaves
- [ ] Sem erros no console

---

## 🐛 Problemas Comuns

### Banner não aparece:

**Possíveis causas:**
- Já está instalado
- Já foi dispensado (localStorage)
- Não passou 10 segundos
- Navegador não suporta

**Solução:**
```javascript
// No console do navegador:
localStorage.removeItem('pwa-install-dismissed');
// Recarregue a página
```

### Service Worker não registra:

**Verificar:**
1. Está em HTTPS ou localhost?
2. `next.config.js` está correto?
3. Erros no console?

**Solução:**
```javascript
// No console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
// Recarregue a página
```

### Ícones não aparecem:

**Verificar:**
1. Arquivos existem em `/public/`?
2. Nomes corretos: `icon-192.png`, `icon-512.png`?
3. Formato PNG?
4. Tamanhos corretos?

**Solução:**
- Verifique os arquivos
- Limpe o cache do navegador
- Recarregue

### Não funciona offline:

**Verificar:**
1. Service Worker está ativo?
2. Visitou a página online primeiro?
3. Cache foi criado?

**Solução:**
- Visite a página online primeiro
- Navegue por algumas páginas
- Aguarde o cache ser criado
- Teste offline novamente

---

## 📱 Como Desinstalar (Para Testes)

### Desktop:
1. Chrome: `chrome://apps/`
2. Clique com botão direito no Venlo
3. "Remover do Chrome"

### Android:
1. Pressione e segure o ícone
2. "Desinstalar" ou arraste para lixeira

### iOS:
1. Pressione e segure o ícone
2. "Remover App"
3. "Remover da Tela de Início"

---

## ✅ Resultado Esperado

Após todos os testes, o PWA deve:

- ✅ Instalar em todos os dispositivos
- ✅ Funcionar offline após primeira visita
- ✅ Ter ícones de alta qualidade
- ✅ Abrir em modo standalone
- ✅ Ter Lighthouse score 90+
- ✅ Sincronizar dados automaticamente
- ✅ Ter performance excelente

---

## 📞 Próximos Passos

Após validar todos os testes:

1. ✅ Deploy em produção (Netlify)
2. ✅ Testar em produção com HTTPS
3. ✅ Monitorar instalações
4. ✅ Coletar feedback dos usuários
5. ✅ Otimizar baseado em métricas

---

**Última Atualização:** 17/10/2025  
**Status:** Pronto para testes! 🚀
