// src/services/userService.ts
import api from './api';

export interface UserProfile {
  id: number;
  nome: string;
  bio: string | null;
  pontos: number;
  ligaNome: string;
  ligaCor: string;
  fotoUrl?: string | null;       // 🆕 adicionado
}

export interface Post {
  id: number;
  userId: number;
  nomeUsuario: string;
  conteudo: string;
  criadoEm: string;
  totalCurtidas: number;
  totalComentarios: number;
  curtidoPorMim: boolean;
  fotoUsuario?: string | null;
}

export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  fotoUrl: string | null;
  bio: string | null;
  pontos: number;
  criadoEm: string;
}

export async function atualizarFoto(fotoBase64: string): Promise<UserResponse> {
  const response = await api.put('/api/users/me', {
    fotoUrl: fotoBase64
  });
  return response.data;
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
    return data.map((post: any) => ({
      ...post,
      userId: post.userId ?? post.user?.id,
    }));
  },

  async getMe(): Promise<{ userId: number; nome: string; pontos: number; fotoUrl?: string }> {
    const response = await api.get('/api/users/me');
    const { id, nome, pontos, fotoUrl } = response.data;
    return { userId: id, nome, pontos, fotoUrl };
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