/**
 * Quick Actions Component
 * Atalhos rápidos para ações comuns
 */
"use client";

import { Plus, UserPlus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: "+ Adicionar Produto",
      icon: Package,
      onClick: () => router.push("/produtos?action=create"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "+ Criar Vendedor",
      icon: UserPlus,
      onClick: () => router.push("/vendedores?action=create"),
      color: "bg-green-500 hover:bg-green-600",
    },
  ];

  return (
    <Card className="vendr-card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-1"
            >
              <Button
                onClick={action.onClick}
                className={`w-full ${action.color} text-white`}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
