/**
 * Admin - Estatísticas Detalhadas
 * Métricas e relatórios da plataforma
 */
'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, MapPin, ShoppingCart, TrendingUp, Star, Calendar } from 'lucide-react';
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

export default function AdminEstatisticasPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

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

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando estatísticas...</p>
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
          <CardContent>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-trust-blue-600" />
            Estatísticas Detalhadas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Métricas e relatórios completos da plataforma
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Usuários */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Usuários
                </CardTitle>
                <Users className="h-5 w-5 text-trust-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_usuarios || 0}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Todos os usuários cadastrados
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Empresas */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Empresas
                </CardTitle>
                <Building2 className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_empresas_normais || 0}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Empresas com múltiplos vendedores
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Autônomos */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Autônomos (Solo)
                </CardTitle>
                <Users className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_solos || 0}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Vendedores autônomos
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vendedores */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Vendedores
                </CardTitle>
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_vendedores || 0}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Vendedores ativos na plataforma
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Estabelecimentos */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Estabelecimentos
                </CardTitle>
                <MapPin className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_estabelecimentos || 0}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-green-600">
                    ✓ {stats?.estabelecimentos_aprovados || 0} aprovados
                  </span>
                  <span className="text-yellow-600">
                    ⏳ {stats?.estabelecimentos_pendentes || 0} pendentes
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Avaliações */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Avaliações
                </CardTitle>
                <Star className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_avaliacoes || 0}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Avaliações de estabelecimentos
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráficos e Relatórios (Próximas versões) */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Relatórios Detalhados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              📊 Gráficos e relatórios detalhados serão implementados em breve.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Recursos planejados: Crescimento de usuários, Estabelecimentos por região, Tendências de avaliações, etc.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
