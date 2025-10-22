/**
 * Admin - Gerenciar Usuários
 * Visualizar e gerenciar todos os usuários da plataforma
 */
'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserActionsDialog } from './components/UserActionsDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Building2, User, Search, Mail, Calendar, ShoppingCart, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

interface Usuario {
  id: string;
  email: string;
  created_at: string;
  perfil?: {
    id: string;
    nome: string;
    role: string;
    empresa?: {
      nome: string;
      is_solo: boolean;
    };
  };
  is_admin: boolean;
}

export default function AdminUsuariosPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsuarios();
    }
  }, [isAdmin]);

  async function loadUsuarios() {
    try {
      setLoading(true);
      
      console.log('🔍 Carregando usuários...');
      const response = await fetch('/api/admin/usuarios');
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Usuários carregados:', data.length, 'itens');
        console.log('📊 Dados completos:', data);
        
        // Diagnosticar estrutura
        if (data.length > 0) {
          console.log('📋 Exemplo de usuário:', data[0]);
          console.log('🏢 Empresas (owner não-solo):', data.filter((u: any) => u.perfil?.role === 'owner' && !u.perfil?.empresa?.is_solo).length);
          console.log('👤 Autônomos (is_solo):', data.filter((u: any) => u.perfil?.empresa?.is_solo).length);
          console.log('🛒 Vendedores (seller):', data.filter((u: any) => u.perfil?.role === 'seller').length);
        }
        
        setUsuarios(data);
      } else {
        const error = await response.json();
        console.error('❌ Erro na resposta:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleExportCSV() {
    const csv = [
      ['Nome', 'Email', 'Role', 'Empresa', 'Tipo', 'Data Criação'].join(','),
      ...filteredUsuarios.map(u => [
        u.perfil?.nome || 'N/A',
        u.email,
        u.perfil?.role || 'admin',
        u.perfil?.empresa?.nome || 'N/A',
        u.perfil?.empresa?.is_solo ? 'Solo' : 'Normal',
        new Date(u.created_at).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Sucesso!',
      description: 'Relatório exportado com sucesso'
    });
  }

  function handleOpenDialog(usuario: Usuario) {
    setSelectedUser(usuario);
    setDialogOpen(true);
  }

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando usuários...</p>
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

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.perfil?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getRoleBadge(role?: string) {
    if (!role) return null;
    
    const badges = {
      owner: { label: 'Proprietário', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      seller: { label: 'Vendedor', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    };
    
    const badge = badges[role as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <Badge className={badge.color}>
        {badge.label}
      </Badge>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-trust-blue-600" />
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visualizar, editar e gerenciar contas de usuários
            </p>
          </div>
          <Button onClick={handleExportCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-10 w-10 text-trust-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{usuarios.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-10 w-10 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Empresas</p>
                  <p className="text-2xl font-bold">
                    {usuarios.filter(u => u.perfil?.role === 'owner' && !u.perfil?.empresa?.is_solo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <User className="h-10 w-10 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Autônomos</p>
                  <p className="text-2xl font-bold">
                    {usuarios.filter(u => u.perfil?.empresa?.is_solo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-10 w-10 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vendedores</p>
                  <p className="text-2xl font-bold">
                    {usuarios.filter(u => u.perfil?.role === 'seller').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsuarios.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum usuário encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsuarios.map((usuario, index) => (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-trust-blue-100 dark:bg-trust-blue-900">
                            {usuario.is_admin ? (
                              <span className="text-2xl">👑</span>
                            ) : usuario.perfil?.empresa?.is_solo ? (
                              <User className="h-6 w-6 text-trust-blue-600" />
                            ) : (
                              <Users className="h-6 w-6 text-trust-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {usuario.perfil?.nome || 'Nome não disponível'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-4 w-4" />
                              {usuario.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {usuario.is_admin && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              👑 Admin
                            </Badge>
                          )}
                          {getRoleBadge(usuario.perfil?.role)}
                          {usuario.perfil?.empresa && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {usuario.perfil.empresa.nome}
                              {usuario.perfil.empresa.is_solo && ' (Solo)'}
                            </Badge>
                          )}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(usuario)}
                        >
                          Gerenciar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

      </div>

      {/* Dialog de Ações */}
      {selectedUser && (
        <UserActionsDialog
          usuario={selectedUser}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={loadUsuarios}
        />
      )}
    </AdminLayout>
  );
}
