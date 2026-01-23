'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/src/lib/api';
import { AuthTestResponse, LoginRequest } from '@/src/types';
import { logError, parseApiError } from '@/src/lib/errors';
import { toast } from 'sonner';

interface User {
  userId: string;
  username: string;
  permissions: string[];
  isSuperAdmin: boolean;
  departmentId?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const extractUserFromClaims = useCallback((response: AuthTestResponse): User | null => {
    if (!response.isAuthenticated) {
      return null;
    }

    const claims = response.claims;

    const userIdClaim = claims.find(
      (c) => c.type === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
    );
    const usernameClaim = claims.find((c) => c.type === 'username');
    const permissionsClaim = claims.find((c) => c.type === 'permissions');
    const isSuperAdminClaim = claims.find((c) => c.type === 'isSuperAdmin');
    const departmentIdClaim = claims.find((c) => c.type === 'departmentId');

    if (!userIdClaim || !usernameClaim) {
      return null;
    }

    let permissions: string[] = [];
    if (permissionsClaim?.value) {
      try {
        permissions = JSON.parse(permissionsClaim.value);
      } catch {
        // Ignore parse errors
      }
    }

    return {
      userId: userIdClaim.value,
      username: usernameClaim.value,
      permissions,
      isSuperAdmin: isSuperAdminClaim?.value === 'true',
      departmentId: departmentIdClaim?.value ? parseInt(departmentIdClaim.value) : undefined,
    };
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await apiClient.get<AuthTestResponse>('/auth/test', {
        validateStatus: (status: number) => status < 500,
        skipAuthRefresh: true,
      } as any);

      if (response.status === 401 || !response.data?.isAuthenticated) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const userData = extractUserFromClaims(response.data);

      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      logError(error, 'Auth Check');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [extractUserFromClaims]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        setIsLoading(true);

        await apiClient.post('/auth/login', credentials);
        const authResponse = await apiClient.get<AuthTestResponse>('/auth/test');
        const userData = extractUserFromClaims(authResponse.data);

        if (userData) {
          setIsAuthenticated(true);
          setUser(userData);
          toast.success('Giriş başarılı!');
        } else {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
      } catch (error) {
        logError(error, 'Login');
        const errorMessage = parseApiError(error);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [extractUserFromClaims]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {}).catch((error) => {

        logError(error, 'Logout');
      });
    } finally {
      setIsAuthenticated(false);
      setUser(null);

      toast.success('Logged out successfully');

      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      toast.error('Session expired. Please login again.');
      router.push('/auth/login');
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [router]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
