/**
 * EditProductDialog - Modal para editar produto
 * Permite editar: nome, marca, preço, quantidade, status ativo
 */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase-browser";
import { Loader2 } from "lucide-react";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: {
    id: string;
    produto_id: string;
    nome: string;
    marca: string | null;
    preco: number;
    qtd: number;
    ativo: boolean;
  } | null;
  onSuccess: () => void;
}

export function EditProductDialog({
  open,
  onOpenChange,
  produto,
  onSuccess,
}: EditProductDialogProps) {
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (produto) {
      setNome(produto.nome);
      setMarca(produto.marca || "");
      setPreco(produto.preco.toString());
      setQuantidade(produto.qtd.toString());
      setAtivo(produto.ativo);
    } else {
      // Limpar campos para novo produto
      setNome("");
      setMarca("");
      setPreco("");
      setQuantidade("");
      setAtivo(true);
    }
  }, [produto, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        variant: "destructive",
      });
      return;
    }

    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum < 0) {
      toast({
        title: "Preço inválido",
        variant: "destructive",
      });
      return;
    }

    const qtdNum = parseInt(quantidade);
    if (isNaN(qtdNum) || qtdNum < 0) {
      toast({
        title: "Quantidade inválida",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar empresa_id do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) throw new Error("Perfil não encontrado");

      if (produto) {
        // EDITAR produto existente
        const { error: produtoError } = await supabase
          .from("produtos")
          .update({
            nome: nome.trim(),
            marca: marca.trim() || null,
            preco: precoNum,
            estoque_atual: qtdNum,
            ativo,
          })
          .eq("id", produto.produto_id);

        if (produtoError) throw produtoError;

        toast({
          title: "Produto atualizado!",
          description: "As alterações foram salvas com sucesso",
        });
      } else {
        // CRIAR novo produto
        const { error: produtoError } = await supabase
          .from("produtos")
          .insert({
            empresa_id: perfil.empresa_id,
            nome: nome.trim(),
            marca: marca.trim() || null,
            preco: precoNum,
            estoque_atual: qtdNum,
            ativo,
            unidade: "un",
            sku: `SKU-${Date.now()}`,
          });

        if (produtoError) throw produtoError;

        toast({
          title: "Produto criado!",
          description: "O produto foi adicionado ao estoque",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
          <DialogDescription>
            {produto ? "Atualize as informações do produto" : "Preencha os dados do novo produto"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Coca-Cola 2L"
              required
            />
          </div>

          {/* Marca */}
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ex: Coca-Cola"
            />
          </div>

          {/* Preço e Quantidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="0"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="ativo">Produto Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Produtos inativos não aparecem para vendedores
              </p>
            </div>
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={setAtivo}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
