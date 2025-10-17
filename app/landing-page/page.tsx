/**
 * Landing Page Profissional - Venlo
 * Design Trust Blue com Micro-interações
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Smartphone,
  Zap,
  Shield,
  Package,
  DollarSign,
  ArrowRight,
  Star,
  Play,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPagePro() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formStep, setFormStep] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const slides = [
    {
      title: "Dashboard Analytics",
      description: "Acompanhe todas as métricas em tempo real",
      image: "/dashboard-preview.png"
    },
    {
      title: "Gestão de Vendedores",
      description: "Controle completo da sua equipe",
      image: "/vendedores-preview.png"
    },
    {
      title: "Controle de Estoque",
      description: "Estoque central e individual sincronizado",
      image: "/estoque-preview.png"
    },
    {
      title: "Registro Mobile",
      description: "Vendas registradas direto do celular",
      image: "/mobile-preview.png"
    },
    {
      title: "Relatórios Financeiros",
      description: "Análises detalhadas e exportação em PDF",
      image: "/relatorios-preview.png"
    }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Diretor Comercial",
      company: "Distribuidora ABC",
      sector: "Distribuidoras",
      text: "Aumentamos 40% nas vendas em 3 meses. O controle em tempo real mudou completamente nossa operação.",
      rating: 5,
      avatar: "/avatars/carlos.jpg"
    },
    {
      name: "Maria Santos",
      role: "CEO",
      company: "Bebidas Express",
      sector: "Bebidas",
      text: "Finalmente conseguimos ter visibilidade total do que acontece no campo. Sistema indispensável!",
      rating: 5,
      avatar: "/avatars/maria.jpg"
    },
    {
      name: "João Oliveira",
      role: "Gerente de Vendas",
      company: "Alimentos Premium",
      sector: "Alimentos",
      text: "A equipe adaptou rapidamente e os resultados apareceram logo. Recomendo muito!",
      rating: 5,
      avatar: "/avatars/joao.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Fixo */}
      <header 
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo-vendr.png" 
                alt="Venlo Logo" 
                width={120} 
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#diferenciais" className="text-gray-600 hover:text-[#415A77] transition">
                Diferenciais
              </a>
              <a href="#funcionalidades" className="text-gray-600 hover:text-[#415A77] transition">
                Funcionalidades
              </a>
              <a href="#depoimentos" className="text-gray-600 hover:text-[#415A77] transition">
                Depoimentos
              </a>
              <a href="#planos" className="text-gray-600 hover:text-[#415A77] transition">
                Planos
              </a>
            </nav>

            {/* CTAs Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-[#415A77]">
                  Login
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button className="bg-[#FF6600] hover:bg-[#cc5200] text-white shadow-lg hover:shadow-xl transition-all">
                  Demo Gratuita
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 animate-in slide-in-from-top">
              <a href="#diferenciais" className="block text-gray-600 hover:text-[#415A77]">
                Diferenciais
              </a>
              <a href="#funcionalidades" className="block text-gray-600 hover:text-[#415A77]">
                Funcionalidades
              </a>
              <a href="#depoimentos" className="block text-gray-600 hover:text-[#415A77]">
                Depoimentos
              </a>
              <a href="#planos" className="block text-gray-600 hover:text-[#415A77]">
                Planos
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <Link href="/login">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/onboarding">
                  <Button className="w-full bg-[#FF6600] hover:bg-[#cc5200]">
                    Demo Gratuita
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE6D5] rounded-full border border-[#FF6600]">
                <Zap className="h-4 w-4 text-[#FF6600]" />
                <span className="text-sm font-medium text-[#0D1B2A]">
                  Mais de 500 empresas já confiam
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-[#0D1B2A] leading-tight">
                Revolucione Suas Vendas Externas com{" "}
                <span className="text-[#FF6600]">Controle Total</span> em Tempo Real
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Sistema completo de gestão para vendedores ambulantes. 
                Funciona 100% offline com sincronização automática.
              </p>

              {/* Badges de Confiança */}
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="px-4 py-2 text-sm border-[#10B981] text-[#10B981]">
                  <Check className="h-4 w-4 mr-2" />
                  99.9% Uptime
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm border-[#415A77] text-[#415A77]">
                  <Zap className="h-4 w-4 mr-2" />
                  Sincronização Automática
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm border-[#FF6600] text-[#FF6600]">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Preço Acessível
                </Badge>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/onboarding">
                  <Button 
                    size="lg" 
                    className="bg-[#FF6600] hover:bg-[#cc5200] text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl hover:scale-[0.98] transition-all"
                  >
                    Experimente Grátis por 14 Dias
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-[#415A77] text-[#415A77] hover:bg-[#415A77] hover:text-white transition-all"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#10B981]" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-[#10B981]" />
                  Cancele quando quiser
                </div>
              </div>
            </div>

            {/* Mockup */}
            <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-300">
              <div className="relative bg-gradient-to-br from-[#415A77] to-[#1B263B] rounded-2xl p-8 shadow-2xl">
                {/* Dashboard Preview */}
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vendas Hoje</span>
                    <TrendingUp className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div className="text-4xl font-bold text-[#0D1B2A]">R$ 12.450</div>
                  <div className="text-sm text-[#10B981]">+23% vs ontem</div>
                  
                  {/* Mini Chart */}
                  <div className="h-24 bg-gradient-to-r from-[#415A77]/10 to-[#FF6600]/10 rounded-lg"></div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="bg-[#10B981]/10 p-2 rounded-lg">
                    <Check className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0D1B2A]">Nova Venda</div>
                    <div className="text-xs text-gray-600">João - R$ 450</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-[#415A77]/10 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-[#415A77]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0D1B2A]">5 Vendedores</div>
                    <div className="text-xs text-gray-600">Ativos agora</div>
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
            <div className="text-2xl font-bold text-gray-600">DISTRIBUIDORA A</div>
            <div className="text-2xl font-bold text-gray-600">BEBIDAS B</div>
            <div className="text-2xl font-bold text-gray-600">ALIMENTOS C</div>
            <div className="text-2xl font-bold text-gray-600">COSMÉTICOS D</div>
          </div>
        </div>
      </section>

      {/* Diferenciais com Micro-interações */}
      <section id="diferenciais" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0D1B2A] mb-4">
              Por que escolher o Venlo?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar suas vendas externas em um só lugar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Funciona 100% Offline",
                description: "Seus vendedores registram vendas direto do celular, mesmo sem internet. Sincronização automática quando conectar.",
                color: "#415A77"
              },
              {
                icon: Zap,
                title: "Dashboard em Tempo Real",
                description: "Acompanhe todas as vendas em tempo real. Saiba exatamente o que está acontecendo no campo, agora.",
                color: "#FF6600"
              },
              {
                icon: BarChart3,
                title: "Relatórios Inteligentes",
                description: "Dashboards completos, gráficos interativos e exportação em PDF. Tome decisões baseadas em dados.",
                color: "#1B263B"
              },
              {
                icon: Package,
                title: "Controle de Estoque",
                description: "Gerencie o estoque central e de cada vendedor. Transferências, devoluções e alertas automáticos.",
                color: "#10B981"
              },
              {
                icon: DollarSign,
                title: "Gestão Financeira",
                description: "Controle de comissões, metas, caixa e muito mais. Tudo automatizado para você focar no crescimento.",
                color: "#FF6600"
              },
              {
                icon: Shield,
                title: "Seguro e Confiável",
                description: "Seus dados protegidos com criptografia de ponta. Backup automático e 99.9% de uptime garantido.",
                color: "#EF4444"
              }
            ].map((item, index) => (
              <Card 
                key={index}
                className="group border-2 border-gray-200 hover:border-[#415A77] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
              >
                <CardContent className="p-8">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <item.icon className="h-8 w-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#0D1B2A]">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Carrossel de Funcionalidades */}
      <section id="funcionalidades" className="py-20 bg-gray-50 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0D1B2A] mb-4">
              Funcionalidades Completas
            </h2>
            <p className="text-xl text-gray-600">
              Explore tudo que o Venlo pode fazer pelo seu negócio
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Carrossel */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <Badge className="bg-[#FF6600] text-white">
                    {currentSlide + 1} de {slides.length}
                  </Badge>
                  <h3 className="text-3xl font-bold text-[#0D1B2A]">
                    {slides[currentSlide].title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {slides[currentSlide].description}
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                      className="border-[#415A77] text-[#415A77] hover:bg-[#415A77] hover:text-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                      className="border-[#415A77] text-[#415A77] hover:bg-[#415A77] hover:text-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#415A77]/10 to-[#FF6600]/10 rounded-xl h-80 flex items-center justify-center">
                  <span className="text-gray-600">Preview: {slides[currentSlide].title}</span>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-[#FF6600] w-8' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0D1B2A] mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 500 empresas já transformaram suas vendas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:shadow-xl transition-all bg-white">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#FF8C00] text-[#FF8C00]" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-gray-600 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#415A77] to-[#1B263B] rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[#0D1B2A]">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-[#FF6600]">{testimonial.company}</div>
                    </div>
                  </div>

                  {/* Sector Badge */}
                  <Badge className="mt-4 bg-gray-50 text-[#415A77] border border-gray-200">
                    {testimonial.sector}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Métricas de Confiança */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#FF6600] mb-2">500+</div>
              <div className="text-gray-600">Empresas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#FF6600] mb-2">10.000+</div>
              <div className="text-gray-600">Vendedores Usando</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#FF6600] mb-2">99%</div>
              <div className="text-gray-600">Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos e Preços */}
      <section id="planos" className="py-20 bg-gray-50 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0D1B2A] mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para o tamanho do seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Starter */}
            <Card className="border-2 border-gray-200 hover:shadow-xl transition-all bg-white">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#0D1B2A] mb-2">Starter</h3>
                  <p className="text-gray-600 mb-4">Para pequenos negócios</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-[#FF6600]">R$ 97</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Até 5 vendedores</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Dashboard básico</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Controle de estoque</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">App mobile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Suporte por email</span>
                  </li>
                </ul>

                <Link href="/onboarding">
                  <Button className="w-full bg-white border-2 border-[#415A77] text-[#415A77] hover:bg-[#415A77] hover:text-white transition-all">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Professional - Destaque */}
            <Card className="border-2 border-[#FF6600] hover:shadow-2xl transition-all bg-white relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#FF6600] text-white px-4 py-1 text-sm">
                  Mais Popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#0D1B2A] mb-2">Professional</h3>
                  <p className="text-gray-600 mb-4">Para negócios em crescimento</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-[#FF6600]">R$ 197</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Até 20 vendedores</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Dashboard completo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Relatórios avançados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Gestão financeira</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Suporte prioritário</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Integrações API</span>
                  </li>
                </ul>

                <Link href="/onboarding">
                  <Button className="w-full bg-[#FF6600] hover:bg-[#cc5200] text-white shadow-lg hover:shadow-xl transition-all">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card className="border-2 border-gray-200 hover:shadow-xl transition-all bg-white">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#0D1B2A] mb-2">Enterprise</h3>
                  <p className="text-gray-600 mb-4">Para grandes operações</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-[#FF6600]">Custom</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Vendedores ilimitados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Tudo do Professional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Customizações</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Suporte dedicado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Treinamento incluso</span>
                  </li>
                </ul>

                <Button className="w-full bg-white border-2 border-[#415A77] text-[#415A77] hover:bg-[#415A77] hover:text-white transition-all">
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Garantia */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-xl border-2 border-[#10B981] shadow-lg">
              <Shield className="h-8 w-8 text-[#10B981]" />
              <div className="text-left">
                <div className="font-bold text-[#0D1B2A]">Garantia de 14 dias</div>
                <div className="text-sm text-gray-600">Não gostou? Devolvemos 100% do seu dinheiro</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-[#415A77] to-[#1B263B] text-white px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar suas vendas?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a mais de 500 empresas que já aumentaram suas vendas com o Venlo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button 
                size="lg" 
                className="bg-[#FF6600] hover:bg-[#cc5200] text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl hover:scale-[0.98] transition-all"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
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
      <footer className="bg-[#0D1B2A] text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Image 
                  src="/logo-vendr.png" 
                  alt="Venlo Logo" 
                  width={120} 
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400">
                O sistema completo para gestão de vendas externas
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition">Planos</a></li>
                <li><a href="#" className="hover:text-white transition">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Venlo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
