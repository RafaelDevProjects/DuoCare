// ============================================================
//  src/services/postService.ts
// ============================================================
import api from './api';
 
export interface Post {
  id: number;
  userId: number;
  nomeUsuario: string;
  fotoUsuario: string | null;
  conteudo: string;
  midiaUrl: string | null;
  tipoMidia: string | null;
  desafioRefId: number | null;
  totalCurtidas: number;
  totalComentarios: number;
  curtidoPorMim: boolean;
  criadoEm: string;
}
 
export interface Comentario {
  id: number;
  userId: number;
  nomeUsuario: string;
  fotoUrl: string | null;
  conteudo: string;
  criadoEm: string;
}
 
export const postService = {
  async feedGlobal(pagina = 0, tamanho = 10): Promise<Post[]> {
    const response = await api.get('/api/posts/global', {
      params: { pagina, tamanho },
    });
    // Trata tanto array direto quanto objeto Page do Spring
    const data = response.data;
    return Array.isArray(data) ? data : (data.content ?? []);
  },

  async feedConexoes(pagina = 0, tamanho = 10): Promise<Post[]> {
    const response = await api.get('/api/posts', {
      params: { pagina, tamanho },
    });
    const data = response.data;
    return Array.isArray(data) ? data : (data.content ?? []);
  },
 
  async criarPost(conteudo: string, desafioRefId?: number): Promise<Post> {
    const response = await api.post('/api/posts', { conteudo, desafioRefId });
    return response.data;
  },
 
  async curtir(postId: number): Promise<Post> {
    const response = await api.post(`/api/posts/${postId}/curtir`);
    return response.data;
  },
 
  async listarComentarios(postId: number): Promise<Comentario[]> {
    const response = await api.get(`/api/posts/${postId}/comentarios`);
    return response.data;
  },
 
  async comentar(postId: number, conteudo: string): Promise<Comentario> {
    const response = await api.post(`/api/posts/${postId}/comentarios`, { conteudo });
    return response.data;
  },
 
  async deletar(postId: number): Promise<void> {
    await api.delete(`/api/posts/${postId}`);
  },
};
 