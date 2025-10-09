/**
 * Formulário para criar/editar kit diário
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Vendedor {
  id: string;
  nome: string;
  comissao_padrao: number;
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
}

interface KitFormProps {
  vendedores: Vendedor[];
  produtos: Produto[];
  onSuccess?: () => void;
}

interface KitItem {
  produto_id: string;
  qtd_atribuida: number;
}

export function KitForm({ vendedores, produtos, onSuccess }: KitFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [vendedorId, setVendedorId] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [comissaoPercent, setComissaoPercent] = useState(0.1);
  const [itens, setItens] = useState<KitItem[]>([]);

  const handleAddItem = () => {
    setItens([...itens, { produto_id: "", qtd_atribuida: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof KitItem, value: any) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setItens(newItens);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validItens = itens.filter((item) => item.produto_id && item.qtd_atribuida > 0);

      if (!vendedorId || validItens.length === 0) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendedor_id: vendedorId,
          data,
          comissao_percent: comissaoPercent,
          itens: validItens,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar kit");
      }

      toast({
        title: "Kit criado!",
        description: "Kit diário atribuído com sucesso",
      });

      // Reset form
      setVendedorId("");
      setItens([]);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o kit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Atribuir Kit Diário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vendedor */}
          <div className="space-y-2">
            <Label htmlFor="vendedor">Vendedor *</Label>
            <Select value={vendedorId} onValueChange={setVendedorId}>
              <SelectTrigger id="vendedor">
                <SelectValue placeholder="Selecione o vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          {/* Comissão */}
          <div className="space-y-2">
            <Label htmlFor="comissao">Comissão (%) *</Label>
            <Input
              id="comissao"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={comissaoPercent * 100}
              onChange={(e) => setComissaoPercent(parseFloat(e.target.value) / 100)}
              required
            />
          </div>

          {/* Itens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Produtos *</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {itens.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={item.produto_id}
                      onValueChange={(value) => handleItemChange(index, "produto_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qtd"
                      value={item.qtd_atribuida || ""}
                      onChange={(e) =>
                        handleItemChange(index, "qtd_atribuida", parseInt(e.target.value) || 0)
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full vendr-btn-primary" disabled={loading}>
            {loading ? "Criando..." : "Criar Kit"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
