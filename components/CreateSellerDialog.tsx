/**
 * Dialog para criar vendedor com email e senha
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from "lucide-react";

interface CreateSellerDialogProps {
  onSuccess?: () => void;
}

export function CreateSellerDialog({ onSuccess }: CreateSellerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [documento, setDocumento] = useState("");
  const [comissao, setComissao] = useState("10");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/create-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          senha,
          telefone: telefone || undefined,
          documento: documento || undefined,
          comissao_padrao: parseFloat(comissao),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Erro ao criar vendedor");
      }

      toast({
        title: "✅ Vendedor criado com sucesso!",
        description: `${nome} já pode fazer login com o email e senha cadastrados.`,
      });

      // Limpar form
      setNome("");
      setEmail("");
      setSenha("");
      setTelefone("");
      setDocumento("");
      setComissao("10");
      setOpen(false);

      onSuccess?.();
    } catch (error: any) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao criar vendedor",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Criar Vendedor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Vendedor</DialogTitle>
            <DialogDescription>
              O vendedor poderá fazer login com o email e senha cadastrados
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome" className="required">
                Nome
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="João da Silva"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="required">
                E-mail (login)
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="senha" className="required">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="documento">Documento (CPF/RG)</Label>
              <Input
                id="documento"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="000.000.000-00"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comissao">Comissão Padrão (%)</Label>
              <Input
                id="comissao"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={comissao}
                onChange={(e) => setComissao(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Vendedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
