/**
 * Painel Administrativo - Dashboard Principal
 * Acesso restrito apenas para admins
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, MapPin, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
  total_usuarios: number;
  total_empresas: number;
  total_solos: number;
  total_empresas_normais: number;
  total_vendedores: number;
  total_estabelecimentos: number;
  estabelecimentos_aprovados: number;
  estabelecimentos_pendentes: number;
  total_avaliacoes: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Removido: Redirecionamento automático causava loop infinito
  // A proteção vem do middleware e da renderização condicional abaixo

  useEffect(() => {
    console.log('📊 Admin Page - Estado:', { isAdmin, adminLoading, loading });
    
    async function loadStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      console.log('✅ Admin Page - Carregando stats...');
      loadStats();
    } else if (!adminLoading) {
      console.log('❌ Admin Page - NÃO é admin!');
      setLoading(false);
    }
  }, [isAdmin, adminLoading]);

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">🚫 Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">⚠️ Possíveis causas:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Migrations não foram aplicadas no Supabase</li>
                <li>Você não foi adicionado como admin</li>
                <li>Você não está logado</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full"
              >
                Fazer Login
              </Button>
              <Button 
                onClick={() => router.push('/')} 
                variant="outline"
                className="w-full"
              >
                Voltar para Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Usuários',
      value: stats?.total_usuarios || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Empresas',
      value: stats?.total_empresas_normais || 0,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Autônomos (Solo)',
      value: stats?.total_solos || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Vendedores',
      value: stats?.total_vendedores || 0,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Estabelecimentos',
      value: stats?.total_estabelecimentos || 0,
      icon: MapPin,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
    {
      title: 'Pendentes Aprovação',
      value: stats?.estabelecimentos_pendentes || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-trust-blue-900 to-trust-blue-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">🛡️ Painel Administrativo</h1>
          <p className="text-gray-200 mt-2">Controle total da plataforma Venlo</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/admin/usuarios')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualizar, editar e gerenciar contas de usuários
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/admin/catalogo')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Gerenciar Catálogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aprovar, negar e destacar estabelecimentos
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/admin/estatisticas')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Relatórios e métricas detalhadas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
