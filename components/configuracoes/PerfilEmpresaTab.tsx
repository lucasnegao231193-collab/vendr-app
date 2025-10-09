/**
 * Tab: Perfil da Empresa
 * Upload de avatar, dados da empresa, endereço, horário de funcionamento
 */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AvatarUploader } from "@/components/AvatarUploader";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase-browser";
import { Loader2, Save } from "lucide-react";

export function PerfilEmpresaTab() {
  const supabase = createClient();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresaId, setEmpresaId] = useState<string>("");
  const [formData, setFormData] = useState({
    nome: "",
    cnpj_cpf: "",
    endereco_completo: "",
    telefone: "",
    email: "",
    horario_funcionamento: {
      seg_sex: "08:00-18:00",
      sab: "08:00-12:00",
      dom: "fechado"
    },
    avatar_url: "",
  });

  useEffect(() => {
    loadEmpresaData();
  }, []);

  const loadEmpresaData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: perfil } = await supabase
        .from('perfis')
        .select('empresa_id')
        .eq('user_id', user.id)
        .single();

      if (!perfil) return;

      setEmpresaId(perfil.empresa_id);

      const { data: empresa } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', perfil.empresa_id)
        .single();

      if (empresa) {
        setFormData({
          nome: empresa.nome || "",
          cnpj_cpf: empresa.cnpj || "",
          endereco_completo: empresa.endereco_completo || "",
          telefone: empresa.telefone || "",
          email: empresa.email || "",
          horario_funcionamento: empresa.horario_funcionamento || formData.horario_funcionamento,
          avatar_url: empresa.avatar_url || "",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('empresas')
        .update({
          nome: formData.nome,
          endereco_completo: formData.endereco_completo,
          telefone: formData.telefone,
          email: formData.email,
          horario_funcionamento: formData.horario_funcionamento,
        })
        .eq('id', empresaId);

      if (error) throw error;

      toast({
        title: "Salvo!",
        description: "Dados da empresa atualizados com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (url: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
    toast({
      title: "Avatar atualizado!",
      description: "A foto da empresa foi alterada",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const initials = formData.nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Foto da Empresa</CardTitle>
          <CardDescription>
            Altere o avatar/logo que aparece no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUploader
            currentAvatarUrl={formData.avatar_url}
            entityType="empresa"
            entityId={empresaId}
            fallbackInitials={initials}
            onUploadComplete={handleAvatarUpload}
            size="lg"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Dados básicos e informações de contato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Minha Empresa Ltda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ/CPF</Label>
              <Input
                id="cnpj"
                value={formData.cnpj_cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj_cpf: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(13) 98140-1945"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Textarea
              id="endereco"
              value={formData.endereco_completo}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco_completo: e.target.value }))}
              placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Horário de Funcionamento</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                value={formData.horario_funcionamento.seg_sex}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  horario_funcionamento: {
                    ...prev.horario_funcionamento,
                    seg_sex: e.target.value
                  }
                }))}
                placeholder="Segunda a Sexta"
              />
              <Input
                value={formData.horario_funcionamento.sab}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  horario_funcionamento: {
                    ...prev.horario_funcionamento,
                    sab: e.target.value
                  }
                }))}
                placeholder="Sábado"
              />
              <Input
                value={formData.horario_funcionamento.dom}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  horario_funcionamento: {
                    ...prev.horario_funcionamento,
                    dom: e.target.value
                  }
                }))}
                placeholder="Domingo"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ex: 08:00-18:00 ou "fechado"
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
