/**
 * Hook para verificar se o usuário é admin
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@/lib/supabase-browser';

interface AdminData {
  id: string;
  nome: string;
  email: string;
  super_admin: boolean;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminData(null);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        console.log('🔍 useAdmin: Verificando admin para user:', user.id);
        
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('👤 useAdmin: Resultado da query:', { data, error });

        if (error || !data) {
          console.log('❌ useAdmin: Não é admin ou erro RLS');
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setAdminData(null);
        } else {
          console.log('✅ useAdmin: Admin identificado!', data);
          setIsAdmin(true);
          setIsSuperAdmin(data.super_admin);
          setAdminData(data);
        }
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminData(null);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [user]);

  return { isAdmin, isSuperAdmin, adminData, loading };
}
