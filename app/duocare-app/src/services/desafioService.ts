// ============================================================
//  src/services/desafioService.ts
// ============================================================
import api from './api';

export interface Desafio {
  id: number;
  titulo: string;
  descricao: string;
  metaValor: number;
  metaUnidade: string;
  pontosRecompensa: number;
  duracaoDias: number;
  nivel: 'FACIL' | 'MEDIO' | 'DIFICIL';
  categoriaNome: string;
}

export interface UserDesafio {
  id: number;
  desafioId: number;
  tituloDesafio: string;
  metaValor: number;
  metaUnidade: string;
  progressoAtual: number;
  percentual: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ABANDONADO';
  pontosGanhos: number;
  iniciadoEm: string;
  concluidoEm: string | null;
}

export interface ProgressoRequest {
  valor: number;
}

export const desafioService = {
  async listarDisponiveis(): Promise<Desafio[]> {
    const response = await api.get('/api/desafios');
    return response.data;
  },

  async meusDesafios(): Promise<UserDesafio[]> {
    const response = await api.get('/api/desafios/meus');
    return response.data;
  },

  async iniciarDesafio(desafioId: number): Promise<UserDesafio> {
    const response = await api.post(`/api/desafios/${desafioId}/iniciar`);
    return response.data;
  },

  async atualizarProgresso(userDesafioId: number, valor: number): Promise<UserDesafio> {
    const response = await api.patch(`/api/desafios/progresso/${userDesafioId}`, { valor });
    return response.data;
  },
};