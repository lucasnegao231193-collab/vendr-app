"use client";

import { useState, useEffect, useCallback } from 'react';
import { VenloMode } from '@/types/venlo-mode';

const VENLO_MODE_KEY = 'venlo_mode';
const COOKIE_NAME = 'venlo_mode';
const DEFAULT_MODE: VenloMode = 'PROFISSIONAL';

// Helper para cookies
function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
}

export function useVenloMode() {
  const [mode, setModeState] = useState<VenloMode>(DEFAULT_MODE);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar modo salvo ao montar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Tentar carregar do localStorage primeiro
    const savedMode = localStorage.getItem(VENLO_MODE_KEY) as VenloMode | null;
    
    // Fallback para cookie
    const cookieMode = getCookie(COOKIE_NAME) as VenloMode | null;
    
    const initialMode = savedMode || cookieMode || DEFAULT_MODE;
    
    // Validar modo
    if (initialMode === 'PROFISSIONAL' || initialMode === 'PESSOAL') {
      setModeState(initialMode);
    }
    
    setIsLoading(false);
  }, []);

  // Função para alterar o modo
  const setMode = useCallback((newMode: VenloMode) => {
    if (typeof window === 'undefined') return;

    // Validar modo
    if (newMode !== 'PROFISSIONAL' && newMode !== 'PESSOAL') {
      console.error('Modo inválido:', newMode);
      return;
    }

    // Atualizar estado
    setModeState(newMode);

    // Persistir em localStorage
    try {
      localStorage.setItem(VENLO_MODE_KEY, newMode);
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }

    // Persistir em cookie
    try {
      setCookie(COOKIE_NAME, newMode);
    } catch (error) {
      console.error('Erro ao salvar cookie:', error);
    }

    // Analytics (opcional)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mode_switch', {
        mode: newMode,
        timestamp: new Date().toISOString(),
      });
    }

    console.log('✅ Modo alterado para:', newMode);
  }, []);

  // Toggle entre modos
  const toggleMode = useCallback(() => {
    const newMode = mode === 'PROFISSIONAL' ? 'PESSOAL' : 'PROFISSIONAL';
    setMode(newMode);
  }, [mode, setMode]);

  // Verificar se está em modo específico
  const isProfissional = mode === 'PROFISSIONAL';
  const isPessoal = mode === 'PESSOAL';

  return {
    mode,
    setMode,
    toggleMode,
    isProfissional,
    isPessoal,
    isLoading,
  };
}
