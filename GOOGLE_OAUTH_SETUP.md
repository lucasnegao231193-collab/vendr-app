# 🔐 Configuração Google OAuth - Venlo

## Problema
Erro: "Acesso bloqueado: a solicitação do app Venlo é inválida"  
Código: `redirect_uri_mismatch`

## Causa
As URLs de callback não estão configuradas corretamente no Google Cloud Console.

## Solução

### 1. Acessar Google Cloud Console
- URL: https://console.cloud.google.com/
- Projeto: Venlo

### 2. Navegar para Credenciais
1. Menu lateral → "APIs e Serviços"
2. Clique em "Credenciais"
3. Encontre seu "OAuth 2.0 Client ID"
4. Clique para editar

### 3. Configurar URLs de Redirecionamento

Adicione TODAS estas URLs em "URIs de redirecionamento autorizados":

#### Produção (Netlify)
```
https://venlo.com.br/auth/callback
https://venlo.netlify.app/auth/callback
```

#### Supabase Callback
```
https://<SEU-PROJETO-ID>.supabase.co/auth/v1/callback
```

**Como encontrar o ID do projeto:**
1. Vá em: https://supabase.com/dashboard/project/<seu-projeto>/settings/api
2. Copie a "Project URL"
3. Use o formato: `https://xxxxx.supabase.co/auth/v1/callback`

#### Desenvolvimento Local
```
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

### 4. Configurar Origens JavaScript Autorizadas

Adicione também em "Origens JavaScript autorizadas":

```
https://venlo.com.br
https://venlo.netlify.app
https://<SEU-PROJETO-ID>.supabase.co
http://localhost:3000
```

### 5. Salvar

Clique em "SALVAR" no final da página.

## Verificação no Supabase

1. Acesse: https://supabase.com/dashboard
2. Seu Projeto → Authentication → Providers
3. Clique em "Google"
4. Verifique se:
   - ✅ "Enable Sign in with Google" está ativado
   - ✅ "Client ID" está preenchido
   - ✅ "Client Secret" está preenchido
5. Copie a "Callback URL" mostrada e adicione no Google Console

## Teste

Após configurar:
1. Limpe o cache do navegador
2. Tente fazer login com Google novamente
3. Deve funcionar! ✅

## URLs de Callback Atuais no Código

O código está configurado para redirecionar para:
```typescript
redirectTo: `${window.location.origin}/auth/callback?type=${activeTab}`
```

Isso gera:
- Produção: `https://venlo.com.br/auth/callback?type=empresa`
- Local: `http://localhost:3000/auth/callback?type=empresa`

## Troubleshooting

### Erro persiste?
1. Verifique se salvou no Google Console
2. Aguarde 5 minutos (propagação)
3. Limpe cache do navegador
4. Tente em aba anônima

### Ainda não funciona?
1. Verifique se o domínio está correto
2. Confirme que o Client ID/Secret estão corretos no Supabase
3. Verifique se o Google OAuth está habilitado no Supabase

## Contatos de Suporte

- Supabase: https://supabase.com/dashboard/support
- Google Cloud: https://console.cloud.google.com/support

---

**Última atualização:** 15/10/2025  
**Status:** 🔧 Aguardando configuração
