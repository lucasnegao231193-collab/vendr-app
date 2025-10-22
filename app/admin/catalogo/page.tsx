/**
 * Admin - Gestão de Catálogo
 * Aprovar, negar e destacar estabelecimentos
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, MapPin, Phone, Mail, Instagram, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EstabelecimentoComStats } from '@/types/catalogo';

export default function AdminCatalogoPage() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [estabelecimentos, setEstabelecimentos] = useState<EstabelecimentoComStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pendentes' | 'aprovados' | 'todos'>('pendentes');

  // Removido: Redirecionamento automático causava loop infinito
  // A proteção vem do middleware

  useEffect(() => {
    if (isAdmin) {
      loadEstabelecimentos();
    }
  }, [isAdmin, filter]);

  async function loadEstabelecimentos() {
    try {
      setLoading(true);
      console.log('🔍 Carregando estabelecimentos com filtro:', filter);
      
      const response = await fetch(`/api/admin/catalogo?filter=${filter}`);
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Estabelecimentos carregados:', data.length, 'itens');
        console.log('📊 Dados:', data);
        setEstabelecimentos(data);
      } else {
        const error = await response.json();
        console.error('❌ Erro na resposta:', error);
        toast({
          title: 'Erro ao carregar',
          description: error.error || 'Não foi possível carregar os estabelecimentos',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estabelecimentos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar estabelecimentos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAprovar(id: string) {
    try {
      const response = await fetch(`/api/admin/catalogo/${id}/aprovar`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Estabelecimento aprovado',
        });
        loadEstabelecimentos();
      } else {
        throw new Error('Erro ao aprovar');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao aprovar estabelecimento',
        variant: 'destructive',
      });
    }
  }

  async function handleRejeitar(id: string) {
    try {
      const response = await fetch(`/api/admin/catalogo/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Estabelecimento rejeitado e removido',
        });
        loadEstabelecimentos();
      } else {
        throw new Error('Erro ao rejeitar');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao rejeitar estabelecimento',
        variant: 'destructive',
      });
    }
  }

  async function handleDestaque(id: string, destaque: boolean) {
    try {
      const response = await fetch(`/api/admin/catalogo/${id}/destaque`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destaque }),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: destaque ? 'Estabelecimento destacado' : 'Destaque removido',
        });
        loadEstabelecimentos();
      } else {
        throw new Error('Erro ao alterar destaque');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar destaque',
        variant: 'destructive',
      });
    }
  }

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-trust-blue-900 to-trust-blue-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">🗺️ Gestão de Catálogo</h1>
          <p className="text-gray-200 mt-2">Aprovar, negar e destacar estabelecimentos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4">
          <Button
            variant={filter === 'pendentes' ? 'default' : 'outline'}
            onClick={() => setFilter('pendentes')}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'aprovados' ? 'default' : 'outline'}
            onClick={() => setFilter('aprovados')}
          >
            Aprovados
          </Button>
          <Button
            variant={filter === 'todos' ? 'default' : 'outline'}
            onClick={() => setFilter('todos')}
          >
            Todos
          </Button>
        </div>
      </div>

      {/* Lista de Estabelecimentos */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600 mx-auto"></div>
          </div>
        ) : estabelecimentos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">Nenhum estabelecimento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {estabelecimentos.map((est) => (
              <Card key={est.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {est.nome}
                        {est.destaque && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                        {!est.aprovado && (
                          <Badge variant="destructive">Pendente</Badge>
                        )}
                        {est.aprovado && (
                          <Badge variant="default" className="bg-green-500">Aprovado</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {est.categoria}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Descrição */}
                    {est.descricao && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">{est.descricao}</p>
                    )}

                    {/* Localização */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {est.cidade}, {est.estado}
                    </div>

                    {/* Contatos */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {est.telefone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {est.telefone}
                        </div>
                      )}
                      {est.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {est.email}
                        </div>
                      )}
                      {est.instagram && (
                        <div className="flex items-center gap-1">
                          <Instagram className="h-4 w-4" />
                          {est.instagram}
                        </div>
                      )}
                      {est.site && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {est.site}
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 pt-4 border-t">
                      {!est.aprovado && (
                        <>
                          <Button
                            onClick={() => handleAprovar(est.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleRejeitar(est.id)}
                            variant="destructive"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {est.aprovado && (
                        <Button
                          onClick={() => handleDestaque(est.id, !est.destaque)}
                          variant={est.destaque ? 'outline' : 'default'}
                          className={est.destaque ? '' : 'bg-yellow-500 hover:bg-yellow-600'}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          {est.destaque ? 'Remover Destaque' : 'Destacar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
