/**
 * Helper para buscar empresa_id do usuário logado
 */
import { SupabaseClient } from '@supabase/supabase-js';

export async function getEmpresaIdFromUser(supabase: SupabaseClient): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: perfil } = await supabase
      .from('perfis')
      .select('empresa_id')
      .eq('user_id', user.id)
      .single();

    return perfil?.empresa_id || null;
  } catch (error) {
    console.error('Erro ao buscar empresa_id:', error);
    return null;
  }
}
