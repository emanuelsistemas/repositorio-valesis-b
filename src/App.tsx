import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { supabase, handleSupabaseError } from './lib/supabase';
import type { Profile } from './types/database';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutBlur, setLogoutBlur] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    window.history.pushState(null, '', window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const resetAuthState = async () => {
    try {
      setIsLoggingOut(true);
      setLogoutBlur(true);

      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsAuthenticated(false);
      setUserProfile(null);

      window.sessionStorage.clear();
      window.localStorage.clear();
      
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });

      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsLoggingOut(false);
      setLogoutBlur(false);
      
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setIsLoggingOut(false);
      setLogoutBlur(false);
      window.location.reload();
    }
  };

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!profile) throw new Error('Perfil não encontrado');

      setUserProfile(profile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      await resetAuthState();
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) throw error;

        if (session?.user?.id) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setUserProfile(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserProfile(null);
        setIsLoading(false);
      } else if (session?.user?.id && event === 'SIGNED_IN') {
        try {
          await fetchProfile(session.user.id);
          setIsLoading(false);
        } catch (error) {
          toast.error(handleSupabaseError(error));
          setIsAuthenticated(false);
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session?.user?.id) {
        await fetchProfile(data.session.user.id);
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserProfile(null);
      throw new Error(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await resetAuthState();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xl">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-gray-100 transition-all duration-300 ${logoutBlur ? 'blur-sm' : ''}`}>
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center space-x-3 animate-slideIn">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-lg">Saindo...</span>
          </div>
        </div>
      )}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            borderRadius: '0.5rem',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F9FAFB',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F9FAFB',
            },
          },
        }}
      />

      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} userProfile={userProfile} />
      )}
    </div>
  );
}

export default App;