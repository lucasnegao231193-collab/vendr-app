#!/usr/bin/env node

/**
 * Script de Verificação Automática do Site Vendr
 * Executa lint, build, testes, validação de rotas e ambiente
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Relatório final
const report = {
  timestamp: new Date().toISOString(),
  lint: { status: 'pending', fixed: 0, errors: [] },
  build: { status: 'pending', errors: [] },
  tests: { status: 'pending', passed: 0, failed: 0, errors: [] },
  routes: { status: 'pending', tested: [], failed: [] },
  env: { status: 'pending', missing: [], warnings: [] },
  migrations: { status: 'pending', pending: [] },
  storage: { status: 'pending', errors: [] },
};

// Utilitários
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

// 1. Verificar e aplicar ESLint
async function runLint() {
  log('\n📋 Executando ESLint...', 'blue');
  
  const { error, stdout, stderr } = await execPromise('npm run lint');
  
  if (error) {
    report.lint.status = 'failed';
    report.lint.errors.push(stdout + stderr);
    log('❌ ESLint encontrou erros', 'red');
    
    // Tentar aplicar fixes
    log('🔧 Tentando aplicar fixes automáticos...', 'yellow');
    const { stdout: fixOutput } = await execPromise('npx eslint . --fix --ext .ts,.tsx,.js,.jsx');
    
    const fixedCount = (fixOutput.match(/fixed/gi) || []).length;
    report.lint.fixed = fixedCount;
    
    if (fixedCount > 0) {
      log(`✓ ${fixedCount} problemas corrigidos automaticamente`, 'green');
      report.lint.status = 'fixed';
    }
  } else {
    report.lint.status = 'passed';
    log('✓ ESLint passou sem erros', 'green');
  }
}

// 2. Executar Build
async function runBuild() {
  log('\n🏗️  Executando Build...', 'blue');
  
  const { error, stdout, stderr } = await execPromise('npm run build', {
    timeout: 120000 // 2 minutos
  });
  
  if (error) {
    report.build.status = 'failed';
    report.build.errors.push(stdout + stderr);
    log('❌ Build falhou', 'red');
    
    // Tentar identificar erros comuns
    if (stdout.includes('Module not found')) {
      log('💡 Dica: Verifique imports faltantes', 'yellow');
    }
    if (stdout.includes('Type error')) {
      log('💡 Dica: Execute npx tsc --noEmit para ver erros TypeScript', 'yellow');
    }
  } else {
    report.build.status = 'passed';
    log('✓ Build concluído com sucesso', 'green');
  }
}

// 3. Executar Testes (se existirem)
async function runTests() {
  log('\n🧪 Executando Testes...', 'blue');
  
  // Verificar se existe script de teste
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  
  if (!packageJson.scripts?.test || packageJson.scripts.test.includes('no test')) {
    log('⚠️  Nenhum teste configurado', 'yellow');
    report.tests.status = 'skipped';
    return;
  }
  
  const { error, stdout } = await execPromise('npm test -- --passWithNoTests');
  
  if (error) {
    report.tests.status = 'failed';
    report.tests.errors.push(stdout);
    log('❌ Testes falharam', 'red');
  } else {
    report.tests.status = 'passed';
    log('✓ Todos os testes passaram', 'green');
  }
}

// 4. Validar Rotas Principais
async function validateRoutes() {
  log('\n🌐 Validando Rotas...', 'blue');
  
  const routes = [
    '/',
    '/login',
    '/dashboard',
    '/relatorios',
    '/configuracoes',
    '/solo',
    '/vendedores',
  ];
  
  log('⚠️  Nota: Servidor deve estar rodando em localhost:3000', 'yellow');
  
  for (const route of routes) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3000${route}`, resolve);
        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      
      if (response.statusCode === 200) {
        report.routes.tested.push({ route, status: 200 });
        log(`✓ ${route} - OK`, 'green');
      } else {
        report.routes.failed.push({ route, status: response.statusCode });
        log(`⚠️  ${route} - Status ${response.statusCode}`, 'yellow');
      }
    } catch (error) {
      report.routes.failed.push({ route, error: error.message });
      log(`❌ ${route} - ${error.message}`, 'red');
    }
  }
  
  report.routes.status = report.routes.failed.length === 0 ? 'passed' : 'partial';
}

// 5. Verificar Variáveis de Ambiente
async function checkEnv() {
  log('\n🔐 Verificando Variáveis de Ambiente...', 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_WHATSAPP_NUMBER',
    'STRIPE_SECRET_KEY',
  ];
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    report.env.status = 'failed';
    report.env.missing.push('.env.local file not found');
    log('❌ Arquivo .env.local não encontrado', 'red');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  requiredVars.forEach((varName) => {
    if (!envContent.includes(varName)) {
      report.env.missing.push(varName);
      log(`❌ Variável obrigatória faltando: ${varName}`, 'red');
    } else {
      log(`✓ ${varName}`, 'green');
    }
  });
  
  optionalVars.forEach((varName) => {
    if (!envContent.includes(varName)) {
      report.env.warnings.push(`${varName} (opcional)`);
      log(`⚠️  Variável opcional ausente: ${varName}`, 'yellow');
    }
  });
  
  report.env.status = report.env.missing.length === 0 ? 'passed' : 'failed';
}

// 6. Verificar Migrações Pendentes
async function checkMigrations() {
  log('\n📦 Verificando Migrações...', 'blue');
  
  const migrations = [
    'supabase-migrations-v2-fixed.sql',
    'supabase-solo-migration.sql',
    'supabase-avatars-config-migration.sql',
    'supabase-storage-setup.sql',
  ];
  
  migrations.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file} encontrado`, 'green');
    } else {
      report.migrations.pending.push(file);
      log(`⚠️  ${file} não encontrado`, 'yellow');
    }
  });
  
  report.migrations.status = 'info';
  log('💡 Lembre-se de executar as migrações no Supabase SQL Editor', 'yellow');
}

// 7. Verificar Supabase Storage (requer service key)
async function checkStorage() {
  log('\n☁️  Supabase Storage...', 'blue');
  log('⚠️  Verificação de Storage requer service_role key (skip em ambiente de dev)', 'yellow');
  report.storage.status = 'skipped';
}

// Gerar Relatório JSON
async function generateReport() {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  
  const reportPath = path.join(tmpDir, 'verify-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📊 Relatório salvo em: ${reportPath}`, 'blue');
}

// Resumo Final
function printSummary() {
  log('\n' + '='.repeat(50), 'bright');
  log('📋 RESUMO DA VERIFICAÇÃO', 'bright');
  log('='.repeat(50), 'bright');
  
  const statuses = {
    lint: report.lint.status,
    build: report.build.status,
    tests: report.tests.status,
    routes: report.routes.status,
    env: report.env.status,
  };
  
  Object.entries(statuses).forEach(([key, status]) => {
    const icon = status === 'passed' ? '✓' : status === 'failed' ? '❌' : '⚠️';
    const color = status === 'passed' ? 'green' : status === 'failed' ? 'red' : 'yellow';
    log(`${icon} ${key.toUpperCase()}: ${status}`, color);
  });
  
  log('='.repeat(50), 'bright');
  
  // Verificar se pode commitar
  const canCommit = report.lint.status !== 'failed' && report.build.status === 'passed';
  
  if (canCommit) {
    log('\n✅ Sistema pronto! Pode fazer commit.', 'green');
  } else {
    log('\n⚠️  Corrija os erros antes de commitar.', 'yellow');
  }
}

// Executar Todas as Verificações
async function main() {
  log('\n' + '='.repeat(50), 'bright');
  log('🚀 VENDR - Verificação Automática do Site', 'bright');
  log('='.repeat(50) + '\n', 'bright');
  
  await runLint();
  await runBuild();
  await runTests();
  await validateRoutes();
  await checkEnv();
  await checkMigrations();
  await checkStorage();
  
  await generateReport();
  printSummary();
}

// Executar
main().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
