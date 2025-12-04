import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/game';
import api from '@/services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCurrentUser().then(user => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    const response = await api.signup(username, email, password);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
}
