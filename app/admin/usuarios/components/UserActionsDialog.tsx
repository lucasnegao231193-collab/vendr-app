'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Lock, Unlock, RefreshCw, Edit } from 'lucide-react';

interface Usuario {
  id: string;
  email: string;
  perfil?: {
    nome: string;
    role: string;
  };
  is_admin: boolean;
  is_blocked?: boolean;
}

interface UserActionsDialogProps {
  usuario: Usuario;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserActionsDialog({ usuario, open, onOpenChange, onSuccess }: UserActionsDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState(usuario.perfil?.nome || '');

  async function handleEdit() {
    if (!nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome não pode estar vazio',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/usuarios/${usuario.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Usuário atualizado'
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Erro ao atualizar');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o usuário',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/usuarios/${usuario.id}/block`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Usuário bloqueado'
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Erro ao bloquear');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível bloquear o usuário',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUnblock() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/usuarios/${usuario.id}/unblock`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Usuário desbloqueado'
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Erro ao desbloquear');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível desbloquear o usuário',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/usuarios/${usuario.id}/reset-password`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Email de redefinição enviado'
        });
        onOpenChange(false);
      } else {
        throw new Error('Erro ao resetar senha');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar a senha',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Usuário</DialogTitle>
          <DialogDescription>
            {usuario.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Editar Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <div className="flex gap-2">
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do usuário"
              />
              <Button
                onClick={handleEdit}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-2">
            <Label>Ações</Label>
            <div className="grid gap-2">
              {/* Resetar Senha */}
              <Button
                onClick={handleResetPassword}
                disabled={loading}
                variant="outline"
                className="w-full justify-start"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar Senha (Enviar Email)
              </Button>

              {/* Bloquear/Desbloquear */}
              {usuario.is_blocked ? (
                <Button
                  onClick={handleUnblock}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start text-green-600"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Desbloquear Conta
                </Button>
              ) : (
                <Button
                  onClick={handleBlock}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start text-red-600"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Bloquear Conta
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
