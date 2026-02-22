/**
 * @module AuthContext
 * @description Provider de autenticación para el lado cliente.
 *
 * Proporciona el estado del usuario autenticado y funciones de login/logout
 * a todos los componentes del árbol React a través de React Context.
 *
 * Al montar, verifica automáticamente si existe una sesión válida consultando
 * `/api/auth/me` y obtiene un token CSRF fresco de `/api/auth/csrf`.
 *
 * @see {@link file://src/lib/auth.ts} - Lógica de JWT del servidor.
 * @see {@link file://src/app/providers.tsx} - Donde se monta este provider.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Tejedor } from '@/types/models';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: Tejedor | null;
  loading: boolean;
  login: (usuario: string, password: string, additionalData?: any) => Promise<boolean>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  csrfToken: string;
  refreshCsrf: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Tejedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');
  const router = useRouter();

  const fetchCsrf = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/csrf');
      if (res.ok) {
        const data = await res.json();
        setCsrfToken(data.csrfToken);
        return data.csrfToken;
      }
    } catch (err) {
      console.error('Failed to fetch CSRF token');
    }
    return '';
  }, []);

  useEffect(() => {
    // Validar sesión con la API
    const initAuth = async () => {
      try {
        await fetchCsrf();
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [fetchCsrf]);

  const login = async (usuario: string, password: string, additionalData: any = {}): Promise<boolean> => {
    try {
      setLoading(true);

      // Ensure we have a fresh token
      const currentToken = await fetchCsrf();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': currentToken
        },
        body: JSON.stringify({
          usuario,
          password,
          csrfToken: currentToken,
          ...additionalData
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    try {
      // Use the stored token for logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken
        }
      });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      // Always cleanup state and redirect, even if API fails
      setUser(null);
      localStorage.removeItem('currentUser');
      router.push('/login');
      router.refresh();
      // Reset CSRF token
      fetchCsrf();
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    const userRole = (user as any).role || user.tipodeVoluntario || '';
    return roles.includes(userRole);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      hasRole,
      csrfToken,
      refreshCsrf: fetchCsrf
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
