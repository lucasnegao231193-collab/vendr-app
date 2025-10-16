/**
 * Script para Configurar .env.local
 * Execute: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnv() {
  log('\n🚀 Configuração do Ambiente - Venlo\n', 'cyan');

  const envPath = path.join(process.cwd(), '.env.local');
  const templatePath = path.join(process.cwd(), '.env.local.template');

  // Verificar se .env.local já existe
  if (fs.existsSync(envPath)) {
    log('⚠️  Arquivo .env.local já existe!', 'yellow');
    const answer = await question('   Deseja sobrescrever? (s/N): ');
    
    if (answer.toLowerCase() !== 's') {
      log('\n✅ Mantendo arquivo existente\n', 'green');
      rl.close();
      return;
    }
  }

  // Copiar template
  try {
    fs.copyFileSync(templatePath, envPath);
    log('\n✅ Arquivo .env.local criado com sucesso!', 'green');
    
    log('\n📋 Próximos passos:', 'cyan');
    log('   1. Abra o arquivo .env.local', 'blue');
    log('   2. Preencha as variáveis obrigatórias:', 'blue');
    log('      - NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    log('      - NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
    log('      - SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    log('   3. Execute: npm run validate:env', 'blue');
    log('   4. Execute: npm run dev\n', 'blue');

    log('💡 Dica: Veja SETUP-CHECKLIST.md para instruções detalhadas\n', 'cyan');

  } catch (error) {
    log('\n❌ Erro ao criar .env.local:', 'red');
    log(`   ${error.message}\n`, 'red');
  }

  rl.close();
}

setupEnv();
