/**
 * Landing Page - Venlo
 * Página de conversão otimizada para vendas
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Smartphone,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Star,
  Package,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const handleCTA = () => {
    window.location.href = "/onboarding";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Nav */}
      <header className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-6">
            <a href="#beneficios" className="text-gray-600 hover:text-[#FF6B35] transition">Benefícios</a>
            <a href="#funcionalidades" className="text-gray-600 hover:text-[#FF6B35] transition">Funcionalidades</a>
            <a href="#planos" className="text-gray-600 hover:text-[#FF6B35] transition">Planos</a>
            <a href="#depoimentos" className="text-gray-600 hover:text-[#FF6B35] transition">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Button onClick={handleCTA} className="bg-[#FF6B35] hover:bg-[#E55A25]">
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#FFF5F0] to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-[#FF6B35]/10 rounded-full">
                <span className="text-[#FF6B35] font-semibold text-sm">
                  🚀 Mais de 1.000 empresas já confiam
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Gerencie suas vendas externas com{" "}
                <span className="text-[#FF6B35]">inteligência</span>
              </h1>
              
              <p className="text-xl text-gray-600">
                O sistema completo para empresas com vendedores ambulantes. 
                Controle estoque, vendas, comissões e muito mais em tempo real.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleCTA}
                  className="bg-[#FF6B35] hover:bg-[#E55A25] text-lg px-8 py-6"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  Ver Demonstração
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">14 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Cancele quando quiser</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#FF6B35] to-[#F7931E] rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Vendas Hoje</span>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900">R$ 12.450</div>
                  <div className="text-sm text-green-600">+23% vs ontem</div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Nova Venda</div>
                    <div className="text-xs text-gray-500">João - R$ 450</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">5 Vendedores</div>
                    <div className="text-xs text-gray-500">Ativos agora</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 mb-8">Empresas que confiam no Venlo</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <div className="text-2xl font-bold text-gray-400">EMPRESA A</div>
            <div className="text-2xl font-bold text-gray-400">EMPRESA B</div>
            <div className="text-2xl font-bold text-gray-400">EMPRESA C</div>
            <div className="text-2xl font-bold text-gray-400">EMPRESA D</div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o Venlo?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar suas vendas externas em um só lugar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-[#FF6B35] transition">
              <CardContent className="p-8">
                <div className="bg-[#FF6B35]/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone className="h-8 w-8 text-[#FF6B35]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">100% Mobile</h3>
                <p className="text-gray-600">
                  Seus vendedores registram vendas direto do celular, mesmo offline. 
                  Sincronização automática quando conectar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35] transition">
              <CardContent className="p-8">
                <div className="bg-[#FF6B35]/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-[#FF6B35]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Tempo Real</h3>
                <p className="text-gray-600">
                  Acompanhe todas as vendas em tempo real. Saiba exatamente o que está 
                  acontecendo no campo, agora.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35] transition">
              <CardContent className="p-8">
                <div className="bg-[#FF6B35]/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 text-[#FF6B35]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Relatórios Inteligentes</h3>
                <p className="text-gray-600">
                  Dashboards completos, gráficos interativos e exportação em PDF. 
                  Tome decisões baseadas em dados.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35] transition">
              <CardContent className="p-8">
                <div className="bg-[#FF6B35]/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Package className="h-8 w-8 text-[#FF6B35]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Controle de Estoque</h3>
                <p className="text-gray-600">
                  Gerencie o estoque central e de cada vendedor. Transferências, 
                  devoluções e alertas automáticos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35] transition">
              <CardContent className="p-8">
                <div className="bg-[#FF6B35]/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <DollarSign className="h-8 w-8 text-[#FF6B35]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Gestão Financeira</h3>
                <p className="text-gray-600">
                  Controle de comissões, metas, caixa e muito mais. Tudo automatizado 
                  para você focar no crescimento.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#FF6B35] transition">
              <CardContent className="p-8">
                <div className="bg-[#FF6B35]/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-[#FF6B35]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Seguro e Confiável</h3>
                <p className="text-gray-600">
                  Seus dados protegidos com criptografia de ponta. Backup automático 
                  e 99.9% de uptime garantido.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa em um só sistema
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Dashboard em tempo real",
              "Gestão de vendedores",
              "Controle de estoque",
              "Transferências de produtos",
              "Registro de vendas mobile",
              "Metas e comissões",
              "Relatórios avançados",
              "Exportação PDF",
              "Notificações push",
              "Modo offline",
              "Múltiplos usuários",
              "Suporte prioritário"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                <Check className="h-6 w-6 text-[#FF6B35] flex-shrink-0" />
                <span className="font-medium text-gray-900">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 1.000 empresas já transformaram suas vendas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                role: "Diretor Comercial",
                company: "Distribuidora ABC",
                text: "Aumentamos 40% nas vendas em 3 meses. O controle em tempo real mudou completamente nossa operação.",
                rating: 5
              },
              {
                name: "Maria Santos",
                role: "CEO",
                company: "Vendas Express",
                text: "Finalmente conseguimos ter visibilidade total do que acontece no campo. Recomendo muito!",
                rating: 5
              },
              {
                name: "João Oliveira",
                role: "Gerente de Vendas",
                company: "Comercial XYZ",
                text: "Sistema intuitivo e completo. Nossa equipe adaptou rapidamente e os resultados apareceram logo.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-[#FF6B35]">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos para Todos os Tamanhos
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para sua empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="text-4xl font-bold text-[#FF6B35] mb-6">
                  R$ 99<span className="text-lg text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Até 5 vendedores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Vendas ilimitadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={handleCTA}>
                  Começar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-4 border-[#FF6B35] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF6B35] text-white px-4 py-1 rounded-full text-sm font-semibold">
                Mais Popular
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold text-[#FF6B35] mb-6">
                  R$ 249<span className="text-lg text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Até 20 vendedores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Tudo do Starter +</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>API de integração</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Button className="w-full bg-[#FF6B35] hover:bg-[#E55A25]" onClick={handleCTA}>
                  Começar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-[#FF6B35] mb-6">
                  R$ 599<span className="text-lg text-gray-500">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Vendedores ilimitados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Tudo do Pro +</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Customizações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Gerente dedicado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>SLA garantido</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={handleCTA}>
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-[#FF6B35] to-[#F7931E] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar suas vendas?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a mais de 1.000 empresas que já aumentaram suas vendas com o Venlo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleCTA}
              className="bg-white text-[#FF6B35] hover:bg-gray-100 text-lg px-8 py-6"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Agendar Demonstração
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-75">
            ✓ Sem cartão de crédito  •  ✓ 14 dias grátis  •  ✓ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" />
              <p className="mt-4 text-gray-400">
                O sistema completo para gestão de vendas externas
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white">Planos</a></li>
                <li><a href="#" className="hover:text-white">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Venlo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
