"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { CATEGORIAS, ESTADOS } from '@/types/catalogo';

export default function CadastrarEstabelecimentoPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    descricao: '',
    telefone: '',
    whatsapp: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    site: '',
    instagram: '',
  });
  const [imagens, setImagens] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: 'Atenção',
        description: 'Você precisa estar logado para cadastrar um estabelecimento',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [user, authLoading]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (imagens.length + files.length > 5) {
      toast({
        title: 'Limite excedido',
        description: 'Você pode adicionar no máximo 5 imagens',
        variant: 'destructive',
      });
      return;
    }

    // Comprimir e converter imagens
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Redimensionar para max 800px de largura mantendo proporção
          const maxWidth = 800;
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
          
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Converter para base64 com qualidade reduzida
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setImagens(prev => [...prev, compressedBase64]);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.categoria) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e categoria são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/catalogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imagens,
        }),
      });

      const text = await response.text();
      console.log('Response text:', text);
      
      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(text);
        } catch {
          throw new Error(`Erro HTTP ${response.status}: ${text.substring(0, 100)}`);
        }
        throw new Error(error.error || 'Erro ao cadastrar estabelecimento');
      }

      const data = JSON.parse(text);

      toast({
        title: 'Sucesso!',
        description: 'Estabelecimento cadastrado! Aguarde aprovação.',
      });

      router.push('/catalogo');
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/catalogo')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Cadastrar Estabelecimento</CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Preencha os dados do seu negócio para aparecer no Venlo Conecta
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informações Básicas</h3>
                  
                  <div>
                    <Label htmlFor="nome">Nome do Estabelecimento *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      placeholder="Ex: Padaria do João"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={formData.categoria} onValueChange={(v) => handleChange('categoria', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => handleChange('descricao', e.target.value)}
                      placeholder="Descreva seu negócio..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Contato */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Contato</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        placeholder="(00) 0000-0000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="contato@exemplo.com"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Localização</h3>
                  
                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => handleChange('endereco', e.target.value)}
                      placeholder="Rua, número, bairro"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleChange('cidade', e.target.value)}
                        placeholder="Ex: São Paulo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select value={formData.estado} onValueChange={(v) => handleChange('estado', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS.map((est) => (
                            <SelectItem key={est.sigla} value={est.sigla}>
                              {est.sigla}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Redes Sociais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="site">Site</Label>
                      <Input
                        id="site"
                        type="url"
                        value={formData.site}
                        onChange={(e) => handleChange('site', e.target.value)}
                        placeholder="https://seusite.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => handleChange('instagram', e.target.value)}
                        placeholder="@seuinstagram"
                      />
                    </div>
                  </div>
                </div>

                {/* Imagens */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Imagens (máximo 5)</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imagens.map((img, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img
                          src={img}
                          alt={`Imagem ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {imagens.length < 5 && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-trust-blue-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Upload className="h-8 w-8 text-gray-400" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-trust-blue-900 hover:bg-trust-blue-800"
                  >
                    {submitting ? 'Cadastrando...' : 'Cadastrar Estabelecimento'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/catalogo')}
                  >
                    Cancelar
                  </Button>
                </div>

                <p className="text-sm text-gray-500">
                  * Seu estabelecimento será enviado para aprovação e aparecerá no catálogo após análise.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
