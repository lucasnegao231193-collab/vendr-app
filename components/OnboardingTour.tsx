/**
 * Tutorial Interativo da Plataforma
 * Guia o usuário pelas principais funcionalidades
 */
"use client";

import { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS, ACTIONS } from "react-joyride";
import { createClient } from "@/lib/supabase-browser";

interface OnboardingTourProps {
  role: "owner" | "seller" | "solo";
}

export function OnboardingTour({ role }: OnboardingTourProps) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    checkIfShouldShowTour();
  }, []);

  const checkIfShouldShowTour = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar se o usuário já viu o tour
      const tourKey = `onboarding_tour_${role}_completed`;
      const hasSeenTour = localStorage.getItem(tourKey);

      if (!hasSeenTour) {
        // Aguardar 1 segundo para a página carregar completamente
        setTimeout(() => setRun(true), 1000);
      }
    } catch (error) {
      console.error("Erro ao verificar tour:", error);
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      // Marcar como concluído
      const tourKey = `onboarding_tour_${role}_completed`;
      localStorage.setItem(tourKey, "true");
      setRun(false);
    }

    if (type === "step:after" && action === ACTIONS.NEXT) {
      setStepIndex(index + 1);
    } else if (type === "step:after" && action === ACTIONS.PREV) {
      setStepIndex(index - 1);
    }
  };

  // Steps diferentes para cada tipo de usuário
  const getSteps = (): Step[] => {
    if (role === "owner") {
      return [
        {
          target: "body",
          content: (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-trust-blue-900">
                Bem-vindo ao Venlo! 🎉
              </h2>
              <p>
                Vamos fazer um tour rápido pelas principais funcionalidades da plataforma.
                Você pode pular a qualquer momento!
              </p>
            </div>
          ),
          placement: "center",
          disableBeacon: true,
        },
        {
          target: '[href="/dashboard"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">📊 Dashboard</h3>
              <p>Acompanhe suas métricas em tempo real: vendas, ticket médio e desempenho.</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: '[href="/estoque"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">📦 Estoque</h3>
              <p>Gerencie seus produtos, preços e quantidades disponíveis.</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: '[href="/vendedores"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">👥 Vendedores</h3>
              <p>Adicione e gerencie sua equipe de vendedores.</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: '[href="/transferencias"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">🔄 Transferências</h3>
              <p>Envie produtos do seu estoque para os vendedores.</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: '[href="/devolucoes"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">↩️ Devoluções</h3>
              <p>Aceite ou recuse devoluções de produtos dos vendedores.</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: ".venlo-chat-button",
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">💬 Suporte</h3>
              <p>Precisa de ajuda? Clique aqui para falar com nosso chatbot inteligente!</p>
            </div>
          ),
          placement: "left",
        },
        {
          target: "body",
          content: (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-trust-blue-900">
                Pronto para começar! 🚀
              </h2>
              <p>
                Agora você conhece as principais funcionalidades. Explore a plataforma e
                aproveite ao máximo!
              </p>
              <p className="text-sm text-gray-600">
                Dica: Você pode refazer este tour a qualquer momento nas configurações.
              </p>
            </div>
          ),
          placement: "center",
        },
      ];
    }

    if (role === "seller") {
      return [
        {
          target: "body",
          content: (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-trust-blue-900">
                Bem-vindo, Vendedor! 🎉
              </h2>
              <p>
                Vamos conhecer as ferramentas que vão te ajudar a vender mais!
              </p>
            </div>
          ),
          placement: "center",
          disableBeacon: true,
        },
        {
          target: '[href="/vendedor"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">📊 Dashboard</h3>
              <p>Veja suas vendas do dia e acompanhe seu desempenho.</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: '[href="/vendedor/estoque"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">📦 Meu Estoque</h3>
              <p>Consulte os produtos disponíveis para venda.</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: '[href="/vendedor/venda"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">🛒 Nova Venda</h3>
              <p>Registre suas vendas de forma rápida e fácil!</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: '[href="/vendedor/metas"]',
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">🎯 Minhas Metas</h3>
              <p>Configure suas metas e acompanhe seu progresso diário e mensal.</p>
            </div>
          ),
          placement: "right",
        },
        {
          target: ".venlo-chat-button",
          content: (
            <div className="space-y-2">
              <h3 className="font-bold">💬 Suporte</h3>
              <p>Dúvidas? Nosso chatbot está aqui para ajudar!</p>
            </div>
          ),
          placement: "left",
        },
        {
          target: "body",
          content: (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-trust-blue-900">
                Boas vendas! 💪
              </h2>
              <p>
                Agora você está pronto para começar a vender. Boa sorte!
              </p>
            </div>
          ),
          placement: "center",
        },
      ];
    }

    // Solo mode
    return [
      {
        target: "body",
        content: (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-trust-blue-900">
              Bem-vindo ao Venlo Solo! 🎉
            </h2>
            <p>
              Vamos conhecer as ferramentas para gerenciar seu negócio!
            </p>
          </div>
        ),
        placement: "center",
        disableBeacon: true,
      },
      {
        target: '[href="/solo"]',
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">📊 Dashboard</h3>
            <p>Acompanhe suas vendas e desempenho.</p>
          </div>
        ),
        placement: "right",
      },
      {
        target: '[href="/solo/estoque"]',
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">📦 Estoque</h3>
            <p>Gerencie seus produtos e quantidades.</p>
          </div>
        ),
        placement: "right",
      },
      {
        target: '[href="/solo/venda-nova"]',
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">🛒 Nova Venda</h3>
            <p>Registre suas vendas rapidamente!</p>
          </div>
        ),
        placement: "right",
      },
      {
        target: ".venlo-chat-button",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">💬 Suporte</h3>
            <p>Precisa de ajuda? Estamos aqui!</p>
          </div>
        ),
        placement: "left",
      },
      {
        target: "body",
        content: (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-trust-blue-900">
              Pronto para vender! 🚀
            </h2>
            <p>
              Explore a plataforma e aproveite todas as funcionalidades!
            </p>
          </div>
        ),
        placement: "center",
      },
    ];
  };

  return (
    <Joyride
      steps={getSteps()}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#FF6B35",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "12px",
          padding: "20px",
        },
        buttonNext: {
          backgroundColor: "#FF6B35",
          borderRadius: "8px",
          padding: "8px 16px",
        },
        buttonBack: {
          color: "#666",
          marginRight: "10px",
        },
        buttonSkip: {
          color: "#999",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  );
}
