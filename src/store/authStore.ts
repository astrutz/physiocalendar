// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from './apiClient';

interface User {
  id: number;
  username: string;
  therapistId: number; // Füge hier die Therapisten-ID hinzu
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      apiClient.defaults.headers['Authorization'] = `Bearer ${token}`; // Setze den Auth-Header
      isAuthenticated.value = true;
      console.log(token);
    } catch (error) {
      console.error('Fehler beim Anmelden:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    apiClient.defaults.headers['Authorization'] = ''; // Entferne den Auth-Header
    user.value = null;
    isAuthenticated.value = false;
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
});
