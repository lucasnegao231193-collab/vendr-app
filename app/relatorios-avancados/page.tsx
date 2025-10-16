/**
 * Página de Relatórios Avançados
 * Com gráficos, filtros customizáveis e exportação PDF
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, BarChart3, TrendingUp, Package } from "lucide-react";
import { SalesChart, ProductChart, PerformanceChart } from "@/components/charts/SalesChart";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/ui/use-toast";
import { pdf } from '@react-pdf/renderer';
import { SalesReportPDF, StockReportPDF } from '@/lib/reports/pdf-generator';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function RelatoriosAvancadosPage() {
  const [period, setPeriod] = useState('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<any>(null);
  const [stockData, setStockData] = useState<any>(null);
  
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    updateDateRange(period);
  }, [period]);

  const updateDateRange = (selectedPeriod: string) => {
    const today = new Date();
    let start, end;

    switch (selectedPeriod) {
      case '7days':
        start = subDays(today, 7);
        end = today;
        break;
      case '30days':
        start = subDays(today, 30);
        end = today;
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'custom':
        return;
      default:
        start = subDays(today, 30);
        end = today;
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const loadSalesData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) return;

      // Buscar vendas do período
      const { data: vendas, error } = await supabase
        .from('vendas')
        .select(`
          *,
          vendedor:vendedores(nome),
          itens:vendas_itens(
            quantidade,
            preco_unitario,
            produto:produtos(nome)
          )
        `)
        .eq('empresa_id', perfil.empresa_id)
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Processar dados para gráficos
      const dailySales = processDailySales(vendas || []);
      const topProducts = processTopProducts(vendas || []);
      const sellerPerformance = processSellerPerformance(vendas || []);

      setSalesData({
        daily: dailySales,
        products: topProducts,
        sellers: sellerPerformance,
        raw: vendas,
      });

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStockData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) return;

      const { data: produtos, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('empresa_id', perfil.empresa_id);

      if (error) throw error;

      setStockData(produtos);

    } catch (error: any) {
      toast({
        title: "Erro ao carregar estoque",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const processDailySales = (vendas: any[]) => {
    const salesByDate: { [key: string]: number } = {};
    
    vendas.forEach(venda => {
      const date = format(new Date(venda.created_at), 'dd/MM');
      salesByDate[date] = (salesByDate[date] || 0) + venda.valor_total;
    });

    return {
      labels: Object.keys(salesByDate),
      values: Object.values(salesByDate),
    };
  };

  const processTopProducts = (vendas: any[]) => {
    const productSales: { [key: string]: number } = {};
    
    vendas.forEach(venda => {
      venda.itens?.forEach((item: any) => {
        const productName = item.produto?.nome || 'Desconhecido';
        productSales[productName] = (productSales[productName] || 0) + item.quantidade;
      });
    });

    const sorted = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      labels: sorted.map(([name]) => name),
      values: sorted.map(([, qty]) => qty),
    };
  };

  const processSellerPerformance = (vendas: any[]) => {
    const sellerSales: { [key: string]: number[] } = {};
    
    vendas.forEach(venda => {
      const sellerName = venda.vendedor?.nome || 'Desconhecido';
      if (!sellerSales[sellerName]) {
        sellerSales[sellerName] = [];
      }
      sellerSales[sellerName].push(venda.valor_total);
    });

    return Object.entries(sellerSales).map(([name, sales]) => ({
      label: name,
      data: sales,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    }));
  };

  const exportSalesPDF = async () => {
    if (!salesData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id, empresas(nome)')
        .eq('user_id', user!.id)
        .single();

      const reportData = {
        period: {
          start: new Date(startDate),
          end: new Date(endDate),
        },
        summary: {
          totalSales: salesData.raw.length,
          totalRevenue: salesData.raw.reduce((sum: number, v: any) => sum + v.valor_total, 0),
          averageTicket: salesData.raw.reduce((sum: number, v: any) => sum + v.valor_total, 0) / salesData.raw.length,
          topProduct: salesData.products.labels[0] || 'N/A',
        },
        sales: salesData.raw.map((v: any) => ({
          date: format(new Date(v.created_at), 'dd/MM/yyyy'),
          seller: v.vendedor?.nome || 'N/A',
          product: v.itens?.[0]?.produto?.nome || 'N/A',
          quantity: v.itens?.[0]?.quantidade || 0,
          value: v.valor_total,
        })),
        companyName: (perfil as any)?.empresas?.nome || 'Empresa',
      };

      const blob = await pdf(<SalesReportPDF data={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-vendas-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      link.click();

      toast({
        title: "PDF gerado!",
        description: "O relatório foi baixado com sucesso",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportStockPDF = async () => {
    if (!stockData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id, empresas(nome)')
        .eq('user_id', user!.id)
        .single();

      const reportData = {
        products: stockData.map((p: any) => ({
          name: p.nome,
          sku: p.sku || 'N/A',
          quantity: p.quantidade,
          minStock: p.estoque_minimo || 0,
          status: p.quantidade === 0 ? 'out' : p.quantidade <= (p.estoque_minimo || 5) ? 'low' : 'ok',
        })),
        summary: {
          totalProducts: stockData.length,
          lowStock: stockData.filter((p: any) => p.quantidade > 0 && p.quantidade <= (p.estoque_minimo || 5)).length,
          outOfStock: stockData.filter((p: any) => p.quantidade === 0).length,
        },
        companyName: (perfil as any)?.empresas?.nome || 'Empresa',
      };

      const blob = await pdf(<StockReportPDF data={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-estoque-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      link.click();

      toast({
        title: "PDF gerado!",
        description: "O relatório foi baixado com sucesso",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
          <p className="text-muted-foreground">Análises detalhadas com gráficos e exportação</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione o período para análise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={period !== 'custom'}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={period !== 'custom'}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={loadSalesData} disabled={loading} className="w-full">
                {loading ? 'Carregando...' : 'Gerar Relatório'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Relatórios */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">
            <TrendingUp className="h-4 w-4 mr-2" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="products">
            <BarChart3 className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="stock">
            <Package className="h-4 w-4 mr-2" />
            Estoque
          </TabsTrigger>
        </TabsList>

        {/* Tab Vendas */}
        <TabsContent value="sales" className="space-y-4">
          {salesData && (
            <>
              <div className="flex justify-end">
                <Button onClick={exportSalesPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas Diárias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SalesChart data={salesData.daily} type="line" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Produtos Mais Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductChart data={salesData.products} />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab Produtos */}
        <TabsContent value="products" className="space-y-4">
          {salesData && (
            <Card>
              <CardHeader>
                <CardTitle>Análise de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductChart data={salesData.products} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Estoque */}
        <TabsContent value="stock" className="space-y-4">
          <div className="flex justify-between">
            <Button onClick={loadStockData} variant="outline">
              Carregar Estoque
            </Button>
            {stockData && (
              <Button onClick={exportStockPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            )}
          </div>

          {stockData && (
            <Card>
              <CardHeader>
                <CardTitle>Status do Estoque</CardTitle>
                <CardDescription>
                  {stockData.length} produtos cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stockData.slice(0, 10).map((product: any) => (
                    <div key={product.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{product.nome}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{product.quantidade} un</p>
                        <p className={`text-sm ${
                          product.quantidade === 0 ? 'text-red-500' :
                          product.quantidade <= (product.estoque_minimo || 5) ? 'text-orange-500' :
                          'text-green-500'
                        }`}>
                          {product.quantidade === 0 ? 'Esgotado' :
                           product.quantidade <= (product.estoque_minimo || 5) ? 'Estoque Baixo' :
                           'OK'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
