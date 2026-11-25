// useAuth hook for client-side authentication context

"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  getCurrentSession,
  getRememberedEmail,
  AuthUser,
  AuthCredentials,
  RegisterData,
} from "@/lib/authStore";

export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  rememberedEmail: string | null;
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    setLoading(true);
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    const remembered = getRememberedEmail();
    setRememberedEmail(remembered);
    
    setLoading(false);
  }, []);

  const login = async (
    credentials: AuthCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await loginUser(credentials);
    if (result.success && result.user) {
      setUser(result.user);
      setRememberedEmail(credentials.rememberMe ? credentials.email : null);
    }
    return { success: result.success, error: result.error };
  };

  const register = async (
    data: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await registerUser(data);
    if (result.success) {
      // Auto-login after registration
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
    return { success: result.success, error: result.error };
  };

  const logout = (): void => {
    logoutUser();
    setUser(null);
    setRememberedEmail(null);
  };

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    rememberedEmail,
    login,
    register,
    logout,
  };
};
