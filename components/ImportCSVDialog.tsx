/**
 * ImportCSVDialog - Modal para importar produtos via CSV
 */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase-browser";
import { Loader2, Download, Upload } from "lucide-react";

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportCSVDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportCSVDialogProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const downloadTemplate = () => {
    const headers = ["nome", "marca", "preco", "quantidade", "ativo"];
    const example = ["Coca Cola 2L", "Coca-Cola", "10.50", "100", "true"];
    
    const csv = [headers, example].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_importacao_produtos.csv";
    a.click();
    
    toast({
      title: "Modelo baixado!",
      description: "Use este arquivo como referência para importar seus produtos",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo CSV",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length >= 4) {
        const product = {
          nome: values[0]?.trim(),
          marca: values[1]?.trim() || null,
          preco: parseFloat(values[2]?.trim() || "0"),
          quantidade: parseInt(values[3]?.trim() || "0"),
          ativo: values[4]?.trim().toLowerCase() !== "false",
        };
        
        if (product.nome && product.preco > 0) {
          products.push(product);
        }
      }
    }
    
    return products;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Selecione um arquivo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Ler arquivo
      const text = await file.text();
      const products = parseCSV(text);

      if (products.length === 0) {
        throw new Error("Nenhum produto válido encontrado no arquivo");
      }

      // Buscar empresa_id do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) throw new Error("Perfil não encontrado");

      // Inserir produtos
      const produtosParaInserir = products.map(p => ({
        empresa_id: perfil.empresa_id,
        nome: p.nome,
        marca: p.marca,
        preco: p.preco,
        estoque_atual: p.quantidade,
        ativo: p.ativo,
        unidade: "un",
      }));

      const { error } = await supabase
        .from("produtos")
        .insert(produtosParaInserir);

      if (error) throw error;

      toast({
        title: "Importação concluída!",
        description: `${products.length} produto(s) importado(s) com sucesso`,
      });

      onSuccess();
      onOpenChange(false);
      setFile(null);
    } catch (error: any) {
      console.error("Erro ao importar CSV:", error);
      toast({
        title: "Erro ao importar",
        description: error.message || "Verifique o formato do arquivo",
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
          <DialogTitle>Importar Produtos via CSV</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV com seus produtos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Botão para baixar modelo */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Modelo de Importação</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Baixe o modelo CSV para ver o formato correto
            </p>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="gap-2 w-full"
            >
              <Download className="h-4 w-4" />
              Baixar Modelo CSV
            </Button>
          </div>

          {/* Upload de arquivo */}
          <div className="space-y-2">
            <label
              htmlFor="csv-file"
              className="block text-sm font-medium"
            >
              Selecione o arquivo CSV
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>

          {/* Instruções */}
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
            <h4 className="font-medium mb-2 text-sm">Formato do CSV:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>nome</strong>: Nome do produto (obrigatório)</li>
              <li>• <strong>marca</strong>: Marca do produto (opcional)</li>
              <li>• <strong>preco</strong>: Preço unitário (obrigatório)</li>
              <li>• <strong>quantidade</strong>: Estoque inicial (obrigatório)</li>
              <li>• <strong>ativo</strong>: true ou false (padrão: true)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFile(null);
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={loading || !file}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
