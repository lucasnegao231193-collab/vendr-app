# 🚀 Guia de Deploy - Vendr

## Configuração no Netlify

### 1. Variáveis de Ambiente

No painel do Netlify, vá em **Site settings > Environment variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NEXT_PUBLIC_SITE_URL=https://seu-site.netlify.app
```

⚠️ **IMPORTANTE:** A variável `NEXT_PUBLIC_SITE_URL` deve conter a URL completa do seu site em produção (sem barra no final).

### 2. Configuração do Supabase

No painel do Supabase, vá em **Authentication > URL Configuration** e adicione:

**Site URL:**
```
https://seu-site.netlify.app
```

**Redirect URLs (adicione todas):**
```
https://seu-site.netlify.app/auth/callback
http://localhost:3000/auth/callback
```

### 3. Google OAuth

No [Google Cloud Console](https://console.cloud.google.com/):

1. Vá em **APIs & Services > Credentials**
2. Edite seu OAuth 2.0 Client
3. Em **Authorized redirect URIs**, adicione:
   ```
   https://seu-projeto.supabase.co/auth/v1/callback
   ```

### 4. Deploy

Após configurar tudo:

```bash
git push origin main
```

O Netlify vai fazer o build automaticamente.

## Testando Localmente

1. Copie `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Preencha com suas credenciais

3. Rode o projeto:
   ```bash
   npm run dev
   ```

## Troubleshooting

### OAuth redireciona para localhost em produção

✅ **Solução:** Configure `NEXT_PUBLIC_SITE_URL` no Netlify com a URL de produção.

### Erro "Invalid redirect URL"

✅ **Solução:** Adicione a URL no Supabase em **Authentication > URL Configuration > Redirect URLs**.
