// ============================================================
//  src/services/conexaoService.ts
// ============================================================
import api from './api';
 
export interface Conexao {
  id: number;
  userId: number;
  nome: string;
  fotoUrl: string | null;
  status: string;
  criadoEm: string;
}
 
export interface UserBusca {
  id: number;
  nome: string;
  email: string;
  fotoUrl: string | null;
  bio: string | null;
  pontos: number;
}
 
export const conexaoService = {
  async listar(): Promise<Conexao[]> {
    const response = await api.get('/api/conexoes');
    return response.data;
  },
 
  async pendentes(): Promise<Conexao[]> {
    const response = await api.get('/api/conexoes/pendentes');
    return response.data;
  },
 
  async solicitar(receptorId: number): Promise<Conexao> {
    const response = await api.post(`/api/conexoes/${receptorId}`);
    return response.data;
  },
 
  async aceitar(conexaoId: number): Promise<Conexao> {
    const response = await api.patch(`/api/conexoes/${conexaoId}/aceitar`);
    return response.data;
  },
 
  async recusar(conexaoId: number): Promise<Conexao> {
    const response = await api.patch(`/api/conexoes/${conexaoId}/recusar`);
    return response.data;
  },
 
  async remover(conexaoId: number): Promise<void> {
    await api.delete(`/api/conexoes/${conexaoId}`);
  },
 
  async buscar(nome: string): Promise<UserBusca[]> {
    const response = await api.get('/api/conexoes/buscar', { params: { nome } });
    return response.data;
  },
};
 