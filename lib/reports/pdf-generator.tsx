/**
 * Gerador de Relatórios em PDF
 */
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #FF6B35',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTop: '1 solid #ddd',
    paddingTop: 10,
  },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

interface SalesReportData {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
    topProduct: string;
  };
  sales: Array<{
    date: string;
    seller: string;
    product: string;
    quantity: number;
    value: number;
  }>;
  companyName: string;
}

export function SalesReportPDF({ data }: { data: SalesReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Vendas</Text>
          <Text style={styles.subtitle}>{data.companyName}</Text>
          <Text style={styles.subtitle}>
            Período: {format(data.period.start, 'dd/MM/yyyy', { locale: ptBR })} até{' '}
            {format(data.period.end, 'dd/MM/yyyy', { locale: ptBR })}
          </Text>
        </View>

        {/* Resumo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Período</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de Vendas:</Text>
              <Text style={styles.summaryValue}>{data.summary.totalSales}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Receita Total:</Text>
              <Text style={styles.summaryValue}>
                R$ {data.summary.totalRevenue.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ticket Médio:</Text>
              <Text style={styles.summaryValue}>
                R$ {data.summary.averageTicket.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Produto Mais Vendido:</Text>
              <Text style={styles.summaryValue}>{data.summary.topProduct}</Text>
            </View>
          </View>
        </View>

        {/* Tabela de Vendas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhamento de Vendas</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '15%' }]}>Data</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>Vendedor</Text>
              <Text style={[styles.tableCell, { width: '30%' }]}>Produto</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>Qtd</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>Valor</Text>
            </View>

            {/* Rows */}
            {data.sales.map((sale, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '15%' }]}>{sale.date}</Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>{sale.seller}</Text>
                <Text style={[styles.tableCell, { width: '30%' }]}>{sale.product}</Text>
                <Text style={[styles.tableCell, { width: '15%' }]}>{sale.quantity}</Text>
                <Text style={[styles.tableCell, { width: '15%' }]}>
                  R$ {sale.value.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
          <Text>Venlo - Sistema de Gestão de Vendas</Text>
        </View>
      </Page>
    </Document>
  );
}

interface StockReportData {
  products: Array<{
    name: string;
    sku: string;
    quantity: number;
    minStock: number;
    status: 'ok' | 'low' | 'out';
  }>;
  summary: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
  };
  companyName: string;
}

export function StockReportPDF({ data }: { data: StockReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Estoque</Text>
          <Text style={styles.subtitle}>{data.companyName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total de Produtos:</Text>
              <Text style={styles.summaryValue}>{data.summary.totalProducts}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estoque Baixo:</Text>
              <Text style={[styles.summaryValue, { color: '#ff9800' }]}>
                {data.summary.lowStock}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sem Estoque:</Text>
              <Text style={[styles.summaryValue, { color: '#f44336' }]}>
                {data.summary.outOfStock}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '40%' }]}>Produto</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>SKU</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>Quantidade</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>Status</Text>
            </View>

            {data.products.map((product, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '40%' }]}>{product.name}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{product.sku}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{product.quantity}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: '20%' },
                    product.status === 'low' && { color: '#ff9800' },
                    product.status === 'out' && { color: '#f44336' },
                  ]}
                >
                  {product.status === 'ok' && '✓ OK'}
                  {product.status === 'low' && '⚠ Baixo'}
                  {product.status === 'out' && '✗ Esgotado'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
