# 📱 Configuração PWA - Venlo

## ✅ Status da Configuração

### Implementado:
- ✅ `next-pwa` configurado no `next.config.js`
- ✅ `manifest.json` atualizado com Trust Blue
- ✅ Meta tags PWA no `layout.tsx`
- ✅ Service Worker com cache strategies
- ✅ Shortcuts para ações rápidas
- ✅ Suporte para iOS (Apple)

### Pendente:
- ⏳ Gerar ícones PWA (192x192, 512x512, 180x180)
- ⏳ Criar screenshot do dashboard
- ⏳ Testar instalação em dispositivos

---

## 🎨 Ícones Necessários

Você precisa criar os seguintes ícones com o logo do Venlo:

### 1. **icon-192x192.png**
- Tamanho: 192x192 pixels
- Formato: PNG
- Uso: Android, Chrome
- Local: `/public/icon-192x192.png`

### 2. **icon-512x512.png**
- Tamanho: 512x512 pixels
- Formato: PNG
- Uso: Android, Chrome (splash screen)
- Local: `/public/icon-512x512.png`

### 3. **apple-icon-180.png**
- Tamanho: 180x180 pixels
- Formato: PNG
- Uso: iOS (iPhone, iPad)
- Local: `/public/apple-icon-180.png`

### 4. **favicon.ico** (opcional)
- Tamanho: 32x32 pixels
- Formato: ICO
- Uso: Navegadores
- Local: `/public/favicon.ico`

---

## 🛠️ Como Gerar os Ícones

### Opção 1: Usar Ferramenta Online (Recomendado)

1. Acesse: https://realfavicongenerator.net/
2. Faça upload do logo Venlo (`logo-vendr.png`)
3. Configure:
   - **Android Chrome:** Usar cor de fundo `#415A77` (Trust Blue)
   - **iOS:** Usar cor de fundo `#415A77`
   - **Favicon:** Gerar todos os tamanhos
4. Baixe o pacote gerado
5. Extraia os arquivos para `/public/`

### Opção 2: Usar ImageMagick (CLI)

```bash
# Instalar ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Gerar ícones
convert logo-vendr.png -resize 192x192 icon-192x192.png
convert logo-vendr.png -resize 512x512 icon-512x512.png
convert logo-vendr.png -resize 180x180 apple-icon-180.png
convert logo-vendr.png -resize 32x32 favicon.ico
```

### Opção 3: Usar Photoshop/Figma

1. Abra o logo no Photoshop ou Figma
2. Crie um canvas quadrado (192x192, 512x512, 180x180)
3. Centralize o logo
4. Adicione background `#415A77` se necessário
5. Exporte como PNG

---

## 📸 Screenshot do Dashboard

Crie um screenshot do dashboard para a loja de apps:

1. Acesse `/dashboard` logado
2. Tire um screenshot em resolução 1280x720
3. Salve como `/public/screenshot-dashboard.png`
4. Certifique-se de que não há dados sensíveis

---

## 🚀 Como Testar o PWA

### No Desktop (Chrome/Edge):

1. Abra o app em `http://localhost:3004`
2. Clique no ícone de instalação na barra de endereço (➕)
3. Clique em "Instalar"
4. O app abrirá em uma janela standalone

### No Android:

1. Abra o app no Chrome
2. Menu (⋮) → "Adicionar à tela inicial"
3. Confirme a instalação
4. O ícone aparecerá na tela inicial

### No iOS (iPhone/iPad):

1. Abra o app no Safari
2. Toque no botão de compartilhar (□↑)
3. Role e toque em "Adicionar à Tela de Início"
4. Confirme

---

## ⚙️ Configurações do PWA

### Service Worker

O Service Worker está configurado com as seguintes estratégias:

#### 1. **Supabase API** (NetworkFirst)
- Tenta buscar da rede primeiro
- Se falhar, usa cache
- Timeout: 10 segundos
- Cache: 24 horas

#### 2. **Imagens** (CacheFirst)
- Usa cache primeiro
- Cache: 30 dias
- Ideal para logos, ícones

#### 3. **JS/CSS** (StaleWhileRevalidate)
- Retorna cache imediatamente
- Atualiza em background
- Cache: 24 horas

### Manifest.json

Configurado com:
- ✅ Nome: "Venlo - Gestão de Vendas Externas"
- ✅ Nome curto: "Venlo"
- ✅ Cor do tema: `#415A77` (Trust Blue)
- ✅ Cor de fundo: `#FFFFFF`
- ✅ Display: standalone (sem barra do navegador)
- ✅ Orientação: portrait-primary
- ✅ Start URL: `/dashboard`

### Shortcuts (Atalhos)

3 atalhos configurados:
1. **Dashboard** → `/dashboard`
2. **Nova Venda** → `/vendas/nova`
3. **Estoque** → `/estoque`

---

## 🔍 Verificar Instalação

### DevTools (Chrome):

1. Abra DevTools (F12)
2. Vá para a aba "Application"
3. Verifique:
   - **Manifest:** Deve mostrar todos os dados
   - **Service Workers:** Deve estar "activated"
   - **Cache Storage:** Deve ter os caches criados

### Lighthouse:

1. Abra DevTools (F12)
2. Vá para a aba "Lighthouse"
3. Selecione "Progressive Web App"
4. Clique em "Generate report"
5. Objetivo: Score 90+

---

## 📋 Checklist de Ativação

### Antes do Deploy:

- [ ] Gerar todos os ícones (192, 512, 180)
- [ ] Criar screenshot do dashboard
- [ ] Testar instalação no Chrome
- [ ] Testar instalação no Android
- [ ] Testar instalação no iOS
- [ ] Verificar Service Worker funcionando
- [ ] Testar modo offline
- [ ] Verificar cache funcionando
- [ ] Lighthouse score 90+

### Após o Deploy:

- [ ] Testar instalação em produção
- [ ] Verificar HTTPS funcionando
- [ ] Testar em múltiplos dispositivos
- [ ] Verificar notificações (se implementado)
- [ ] Monitorar erros do Service Worker

---

## 🐛 Troubleshooting

### Service Worker não registra:

```javascript
// Verificar no console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

### Cache não funciona:

```javascript
// Limpar cache
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

### App não instala:

1. Verificar se está em HTTPS (ou localhost)
2. Verificar se manifest.json está acessível
3. Verificar se os ícones existem
4. Verificar console para erros

---

## 📚 Recursos

- [Next PWA Docs](https://github.com/shadowwalker/next-pwa)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [PWA Builder](https://www.pwabuilder.com/)

---

## 🎯 Próximos Passos

1. **Gerar os ícones** usando uma das opções acima
2. **Criar screenshot** do dashboard
3. **Testar** a instalação localmente
4. **Deploy** para produção
5. **Testar** em dispositivos reais
6. **Monitorar** uso e performance

---

**Status:** ⚙️ Configurado - Aguardando ícones  
**Última Atualização:** 17/10/2025
