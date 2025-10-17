/**
 * Script para gerar ícones temporários do PWA
 * Execute: node scripts/generate-temp-icons.js
 */

const fs = require('fs');
const path = require('path');

// Criar SVG temporário com o logo "V"
function createTempIcon(size) {
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#415A77;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1B263B;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.6}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
  >V</text>
</svg>`.trim();

  return svg;
}

// Salvar ícones
const publicDir = path.join(__dirname, '..', 'public');

// Criar ícones
const icons = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-icon-180.png', size: 180 },
];

console.log('🎨 Gerando ícones temporários do PWA...\n');

icons.forEach(({ name, size }) => {
  const svg = createTempIcon(size);
  const svgPath = path.join(publicDir, name.replace('.png', '.svg'));
  
  fs.writeFileSync(svgPath, svg);
  console.log(`✅ Criado: ${name.replace('.png', '.svg')} (${size}x${size})`);
});

console.log('\n⚠️  ATENÇÃO: Estes são ícones TEMPORÁRIOS!');
console.log('📝 Para ícones profissionais, siga as instruções em PWA-SETUP.md');
console.log('🔗 Recomendado: https://realfavicongenerator.net/\n');

// Criar .gitignore para não commitar ícones temporários
const gitignorePath = path.join(publicDir, '.gitignore-icons');
const gitignoreContent = `# Ícones temporários - substituir por ícones profissionais
icon-*.svg
apple-icon-*.svg
`;

fs.writeFileSync(gitignorePath, gitignoreContent);
console.log('✅ Criado .gitignore para ícones temporários\n');
