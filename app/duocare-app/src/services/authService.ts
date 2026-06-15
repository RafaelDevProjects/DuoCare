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
  fotoUrl?: string;   // adicionado (opcional)
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

  // 🔁 Adicione 'fotoUrl' no tipo de retorno
  async getMe(): Promise<{ userId: number; nome: string; pontos: number; fotoUrl?: string }> {
    const response = await api.get('/api/users/me');
    const { id, nome, pontos, fotoUrl } = response.data;
    return { userId: id, nome, pontos, fotoUrl };
  },
};