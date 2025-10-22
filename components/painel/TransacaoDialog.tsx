"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFinancasPessoais } from '@/hooks/useFinancasPessoais';
import { transacaoPessoalSchema, TransacaoPessoalInput, CATEGORIAS_ENTRADA, CATEGORIAS_SAIDA } from '@/types/venlo-mode';

interface TransacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TransacaoDialog({ open, onOpenChange, onSuccess }: TransacaoDialogProps) {
  const { createTransacao } = useFinancasPessoais();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<'entrada' | 'saida'>('saida');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TransacaoPessoalInput>({
    resolver: zodResolver(transacaoPessoalSchema),
    defaultValues: {
      tipo: 'saida',
      data: new Date().toISOString().split('T')[0],
      valor: 0,
    },
  });

  const categorias = tipoSelecionado === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;

  async function onSubmit(data: TransacaoPessoalInput) {
    setIsSubmitting(true);
    try {
      await createTransacao(data);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTipoChange(tipo: 'entrada' | 'saida') {
    setTipoSelecionado(tipo);
    setValue('tipo', tipo);
    setValue('categoria', ''); // Limpar categoria ao mudar tipo
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={tipoSelecionado}
              onValueChange={(value) => handleTipoChange(value as 'entrada' | 'saida')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">💰 Entrada</SelectItem>
                <SelectItem value="saida">💸 Saída</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo.message}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <Select
              onValueChange={(value) => setValue('categoria', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && (
              <p className="text-sm text-destructive">{errors.categoria.message}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...register('valor', { valueAsNumber: true })}
            />
            {errors.valor && (
              <p className="text-sm text-destructive">{errors.valor.message}</p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              {...register('data')}
            />
            {errors.data && (
              <p className="text-sm text-destructive">{errors.data.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Ex: Almoço no restaurante"
              rows={3}
              {...register('descricao')}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
