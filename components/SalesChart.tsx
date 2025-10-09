/**
 * Sales Chart Component
 * Gráfico de barras mostrando vendas por vendedor
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

interface SalesChartProps {
  data: Array<{
    vendedor: string;
    total: number;
    vendas: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold">{payload[0].payload.vendedor}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vendas: {payload[0].payload.vendas}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="vendr-card-gradient">
        <CardHeader>
          <CardTitle>Vendas por Vendedor (Hoje)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="vendedor" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#0057FF" 
                radius={[8, 8, 0, 0]}
                name="Total Vendido"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
