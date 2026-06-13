import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://10.0.2.2:8080';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('careplus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔑 [API] ${config.method?.toUpperCase()} ${config.url} - Token adicionado`);
  } else {
    console.warn(`⚠️ [API] ${config.method?.toUpperCase()} ${config.url} - Nenhum token`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;