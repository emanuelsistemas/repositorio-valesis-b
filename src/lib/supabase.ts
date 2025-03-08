import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: window.sessionStorage,
  },
});

export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();

    return !error;
  } catch (error) {
    console.error('❌ Erro na verificação de conexão:', error);
    return false;
  }
};

export const handleSupabaseError = (error: any): string => {
  console.error('❌ Erro Supabase:', error);
  
  if (!error) return 'Erro desconhecido';

  if (error.message?.includes('Invalid login credentials')) {
    return 'Email ou senha inválidos';
  }

  if (error.message?.includes('JWT') || error.message?.includes('token')) {
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }

  if (error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
    return 'Erro de conexão com o servidor';
  }

  return error.message || 'Ocorreu um erro inesperado';
};