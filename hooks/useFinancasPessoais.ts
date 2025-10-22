"use client";

import { useState, useCallback } from 'react';
import { TransacaoPessoal, TransacaoPessoalInput, FiltrosTransacoes } from '@/types/venlo-mode';
import { useToast } from '@/components/ui/use-toast';

export function useFinancasPessoais() {
  const [transacoes, setTransacoes] = useState<TransacaoPessoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Listar transações
  const fetchTransacoes = useCallback(async (filtros?: FiltrosTransacoes) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros?.tipo) params.append('tipo', filtros.tipo);
      if (filtros?.categoria) params.append('categoria', filtros.categoria);
      if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros?.limit) params.append('limit', filtros.limit.toString());
      if (filtros?.offset) params.append('offset', filtros.offset.toString());

      const response = await fetch(`/api/pessoal/transacoes?${params.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao carregar transações');
      }

      const data = await response.json();
      setTransacoes(data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar transações',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Criar transação
  const createTransacao = useCallback(async (data: TransacaoPessoalInput) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pessoal/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar transação');
      }

      const newTransacao = await response.json();
      
      setTransacoes(prev => [newTransacao, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Transação criada com sucesso',
      });

      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'tx_created', {
          tipo: data.tipo,
          valor: data.valor,
        });
      }

      return newTransacao;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar transação',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Atualizar transação
  const updateTransacao = useCallback(async (id: string, data: Partial<TransacaoPessoalInput>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pessoal/transacoes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar transação');
      }

      const updatedTransacao = await response.json();
      
      setTransacoes(prev => 
        prev.map(t => t.id === id ? updatedTransacao : t)
      );
      
      toast({
        title: 'Sucesso',
        description: 'Transação atualizada com sucesso',
      });

      return updatedTransacao;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar transação',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Deletar transação
  const deleteTransacao = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pessoal/transacoes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar transação');
      }

      setTransacoes(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Transação removida com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao deletar transação',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    transacoes,
    isLoading,
    fetchTransacoes,
    createTransacao,
    updateTransacao,
    deleteTransacao,
  };
}
