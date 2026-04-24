// src/hooks/useAuth.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../lib/api';

export function useAuth() {
  const { token, user, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      authAPI.me()
        .then(r => setUser(r.data))
        .catch(() => logout());
    }
  }, [token]);

  return { token, user, logout, isAuthenticated: !!token };
}