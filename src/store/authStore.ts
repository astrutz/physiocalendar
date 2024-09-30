// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';
import apiClient from './apiClient';
import { toast } from 'vue3-toastify';

interface User {
  id: number;
  username: string;
  therapistId: number; // Therapisten-ID wird aus den Benutzerdaten extrahiert
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  onMounted(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      token.value = storedToken;
      apiClient.defaults.headers['Authorization'] = `Bearer ${storedToken}`;

      // Benutzerdaten abrufen
      apiClient.get('/auth/user').then(response => {
        user.value = response.data;
        isAuthenticated.value = true; // Authentifizierung setzen, wenn Benutzer erfolgreich abgerufen
      }).catch(error => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        logout(); // Bei Fehler Token löschen und Abmelden
      });
    }
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
  
      if (!response.data || !response.data.token) {
        throw new Error('Fehler beim Anmelden: Token nicht gefunden');
      }
  
      token.value = response.data.token;
      localStorage.setItem('authToken', response.data.token);
      apiClient.defaults.headers['Authorization'] = `Bearer ${token.value}`;
  
      // Benutzerdaten abrufen
      const userResponse = await apiClient.get('/auth/user');
      if (!userResponse.data) {
        throw new Error('Fehler beim Anmelden: Benutzerdaten nicht gefunden');
      }
  
      user.value = userResponse.data;
      isAuthenticated.value = true;
      toast.success('Login erfolgreich!');
      return true; // Erfolg: true zurückgeben
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        toast.error('Benutzername oder Passwort ist falsch');
      } else {
        toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      }
      return false; // Fehler: false zurückgeben
    }
  };
  

  const logout = () => {
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('authToken');
    apiClient.defaults.headers['Authorization'] = '';
  };

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };
});
