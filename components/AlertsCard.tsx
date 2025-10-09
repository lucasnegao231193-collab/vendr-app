/**
 * Alerts Card Component
 * Mostra alertas importantes (estoque baixo, vendedor inativo, etc)
 */
"use client";

import { AlertCircle, AlertTriangle, Package, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  description: string;
  icon: any;
}

interface AlertsCardProps {
  alerts: Alert[];
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50 dark:bg-red-900/20";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "border-blue-200 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertCircle className="h-5 w-5" />
          Alertas ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                <alert.icon className={`h-5 w-5 mt-0.5 ${getIconColor(alert.type)}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {alert.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper para gerar alertas automaticamente
export function generateAlerts(
  produtos: any[],
  vendedores: any[]
): Alert[] {
  const alerts: Alert[] = [];

  // Produtos com estoque baixo
  const produtosBaixoEstoque = produtos.filter(
    (p) => p.estoque_atual < 10 && p.ativo
  );
  if (produtosBaixoEstoque.length > 0) {
    alerts.push({
      id: "estoque-baixo",
      type: "warning",
      title: "Estoque Baixo",
      description: `${produtosBaixoEstoque.length} produto(s) com estoque menor que 10 unidades`,
      icon: Package,
    });
  }

  // Vendedores inativos
  const vendedoresInativos = vendedores.filter((v) => !v.ativo);
  if (vendedoresInativos.length > 0) {
    alerts.push({
      id: "vendedores-inativos",
      type: "info",
      title: "Vendedores Inativos",
      description: `${vendedoresInativos.length} vendedor(es) está(ão) inativo(s)`,
      icon: UserX,
    });
  }

  // Produtos sem estoque
  const produtosSemEstoque = produtos.filter(
    (p) => p.estoque_atual === 0 && p.ativo
  );
  if (produtosSemEstoque.length > 0) {
    alerts.push({
      id: "sem-estoque",
      type: "error",
      title: "Produtos Esgotados",
      description: `${produtosSemEstoque.length} produto(s) sem estoque`,
      icon: AlertTriangle,
    });
  }

  return alerts;
}
