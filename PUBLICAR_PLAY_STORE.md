# 📱 GUIA: Publicar Venlo na Play Store

## ✅ PASSO 1: Verificar PWA (JÁ FEITO!)

Seu app já tem:
- ✅ manifest.json configurado
- ✅ next-pwa instalado
- ✅ Ícones (192x192 e 512x512)

---

## 🎯 PASSO 2: Gerar APK com Bubblewrap

### 2.1 Instalar Bubblewrap CLI:

```bash
npm install -g @bubblewrap/cli
```

### 2.2 Inicializar projeto TWA:

```bash
bubblewrap init --manifest https://seudominio.com/manifest.json
```

**IMPORTANTE:** Substitua `seudominio.com` pelo seu domínio real onde o Venlo está hospedado.

### 2.3 Responder as perguntas:

- **Domain**: seu domínio (ex: venlo.app)
- **Package name**: com.venlo.app
- **App name**: Venlo
- **Display mode**: standalone
- **Orientation**: portrait
- **Theme color**: #415A77
- **Background color**: #FFFFFF
- **Icon URL**: https://seudominio.com/icon-512.png
- **Maskable icon URL**: https://seudominio.com/icon-512.png
- **Splash screen color**: #415A77
- **Status bar color**: #415A77
- **Navigation bar color**: #FFFFFF

### 2.4 Gerar APK:

```bash
bubblewrap build
```

Isso vai gerar: `app-release-signed.apk`

---

## 📦 PASSO 3: Preparar Assets para Play Store

### 3.1 Criar ícones adicionais:

Você precisa de:
- **Ícone do app**: 512x512px (PNG)
- **Feature graphic**: 1024x500px
- **Screenshots**: Mínimo 2, máximo 8
  - Telefone: 320-3840px (largura ou altura)
  - Tablet 7": 600-7680px
  - Tablet 10": 800-7680px

### 3.2 Textos necessários:

**Título** (máx 50 caracteres):
```
Venlo - Gestão de Vendas
```

**Descrição curta** (máx 80 caracteres):
```
Sistema completo para gestão de vendas externas e ambulantes
```

**Descrição completa** (máx 4000 caracteres):
```
Venlo é a solução completa para gestão de vendas externas e ambulantes.

🎯 RECURSOS PRINCIPAIS:

✅ Gestão de Estoque
- Controle completo de produtos
- Alertas de estoque baixo
- Histórico de movimentações

✅ Vendas Rápidas
- Registro ágil de vendas
- Múltiplas formas de pagamento
- Emissão de recibos

✅ Relatórios Detalhados
- Vendas por período
- Produtos mais vendidos
- Análise de lucro

✅ Catálogo Digital
- Compartilhe produtos com clientes
- QR Code para acesso rápido
- Atualização em tempo real

✅ Gestão Financeira
- Controle de caixa
- Fluxo de caixa
- Relatórios financeiros

✅ Multi-usuário
- Equipe de vendedores
- Permissões personalizadas
- Sincronização em tempo real

IDEAL PARA:
- Vendedores ambulantes
- Representantes comerciais
- Pequenos negócios
- Vendas porta a porta

FUNCIONA OFFLINE!
Continue vendendo mesmo sem internet. Tudo sincroniza automaticamente quando conectar.

SEGURO E CONFIÁVEL
Seus dados protegidos com criptografia de ponta a ponta.
```

---

## 🎮 PASSO 4: Criar Conta no Google Play Console

### 4.1 Acesse:
https://play.google.com/console

### 4.2 Criar conta de desenvolvedor:
- Taxa única: $25 USD
- Preencher informações pessoais/empresa
- Aceitar termos

### 4.3 Criar novo app:
- Clique em "Criar app"
- Nome: Venlo
- Idioma padrão: Português (Brasil)
- Tipo: App
- Gratuito/Pago: Gratuito
- Aceitar declarações

---

## 📝 PASSO 5: Preencher Ficha da Loja

### 5.1 Detalhes do app:
- Nome do app
- Descrição curta
- Descrição completa
- Ícone do app (512x512)
- Feature graphic (1024x500)
- Screenshots

### 5.2 Categorização:
- Categoria: Negócios
- Tags: vendas, gestão, estoque, ambulante

### 5.3 Informações de contato:
- Email
- Site (opcional)
- Política de privacidade (OBRIGATÓRIO)

### 5.4 Classificação de conteúdo:
- Preencher questionário
- Venlo é adequado para todas as idades

---

## 🚀 PASSO 6: Upload do APK

### 6.1 Criar release:
- Produção → Criar nova release
- Upload do APK gerado
- Nome da versão: 1.0.0
- Notas da versão:
  ```
  Lançamento inicial do Venlo!
  
  - Gestão completa de estoque
  - Registro de vendas
  - Relatórios detalhados
  - Catálogo digital
  - Funciona offline
  ```

### 6.2 Revisar e publicar:
- Revisar todas as informações
- Enviar para revisão
- Aguardar aprovação (1-7 dias)

---

## ⚠️ REQUISITOS IMPORTANTES:

### Política de Privacidade:
Você PRECISA ter uma página de política de privacidade. Posso criar uma para você!

### Domínio próprio:
Para TWA funcionar, você precisa:
- ✅ Domínio próprio (ex: venlo.app)
- ✅ HTTPS configurado
- ✅ App hospedado e acessível

### Digital Asset Links:
Criar arquivo `.well-known/assetlinks.json` no seu servidor para verificar propriedade.

---

## 🎯 PRÓXIMOS PASSOS:

1. **Hospedar o Venlo** em um domínio próprio
2. **Gerar APK** com Bubblewrap
3. **Criar assets** (ícones, screenshots)
4. **Criar política de privacidade**
5. **Registrar no Play Console**
6. **Publicar!**

---

## 💡 PRECISA DE AJUDA?

Posso ajudar com:
- ✅ Criar política de privacidade
- ✅ Gerar ícones e screenshots
- ✅ Configurar Digital Asset Links
- ✅ Escrever descrições otimizadas
- ✅ Preparar textos da loja

**Me diga qual parte você quer que eu faça primeiro!** 🚀
