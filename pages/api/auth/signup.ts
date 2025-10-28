import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Usar service role key para bypass do Auth API
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface SignupRequest {
  email: string;
  password: string;
  empresaNome: string;
  isSolo: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, empresaNome, isSolo }: SignupRequest = req.body;

    // Validações
    if (!email || !password || !empresaNome) {
      return res.status(400).json({ 
        error: 'Email, senha e nome da empresa são obrigatórios' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter no mínimo 6 caracteres' 
      });
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email já cadastrado' 
      });
    }

    // Gerar IDs
    const userId = crypto.randomUUID();
    const empresaId = crypto.randomUUID();
    const identityId = crypto.randomUUID();

    // Criar usuário via SQL direto
    const { error: createError } = await supabaseAdmin.rpc('create_user_complete', {
      p_user_id: userId,
      p_identity_id: identityId,
      p_empresa_id: empresaId,
      p_email: email,
      p_password: password,
      p_empresa_nome: empresaNome,
      p_is_solo: isSolo
    });

    if (createError) {
      console.error('Erro ao criar usuário:', createError);
      return res.status(500).json({ 
        error: 'Erro ao criar conta. Tente novamente.' 
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      userId,
      empresaId
    });

  } catch (error: any) {
    console.error('Erro no signup:', error);
    return res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
}
