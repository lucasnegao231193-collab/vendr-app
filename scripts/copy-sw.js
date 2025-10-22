const fs = require('fs');
const path = require('path');

console.log('📦 Copiando Service Worker files...');

const publicDir = path.join(__dirname, '..', 'public');
const nextDir = path.join(__dirname, '..', '.next');
const nextStaticDir = path.join(nextDir, 'static');

// Criar diretório static se não existir
if (!fs.existsSync(nextStaticDir)) {
  fs.mkdirSync(nextStaticDir, { recursive: true });
}

// Arquivos para copiar
const filesToCopy = [
  'sw.js',
  'workbox-*.js',
  'fallback-*.js',
  'offline.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

let copiedCount = 0;

// Copiar cada arquivo
filesToCopy.forEach(pattern => {
  if (pattern.includes('*')) {
    // Padrão com wildcard
    const files = fs.readdirSync(publicDir).filter(file => {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(file);
    });
    
    files.forEach(file => {
      const src = path.join(publicDir, file);
      const dest = path.join(nextDir, file);
      
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`  ✅ Copiado: ${file}`);
        copiedCount++;
      }
    });
  } else {
    // Arquivo específico
    const src = path.join(publicDir, pattern);
    const dest = path.join(nextDir, pattern);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✅ Copiado: ${pattern}`);
      copiedCount++;
    } else {
      console.log(`  ⚠️  Não encontrado: ${pattern}`);
    }
  }
});

console.log(`\n✨ Total de arquivos copiados: ${copiedCount}`);
console.log('🎉 Service Worker pronto para deploy!\n');
