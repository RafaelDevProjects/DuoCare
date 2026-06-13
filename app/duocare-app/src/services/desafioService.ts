// src/services/desafioService.ts
import api from './api';

export interface Desafio {
  id: number;
  titulo: string;
  descricao: string;
  dicas?: string;               // ← adicionado (opcional)
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
  descricao: string;            // ← adicionado
  dicas?: string;               // ← adicionado
  metaValor: number;
  metaUnidade: string;
  progressoAtual: number;
  percentual: number;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ABANDONADO';
  pontosGanhos: number;
  pontosRecompensa: number;     // ← adicionado (total possível)
  iniciadoEm: string;
  concluidoEm: string | null;
  prazoFinal: string;           // ← adicionado
  nivel: string;
  categoriaNome: string;
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

  async meusTodosDesafios(): Promise<UserDesafio[]> {
  const response = await api.get('/api/desafios/meus/todos');
  return response.data;
}
};