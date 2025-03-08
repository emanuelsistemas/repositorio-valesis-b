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
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  const resetAuthState = async () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    await supabase.auth.signOut();
    window.sessionStorage.clear();
  };

  const fetchProfile = async (userId: string) => {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          await resetAuthState();
        } else if (session?.user?.id) {
          try {
            await fetchProfile(session.user.id);
          } catch (error) {
            toast.error(handleSupabaseError(error));
          }
        }
        setIsLoading(false);
      }
    );

    return () => {
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
      await resetAuthState();
      throw new Error(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await resetAuthState();
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error(handleSupabaseError(error));
    } finally {
      setIsLoggingOut(false);
    }
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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
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