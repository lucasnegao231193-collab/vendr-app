/**
 * Dashboard de Analytics
 * Visualização de métricas e eventos
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, TrendingUp, AlertCircle, Clock, Zap } from "lucide-react";
import { getLocalEvents, Analytics } from "@/lib/analytics/tracker";
import { Line } from 'react-chartjs-2';

export default function AnalyticsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    conversions: 0,
    errors: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const localEvents = getLocalEvents();
    setEvents(localEvents);

    // Calcular estatísticas
    const conversions = localEvents.filter(e => e.category === 'Conversion').length;
    const errors = localEvents.filter(e => e.category === 'Error').length;
    const perfEvents = localEvents.filter(e => e.category === 'Performance');
    const avgTime = perfEvents.length > 0
      ? perfEvents.reduce((sum, e) => sum + (e.value || 0), 0) / perfEvents.length
      : 0;

    setStats({
      totalEvents: localEvents.length,
      conversions,
      errors,
      avgResponseTime: avgTime,
    });
  };

  const getEventsByCategory = () => {
    const categories: { [key: string]: number } = {};
    events.forEach(event => {
      categories[event.category] = (categories[event.category] || 0) + 1;
    });
    return categories;
  };

  const getRecentEvents = () => {
    return events.slice(-10).reverse();
  };

  const eventsByCategory = getEventsByCategory();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Monitoramento</h1>
        <p className="text-muted-foreground">Métricas de uso e performance da plataforma</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Eventos rastreados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversions}</div>
            <p className="text-xs text-muted-foreground">Ações importantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">Erros capturados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análise */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="sentry">Sentry</TabsTrigger>
        </TabsList>

        {/* Tab Eventos */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recentes</CardTitle>
              <CardDescription>Últimos 10 eventos rastreados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getRecentEvents().map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">{event.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{event.label || '-'}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.timestamp ? new Date(event.timestamp).toLocaleTimeString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Categorias */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos por Categoria</CardTitle>
              <CardDescription>Distribuição de eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(eventsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(count / stats.totalEvents) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Sentry */}
        <TabsContent value="sentry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integração com Sentry</CardTitle>
              <CardDescription>Monitoramento de erros e performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">✅ Sentry Configurado</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Rastreamento de erros ativo</li>
                  <li>• Session Replay habilitado</li>
                  <li>• Performance monitoring ativo</li>
                  <li>• Breadcrumbs capturados</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Links Úteis:</h4>
                <div className="space-y-1">
                  <a
                    href="https://sentry.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    → Dashboard do Sentry
                  </a>
                  <a
                    href="https://docs.sentry.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    → Documentação
                  </a>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">⚙️ Configuração</h3>
                <p className="text-sm text-muted-foreground">
                  Configure a variável <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">NEXT_PUBLIC_SENTRY_DSN</code> no arquivo .env
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
