import api from './api';
 
export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}
 
export interface LoginData {
  email: string;
  senha: string;
}
 
export interface UserData {
  userId: number;
  nome: string;
  pontos: number;
  token: string;
}
 
export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
 
  async login(data: LoginData): Promise<UserData> {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },
};