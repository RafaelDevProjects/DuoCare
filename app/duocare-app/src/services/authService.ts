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

  async getMe(): Promise<{ userId: number; nome: string; pontos: number }> {
    const response = await api.get('/api/users/me');
    // UserResponse do backend retorna "id", mapeamos para "userId"
    const { id, nome, pontos } = response.data;
    return { userId: id, nome, pontos };
  },
};