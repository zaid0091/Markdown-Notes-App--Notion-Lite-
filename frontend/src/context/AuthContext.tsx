/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { client } from '../api/client';
import { setToken } from '../api/tokenStore';
import { useQueryClient } from '@tanstack/react-query';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const queryClient = useQueryClient();

  // Session Recovery on Mount
  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        // Fetch new access token using HttpOnly cookie
        const refreshResponse = await client.post<{ access: string }>('/api/auth/token/refresh/');
        const accessToken = refreshResponse.data.access;
        setToken(accessToken);

        // Retrieve user profile with the new access token
        const profileResponse = await client.get<User>('/api/auth/profile/');
        if (active) {
          setUser(profileResponse.data);
        }
      } catch {
        // Failed to recover session, clear token store
        setToken(null);
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsRestoringSession(false);
        }
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  // Listen to global logout events emitted by Axios client on refresh failures
  useEffect(() => {
    const handleGlobalLogout = () => {
      setUser(null);
      queryClient.clear();
    };

    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    const response = await client.post<{ access: string; user: User }>('/api/auth/login/', {
      email,
      password,
    });
    const { access, user: loggedUser } = response.data;
    setToken(access);
    setUser(loggedUser);
  };

  const register = async (username: string, email: string, password: string) => {
    await client.post('/api/auth/register/', {
      username,
      email,
      password,
      password_confirm: password,
    });
  };

  const logout = async () => {
    try {
      await client.post('/api/auth/logout/');
    } catch {
      // Proceed with local cleanup even if server request fails
    } finally {
      setToken(null);
      setUser(null);
      queryClient.clear();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isRestoringSession,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
