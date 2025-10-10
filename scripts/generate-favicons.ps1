# Script PowerShell para gerar todos os favicons necessários
# Executa: .\scripts\generate-favicons.ps1

Write-Host "🎨 Gerando favicons para Venlo..." -ForegroundColor Cyan

# Verifica se o favicon.ico existe
if (-Not (Test-Path "public\favicon.ico")) {
    Write-Host "❌ Erro: public\favicon.ico não encontrado!" -ForegroundColor Red
    Write-Host "   Por favor, salve o arquivo favicon.ico em public\ primeiro." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ favicon.ico encontrado!" -ForegroundColor Green

# Instruções para gerar outros tamanhos
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para gerar favicons de múltiplos tamanhos, use:" -ForegroundColor White
Write-Host ""
Write-Host "OPÇÃO 1: Online (Mais fácil)" -ForegroundColor Yellow
Write-Host "  1. Acesse: https://realfavicongenerator.net/"
Write-Host "  2. Upload: public\favicon.ico"
Write-Host "  3. Baixe o pacote ZIP"
Write-Host "  4. Extraia na pasta public\"
Write-Host ""
Write-Host "OPÇÃO 2: ImageMagick (Linha de comando)" -ForegroundColor Yellow
Write-Host "  # Instale: choco install imagemagick"
Write-Host "  # Execute:"
Write-Host '  magick convert public\favicon.ico -resize 192x192 public\favicon-192x192.png'
Write-Host '  magick convert public\favicon.ico -resize 512x512 public\favicon-512x512.png'
Write-Host '  magick convert public\favicon.ico -resize 180x180 public\apple-touch-icon.png'
Write-Host ""
Write-Host "✨ Depois de gerar os arquivos:" -ForegroundColor Cyan
Write-Host "  git add public/"
Write-Host '  git commit -m "feat: adicionar favicons Venlo"'
Write-Host "  git push origin main"
Write-Host ""
