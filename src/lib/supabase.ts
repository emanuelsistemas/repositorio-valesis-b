import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.39.7',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('groups').select('id').limit(1);
    if (error) {
      console.error('Connection check error:', error);
      return false;
    }
    return Array.isArray(data);
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

export const handleSupabaseError = (error: any) => {
  if (error?.message?.includes('Failed to fetch')) {
    return 'Erro de conexão com o servidor. Verifique sua conexão com a internet.';
  }
  if (error?.code === 'PGRST301') {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }
  if (error?.code?.startsWith('PGRST')) {
    return 'Erro no servidor. Por favor, tente novamente mais tarde.';
  }
  return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
};