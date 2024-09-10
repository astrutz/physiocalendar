// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';
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
  therapistId: number | null; // Füge hier die Therapisten-ID hinzu
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref<User | null>(null); // Definiere das User-Objekt
  const token = ref<string | null>(null);

  onMounted(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      isAuthenticated.value = true; // Falls Token vorhanden, als authentifiziert markieren
      token.value = storedToken;
      apiClient.defaults.headers['Authorization'] = `Bearer ${storedToken}`;
      // Optionale: Benutzerdaten abrufen
      apiClient.get('/auth/user').then(response => {
        user.value = response.data;
      }).catch(error => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      });
    }
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });

      if (response.data === null || response.data.token === null) {
        throw new Error('Fehler beim Anmelden: Token nicht gefunden');
      }

      const { token } = response.data;
      localStorage.setItem('authToken', token);
      apiClient.defaults.headers['Authorization'] = `Bearer ${token}`; // Setze den Auth-Header

      // Speichere das Benutzerobjekt
      const userResponse = await apiClient.get('/auth/user'); // Angenommene Route, um die Benutzerdaten zu erhalten

      if (userResponse.data === null) {
        throw new Error('Fehler beim Anmelden: Benutzerdaten nicht gefunden');
      }

      user.value = userResponse.data;
      console.log(user.value);
      console.log('Login erfolgreich, Token gespeichert');
      isAuthenticated.value = true;
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
    token,
    login,
    logout,
  };
});
