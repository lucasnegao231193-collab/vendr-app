/**
 * Script para Validar Variáveis de Ambiente
 * Execute: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Variáveis obrigatórias
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
];

// Variáveis opcionais mas recomendadas
const optionalVars = {
  payment: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'MERCADOPAGO_ACCESS_TOKEN',
  ],
  email: [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
  ],
  push: [
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
  ],
  monitoring: [
    'NEXT_PUBLIC_SENTRY_DSN',
  ],
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('\n❌ Arquivo .env.local não encontrado!', 'red');
    log('\n📝 Crie o arquivo .env.local na raiz do projeto', 'yellow');
    log('   Copie o conteúdo de .env.example como base\n', 'yellow');
    return false;
  }
  
  return true;
}

function validateEnv() {
  log('\n🔍 Validando Variáveis de Ambiente...\n', 'cyan');
  
  if (!checkEnvFile()) {
    process.exit(1);
  }

  let hasErrors = false;
  let warnings = 0;

  // Verificar variáveis obrigatórias
  log('📋 Variáveis Obrigatórias:', 'blue');
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`  ✅ ${varName}`, 'green');
    } else {
      log(`  ❌ ${varName} - FALTANDO!`, 'red');
      hasErrors = true;
    }
  });

  // Verificar variáveis opcionais
  log('\n📋 Funcionalidades Opcionais:', 'blue');
  
  Object.entries(optionalVars).forEach(([category, vars]) => {
    const categoryName = {
      payment: 'Pagamentos',
      email: 'Email',
      push: 'Push Notifications',
      monitoring: 'Monitoramento',
    }[category];

    log(`\n  ${categoryName}:`, 'cyan');
    
    let categoryComplete = true;
    vars.forEach(varName => {
      if (process.env[varName]) {
        log(`    ✅ ${varName}`, 'green');
      } else {
        log(`    ⚠️  ${varName} - Não configurado`, 'yellow');
        categoryComplete = false;
        warnings++;
      }
    });

    if (categoryComplete) {
      log(`    ✨ ${categoryName} totalmente configurado!`, 'green');
    }
  });

  // Resumo
  log('\n' + '='.repeat(50), 'cyan');
  
  if (hasErrors) {
    log('\n❌ ERRO: Variáveis obrigatórias faltando!', 'red');
    log('   Configure-as no arquivo .env.local\n', 'yellow');
    process.exit(1);
  } else {
    log('\n✅ Todas as variáveis obrigatórias estão configuradas!', 'green');
  }

  if (warnings > 0) {
    log(`\n⚠️  ${warnings} variáveis opcionais não configuradas`, 'yellow');
    log('   Algumas funcionalidades podem não funcionar\n', 'yellow');
  } else {
    log('\n🎉 Todas as variáveis estão configuradas!\n', 'green');
  }

  // Dicas
  log('💡 Próximos passos:', 'cyan');
  log('   1. Execute as migrations no Supabase', 'blue');
  log('   2. Configure os webhooks do Stripe', 'blue');
  log('   3. Teste o sistema localmente', 'blue');
  log('   4. Faça o deploy em produção\n', 'blue');
}

// Executar validação
try {
  // Carregar .env.local
  require('dotenv').config({ path: '.env.local' });
  validateEnv();
} catch (error) {
  log('\n❌ Erro ao validar variáveis:', 'red');
  log(`   ${error.message}\n`, 'red');
  process.exit(1);
}
