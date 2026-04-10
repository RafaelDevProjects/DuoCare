import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService, LoginData, RegisterData } from '../services/authService';

interface User {
  userId: number;
  nome: string;
  pontos: number;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedToken = await SecureStore.getItemAsync('careplus_token');
      const storedUser = await SecureStore.getItemAsync('careplus_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(data: LoginData) {
    try {
      console.log('Tentando login:', data.email);
      const response = await authService.login(data);
      console.log('Login OK:', response);
      const userData: User = {
        userId: response.userId,
        nome: response.nome,
        pontos: response.pontos,
      };
      await SecureStore.setItemAsync('careplus_token', response.token);
      await SecureStore.setItemAsync('careplus_user', JSON.stringify(userData));
      setToken(response.token);
      setUser(userData);
    } catch (error: any) {
      console.log('Erro login - status:', error.response?.status);
      console.log('Erro login - data:', JSON.stringify(error.response?.data));
      console.log('Erro login - url:', error.config?.url);
      console.log('Erro login - message:', error.message);
      throw error;
    }
  }

  async function register(data: RegisterData) {
    try {
      console.log('Tentando cadastro:', data.email);
      await authService.register(data);
      console.log('Cadastro OK');
    } catch (error: any) {
      console.log('Erro register - status:', error.response?.status);
      console.log('Erro register - data:', JSON.stringify(error.response?.data));
      console.log('Erro register - url:', error.config?.url);
      console.log('Erro register - message:', error.message);
      throw error;
    }
  }

  async function logout() {
    await SecureStore.deleteItemAsync('careplus_token');
    await SecureStore.deleteItemAsync('careplus_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}