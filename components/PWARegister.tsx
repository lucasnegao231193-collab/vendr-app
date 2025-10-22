"use client";

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    console.log('🔧 PWARegister: Iniciando...');
    
    if (typeof window === 'undefined') {
      console.log('⚠️ PWARegister: Window não disponível (SSR)');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.error('❌ PWARegister: Service Worker não suportado neste navegador');
      return;
    }

    console.log('✅ PWARegister: Service Worker suportado');

    const registerSW = async () => {
      try {
        // Limpar service workers antigos primeiro
        console.log('🔍 Verificando Service Workers existentes...');
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`📋 Encontrados ${registrations.length} Service Worker(s)`);
        
        for (const registration of registrations) {
          const scriptURL = registration.active?.scriptURL || registration.installing?.scriptURL || registration.waiting?.scriptURL;
          console.log(`  - SW: ${scriptURL}`);
          
          // Desregistrar SWs antigos que não sejam o correto
          if (scriptURL && !scriptURL.includes('/sw.js') && !scriptURL.includes('/sw-dev.js')) {
            console.log('🗑️ Removendo SW antigo:', scriptURL);
            await registration.unregister();
          }
        }

        // Determinar qual SW usar
        const isDev = process.env.NODE_ENV === 'development';
        const swPath = isDev ? '/sw-dev.js' : '/sw.js';
        
        console.log(`📦 Ambiente: ${isDev ? 'Desenvolvimento' : 'Produção'}`);
        console.log(`📄 Registrando: ${swPath}`);

        // Verificar se o arquivo existe
        const checkResponse = await fetch(swPath, { method: 'HEAD' });
        if (!checkResponse.ok) {
          console.error(`❌ Arquivo ${swPath} não encontrado (${checkResponse.status})`);
          return;
        }
        console.log(`✅ Arquivo ${swPath} encontrado`);

        // Registrar service worker
        const registration = await navigator.serviceWorker.register(swPath, { 
          scope: '/',
          updateViaCache: 'none'
        });
        
        console.log('✅ Service Worker registrado com sucesso!');
        console.log('   Scope:', registration.scope);
        console.log('   Installing:', registration.installing?.scriptURL);
        console.log('   Waiting:', registration.waiting?.scriptURL);
        console.log('   Active:', registration.active?.scriptURL);

        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('🔄 Nova versão do SW sendo instalada...');
            newWorker.addEventListener('statechange', () => {
              console.log(`   Estado do SW: ${newWorker.state}`);
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✨ Nova versão disponível! Recarregue para atualizar.');
              }
            });
          }
        });

        // Listener para quando o SW estiver controlando a página
        navigator.serviceWorker.ready.then((reg) => {
          console.log('✅ Service Worker ativo e pronto');
          console.log('   Controlando:', reg.active ? 'Sim' : 'Não');
        });

        // Listener para mensagens do SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('📨 Mensagem do SW:', event.data);
        });

      } catch (error) {
        console.error('❌ Erro ao registrar Service Worker:', error);
      }
    };

    // Executar registro
    registerSW();

    // Listener para quando voltar online
    window.addEventListener('online', () => {
      console.log('🌐 Voltou online');
    });

    // Listener para quando ficar offline
    window.addEventListener('offline', () => {
      console.log('📴 Ficou offline');
    });

  }, []);

  return null;
}
