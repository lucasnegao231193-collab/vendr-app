"use client";

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Registrar service worker
      navigator.serviceWorker
        .register('/sw-custom.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);

          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 Nova versão disponível');
                  // Opcional: Mostrar notificação de atualização
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error);
        });

      // Listener para quando o SW estiver controlando a página
      navigator.serviceWorker.ready.then((registration) => {
        console.log('✅ Service Worker ativo e pronto');
      });

      // Listener para mensagens do SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Mensagem do SW:', event.data);
      });

      // Listener para quando voltar online
      window.addEventListener('online', () => {
        console.log('🌐 Voltou online');
        // Opcional: Sincronizar dados pendentes
      });

      // Listener para quando ficar offline
      window.addEventListener('offline', () => {
        console.log('📴 Ficou offline');
      });
    }
  }, []);

  return null;
}
