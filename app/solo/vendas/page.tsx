/**
 * Listagem de Vendas - Modo Solo
 * Histórico de vendas com filtros
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExportButtons } from "@/components/ExportButtons";
import { formatCurrency } from "@/lib/utils";
import { Filter, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { TableSkeleton } from "@/components/LoadingSkeleton";

interface Venda {
  id: string;
  data_hora: string;
  qtd: number;
  valor_unit: number;
  meio_pagamento: string;
  produtos: {
    nome: string;
    marca?: string;
  };
}

export default function SoloVendasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");

  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = async () => {
    try {
      let url = '/api/solo/vendas?';
      if (dataInicio) url += `data_inicio=${dataInicio}&`;
      if (dataFim) url += `data_fim=${dataFim}&`;
      if (filtroMetodo) url += `metodo_pagamento=${filtroMetodo}`;

      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setVendas(data.vendas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setLoading(true);
    loadVendas();
  };

  const limparFiltros = () => {
    setDataInicio("");
    setDataFim("");
    setFiltroMetodo("");
    setLoading(true);
    loadVendas();
  };

  const calcularTotal = () => {
    return vendas.reduce((sum, v) => sum + (v.qtd * v.valor_unit), 0);
  };

  const getMetodoBadgeColor = (metodo: string) => {
    switch (metodo) {
      case 'pix': return 'bg-green-100 text-green-800';
      case 'cartao': return 'bg-blue-100 text-blue-800';
      case 'dinheiro': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        <Breadcrumbs />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#121212]">Vendas</h1>
            <p className="text-gray-600">Histórico de vendas realizadas</p>
          </div>
          <Button
            onClick={() => router.push('/solo/venda-nova')}
            className="bg-[#0057FF] hover:bg-[#0046CC] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Venda
          </Button>
        </motion.div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Início</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Fim</label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Método</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={filtroMetodo}
                  onChange={(e) => setFiltroMetodo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={aplicarFiltros} className="flex-1">
                  Aplicar
                </Button>
                <Button onClick={limparFiltros} variant="outline">
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Total de Vendas</p>
              <p className="text-2xl font-bold">{vendas.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(calcularTotal())}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(vendas.length > 0 ? calcularTotal() / vendas.length : 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Vendas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Vendas</CardTitle>
            <ExportButtons
              data={vendas.map(v => ({
                data: new Date(v.data_hora).toLocaleDateString('pt-BR'),
                produto: v.produtos.nome,
                quantidade: v.qtd,
                valor_unitario: v.valor_unit,
                total: v.qtd * v.valor_unit,
                metodo: v.meio_pagamento,
              }))}
              filename="vendas-solo"
              title="Vendas - Vendr Solo"
              columns={[
                { header: 'Data', key: 'data' },
                { header: 'Produto', key: 'produto' },
                { header: 'Qtd', key: 'quantidade' },
                { header: 'Valor Unit.', key: 'valor_unitario' },
                { header: 'Total', key: 'total' },
                { header: 'Método', key: 'metodo' },
              ]}
            />
          </CardHeader>
          <CardContent>
            {vendas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Nenhuma venda encontrada</p>
                <Button onClick={() => router.push('/solo/venda-nova')}>
                  Registrar Primeira Venda
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vendas.map((venda, index) => (
                  <motion.div
                    key={venda.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{venda.produtos.nome}</h3>
                      {venda.produtos.marca && (
                        <p className="text-sm text-gray-500">{venda.produtos.marca}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(venda.data_hora).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {venda.qtd}x {formatCurrency(venda.valor_unit)}
                      </p>
                      <p className="text-lg font-bold text-[#0057FF]">
                        {formatCurrency(venda.qtd * venda.valor_unit)}
                      </p>
                      <Badge className={`mt-1 ${getMetodoBadgeColor(venda.meio_pagamento)}`}>
                        {venda.meio_pagamento.toUpperCase()}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
