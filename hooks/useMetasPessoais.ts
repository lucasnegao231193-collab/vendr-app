"use client";

import { useState, useCallback } from 'react';
import { MetaPessoal, MetaPessoalInput } from '@/types/venlo-mode';
import { useToast } from '@/components/ui/use-toast';

export function useMetasPessoais() {
  const [meta, setMeta] = useState<MetaPessoal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Buscar meta do mês
  const fetchMeta = useCallback(async (ano: number, mes: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pessoal/meta?ano=${ano}&mes=${mes}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setMeta(null);
          return null;
        }
        const error = await response.json();
        throw new Error(error.error || 'Erro ao carregar meta');
      }

      const data = await response.json();
      setMeta(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar meta:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar meta',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Criar ou atualizar meta
  const upsertMeta = useCallback(async (data: MetaPessoalInput) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pessoal/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar meta');
      }

      const savedMeta = await response.json();
      setMeta(savedMeta);
      
      toast({
        title: 'Sucesso',
        description: 'Meta atualizada com sucesso',
      });

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'goal_updated', {
          ano: data.ano,
          mes: data.mes,
          valor: data.meta_economia,
        });
      }

      return savedMeta;
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar meta',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    meta,
    isLoading,
    fetchMeta,
    upsertMeta,
  };
}
