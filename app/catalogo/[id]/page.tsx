"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Star, MapPin, Phone, Mail, Globe, 
  Instagram, MessageCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { EstabelecimentoComStats, Avaliacao } from '@/types/catalogo';
import { useToast } from '@/components/ui/use-toast';

export default function EstabelecimentoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [estabelecimento, setEstabelecimento] = useState<EstabelecimentoComStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAvaliacaoForm, setShowAvaliacaoForm] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEstabelecimento();
  }, [params.id]);

  const loadEstabelecimento = async () => {
    try {
      const response = await fetch(`/api/catalogo/${params.id}`);
      if (!response.ok) throw new Error('Estabelecimento não encontrado');
      const data = await response.json();
      setEstabelecimento(data);
    } catch (error) {
      console.error('Erro ao carregar estabelecimento:', error);
      toast({
        title: 'Erro',
        description: 'Estabelecimento não encontrado',
        variant: 'destructive',
      });
      router.push('/catalogo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAvaliacao = async () => {
    if (!user) {
      toast({
        title: 'Atenção',
        description: 'Você precisa estar logado para avaliar',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/catalogo/avaliacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estabelecimento_id: params.id,
          nota,
          comentario,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar avaliação');
      }

      toast({
        title: 'Sucesso!',
        description: 'Avaliação enviada com sucesso',
      });

      setShowAvaliacaoForm(false);
      setComentario('');
      setNota(5);
      loadEstabelecimento();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const nextImage = () => {
    if (estabelecimento?.imagens) {
      setCurrentImageIndex((prev) => 
        prev === estabelecimento.imagens!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (estabelecimento?.imagens) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? estabelecimento.imagens!.length - 1 : prev - 1
      );
    }
  };

  const openWhatsApp = () => {
    if (estabelecimento?.whatsapp) {
      const number = estabelecimento.whatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/55${number}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!estabelecimento) return null;

  const imagens = estabelecimento.imagens || [];
  const avaliacoes = (estabelecimento as any).avaliacoes || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => router.push('/catalogo')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao catálogo
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carrossel de Imagens */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 bg-gradient-to-br from-trust-blue-100 to-venlo-orange/20 overflow-hidden rounded-t-lg">
                  {imagens.length > 0 ? (
                    <>
                      <motion.img
                        key={currentImageIndex}
                        src={imagens[currentImageIndex]}
                        alt={estabelecimento.nome}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      {imagens.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {imagens.map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-2 w-2 rounded-full ${
                                  idx === currentImageIndex
                                    ? 'bg-white'
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <MapPin className="h-24 w-24" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {estabelecimento.nome}
                      </h1>
                      <Badge className="mb-2">{estabelecimento.categoria}</Badge>
                      {estabelecimento.total_avaliacoes > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.round(estabelecimento.nota_media)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{estabelecimento.nota_media.toFixed(1)}</span>
                          <span className="text-gray-500">
                            ({estabelecimento.total_avaliacoes} {estabelecimento.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'})
                          </span>
                        </div>
                      )}
                    </div>
                    {estabelecimento.destaque && (
                      <Badge className="bg-venlo-orange">⭐ Destaque</Badge>
                    )}
                  </div>

                  {estabelecimento.descricao && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {estabelecimento.descricao}
                    </p>
                  )}

                  {estabelecimento.endereco && (
                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="h-5 w-5 mt-0.5" />
                      <div>
                        <p>{estabelecimento.endereco}</p>
                        {estabelecimento.cidade && (
                          <p>{estabelecimento.cidade}{estabelecimento.estado && `, ${estabelecimento.estado}`}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Avaliações */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Avaliações</CardTitle>
                  {user && !showAvaliacaoForm && (
                    <Button onClick={() => setShowAvaliacaoForm(true)}>
                      Deixar Avaliação
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showAvaliacaoForm && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-3">Sua Avaliação</h3>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-8 w-8 cursor-pointer ${
                            n <= nota
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          onClick={() => setNota(n)}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder="Deixe seu comentário (opcional)"
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitAvaliacao} disabled={submitting}>
                        {submitting ? 'Enviando...' : 'Enviar'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAvaliacaoForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {avaliacoes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma avaliação ainda. Seja o primeiro!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {avaliacoes.map((av: Avaliacao) => (
                      <div key={av.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < av.nota
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500">
                            {new Date(av.criado_em).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {av.comentario && (
                          <p className="text-gray-700 dark:text-gray-300">{av.comentario}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de Contato */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {estabelecimento.whatsapp && (
                  <Button
                    onClick={openWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}

                {estabelecimento.telefone && (
                  <a href={`tel:${estabelecimento.telefone}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      {estabelecimento.telefone}
                    </Button>
                  </a>
                )}

                {estabelecimento.email && (
                  <a href={`mailto:${estabelecimento.email}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </a>
                )}

                {estabelecimento.site && (
                  <a href={estabelecimento.site} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full">
                      <Globe className="h-4 w-4 mr-2" />
                      Site
                    </Button>
                  </a>
                )}

                {estabelecimento.instagram && (
                  <a
                    href={`https://instagram.com/${estabelecimento.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
