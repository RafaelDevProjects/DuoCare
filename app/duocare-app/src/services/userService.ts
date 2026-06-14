// src/services/userService.ts
import api from './api';

export interface UserProfile {
  id: number;
  nome: string;
  bio: string | null;
  pontos: number;
  ligaNome: string;
  ligaCor: string;
}

export interface Post {
  id: number;
  userId: number;        // ← ADICIONADO
  nomeUsuario: string;   // ← ADICIONADO (opcional, mas útil)
  conteudo: string;
  criadoEm: string;
  totalCurtidas: number;
  totalComentarios: number;
  curtidoPorMim: boolean;
  fotoUsuario?: string | null;
}

export const userService = {
    async getUserConexoesCount(userId: number): Promise<number> {
    const response = await api.get(`/api/conexoes/${userId}/contagem`);
    return response.data;
  },
  async getUserProfile(userId: number): Promise<UserProfile> {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  async getUserPosts(userId: number, page = 0, size = 10): Promise<Post[]> {
    const response = await api.get(`/api/posts/usuario/${userId}`, { params: { pagina: page, tamanho: size } });
    const data = response.data.content ?? response.data;
    // Garante que cada post tenha userId (pode vir do backend como 'userId' ou 'user.id')
    return data.map((post: any) => ({
      ...post,
      userId: post.userId ?? post.user?.id,
    }));
  },

  async getUserLikedPosts(userId: number, page = 0, size = 10): Promise<Post[]> {
    const response = await api.get(`/api/posts/curtidas/usuario/${userId}`, { params: { pagina: page, tamanho: size } });
    const data = response.data.content ?? response.data;
    return data.map((post: any) => ({
      ...post,
      userId: post.userId ?? post.user?.id,
    }));
  },
};