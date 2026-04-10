// ============================================================
//  src/services/ligaService.ts
// ============================================================
import api from './api';
 
export interface LigaInfo {
  ligaNome: string;
  ligaCor: string;
  pontos: number;
  pontosMinimo: number;
  pontosMaximo: number;
  pontosParaProxima: number;
}
 
export interface RankingItem {
  posicao: number;
  userId: number;
  nome: string;
  fotoUrl: string | null;
  pontos: number;
  ligaNome: string;
  ligaCor: string;
}
 
export const ligaService = {
  async minhaLiga(): Promise<LigaInfo> {
    const response = await api.get('/api/liga/minha');
    return response.data;
  },
 
  async ranking(limite = 50): Promise<RankingItem[]> {
    const response = await api.get('/api/liga/ranking', { params: { limite } });
    return response.data;
  },
};
 