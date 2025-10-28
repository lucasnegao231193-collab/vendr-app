"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Search, MapPin, Filter, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EstabelecimentoComStats, CATEGORIAS } from '@/types/catalogo';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';

export default function CatalogoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [estabelecimentos, setEstabelecimentos] = useState<EstabelecimentoComStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [cidade, setCidade] = useState(searchParams.get('cidade') || '');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadEstabelecimentos();
  }, [busca, categoria, cidade, page]);

  const loadEstabelecimentos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.append('busca', busca);
      if (categoria) params.append('categoria', categoria);
      if (cidade) params.append('cidade', cidade);
      params.append('page', page.toString());

      const response = await fetch(`/api/catalogo?${params}`);
      const data = await response.json();

      setEstabelecimentos(data.estabelecimentos || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadEstabelecimentos();
  };

  return (
    <AuthenticatedLayout>
      <div>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-trust-blue-900 to-trust-blue-700 text-white py-12 -mx-6 -mt-6">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🗺️ Venlo Conecta
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Encontre, conecte e contrate direto pelo Venlo
            </p>

            {/* Busca */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou descrição..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={categoria || "all"} onValueChange={(v) => setCategoria(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleSearch} className="bg-venlo-orange hover:bg-venlo-orange/90">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Resultados */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {estabelecimentos.length} estabelecimentos encontrados
          </h2>
          <Button
            onClick={() => router.push('/catalogo/cadastrar')}
            className="bg-trust-blue-900 hover:bg-trust-blue-800"
          >
            + Cadastrar Negócio
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : estabelecimentos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum estabelecimento encontrado
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estabelecimentos.map((est) => (
              <motion.div
                key={est.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/catalogo/${est.id}`)}
                >
                  {/* Imagem */}
                  <div className="relative h-48 bg-gradient-to-br from-trust-blue-100 to-venlo-orange/20 overflow-hidden">
                    {est.imagens && est.imagens.length > 0 ? (
                      <Image
                        src={est.imagens[0]}
                        alt={est.nome}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <MapPin className="h-16 w-16" />
                      </div>
                    )}
                    {est.destaque && (
                      <Badge className="absolute top-2 right-2 bg-venlo-orange">
                        ⭐ Destaque
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
                      {est.nome}
                    </h3>
                    <Badge variant="secondary" className="mb-2">
                      {est.categoria}
                    </Badge>

                    {est.cidade && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3" />
                        {est.cidade}{est.estado && `, ${est.estado}`}
                      </p>
                    )}

                    {est.total_avaliacoes > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 font-semibold">{est.nota_media.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({est.total_avaliacoes} {est.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'})
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
    </AuthenticatedLayout>
  );
}
