/**
 * Página de Assinatura - Upgrade para Solo Pro
 * Comparação de planos e CTA de upgrade
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ModernTopBar } from "@/components/ModernTopBar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Check, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { PLANOS_SOLO } from "@/types/solo";

export default function SoloAssinaturaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [processando, setProcessando] = useState(false);

  const handleUpgrade = async () => {
    setProcessando(true);

    try {
      const response = await fetch('/api/solo/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: 'solo_pro' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer upgrade');
      }

      toast({
        title: "🎉 Upgrade realizado!",
        description: "Você agora tem acesso ao Solo Pro",
      });

      // Redirecionar para dashboard
      setTimeout(() => {
        router.push('/solo');
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Erro ao fazer upgrade",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <ModernTopBar userName="Autônomo" />
      
      <div className="pt-20 px-4 md:px-6 pb-24 space-y-8">
        <Breadcrumbs />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#121212] mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-gray-600">
            Libere todo o potencial do Vendr Solo para o seu negócio
          </p>
        </motion.div>

        {/* Comparação de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Solo Free */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">
                    {PLANOS_SOLO.solo_free.nome}
                  </CardTitle>
                  <Badge variant="outline">Atual</Badge>
                </div>
                <div className="text-4xl font-bold text-[#0057FF]">
                  Grátis
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Para quem está começando
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {PLANOS_SOLO.solo_free.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Solo Pro */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-2 border-[#0057FF] bg-gradient-to-br from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Crown className="h-6 w-6 text-[#FF6B00]" />
                    {PLANOS_SOLO.solo_pro.nome}
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Recomendado
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#0057FF]">
                    R$ {PLANOS_SOLO.solo_pro.preco.toFixed(2)}
                  </span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Para negócios em crescimento
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {PLANOS_SOLO.solo_pro.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-[#0057FF] mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleUpgrade}
                  disabled={processando}
                  className="w-full bg-gradient-to-r from-[#0057FF] to-[#FF6B00] hover:opacity-90 text-white text-lg py-6"
                  size="lg"
                >
                  {processando ? (
                    "Processando..."
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Fazer Upgrade Agora
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  🔒 Pagamento seguro • Cancele quando quiser
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Benefícios Extras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-[#0057FF] to-[#FF6B00] text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Por que fazer upgrade?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚀</div>
                  <h4 className="font-semibold mb-2">Crescimento Ilimitado</h4>
                  <p className="text-sm opacity-90">
                    Sem limites de vendas mensais
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <h4 className="font-semibold mb-2">Insights Profissionais</h4>
                  <p className="text-sm opacity-90">
                    Relatórios e gráficos avançados
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">💎</div>
                  <h4 className="font-semibold mb-2">Suporte Prioritário</h4>
                  <p className="text-sm opacity-90">
                    Atendimento rápido e dedicado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center mb-6">
            Perguntas Frequentes
          </h3>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">
                  Posso cancelar a qualquer momento?
                </h4>
                <p className="text-sm text-gray-600">
                  Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">
                  Como funciona o pagamento?
                </h4>
                <p className="text-sm text-gray-600">
                  Atualmente estamos em fase de testes. O upgrade será simulado e você terá acesso completo ao Solo Pro.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">
                  Meus dados são mantidos?
                </h4>
                <p className="text-sm text-gray-600">
                  Sim! Todos os seus produtos, vendas e histórico são mantidos ao fazer upgrade.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
