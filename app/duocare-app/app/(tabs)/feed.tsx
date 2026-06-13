// app/(tabs)/feed.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, TextInput,
  Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { postService, Post, Comentario } from '../../src/services/postService';
import { colors } from '../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Componente de Post Individual
function PostItem({ post, onCurtir, onComentar }: {
  post: Post;
  onCurtir: (id: number) => void;
  onComentar: (id: number) => void;
}) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const formatarData = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const carregarComentarios = async () => {
    setLoadingComments(true);
    try {
      const data = await postService.listarComentarios(post.id);
      setComentarios(data);
    } catch (error) {
      console.error('Erro ao carregar comentários', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleEnviarComentario = async () => {
    if (!novoComentario.trim()) return;
    try {
      const comentado = await postService.comentar(post.id, novoComentario);
      setComentarios(prev => [comentado, ...prev]);
      setNovoComentario('');
      onComentar(post.id);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível comentar.');
    }
  };

  const handleToggleComments = () => {
    if (!showComments && comentarios.length === 0) {
      carregarComentarios();
    }
    setShowComments(!showComments);
  };

  const navegarParaPerfil = () => {
    router.push(`/perfil/${post.userId}`);
  };

  return (
    <View style={styles.postCard}>
      {/* Cabeçalho com navegação */}
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={navegarParaPerfil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.nomeUsuario?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={navegarParaPerfil}>
            <Text style={styles.postNome}>{post.nomeUsuario}</Text>
          </TouchableOpacity>
          <Text style={styles.postData}>{formatarData(post.criadoEm)}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      <Text style={styles.postConteudo}>{post.conteudo}</Text>

      {/* Ações */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onCurtir(post.id)}>
          <Ionicons
            name={post.curtidoPorMim ? 'heart' : 'heart-outline'}
            size={22}
            color={post.curtidoPorMim ? colors.error : colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.totalCurtidas}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleToggleComments}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>{post.totalComentarios}</Text>
        </TouchableOpacity>
      </View>

      {/* Seção de comentários */}
      {showComments && (
        <View style={styles.commentsSection}>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escreva um comentário..."
              placeholderTextColor={colors.textLight}
              value={novoComentario}
              onChangeText={setNovoComentario}
              multiline
            />
            <TouchableOpacity onPress={handleEnviarComentario}>
              <Ionicons name="send" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {loadingComments ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
          ) : (
            <FlatList
              data={comentarios}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {item.nomeUsuario?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentNome}>{item.nomeUsuario}</Text>
                    <Text style={styles.commentConteudo}>{item.conteudo}</Text>
                    <Text style={styles.commentData}>{formatarData(item.criadoEm)}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyComments}>Nenhum comentário ainda.</Text>
              }
              style={{ maxHeight: 300 }}
            />
          )}
        </View>
      )}
    </View>
  );
}

// Tela principal do Feed (agora com FlatList)
export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [novoPost, setNovoPost] = useState('');

  const carregarFeed = async () => {
    try {
      const data = await postService.feedGlobal(0, 20);
      setPosts(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o feed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarFeed();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarFeed();
  }, []);

  const handleCurtir = async (postId: number) => {
    try {
      const updatedPost = await postService.curtir(postId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...updatedPost, curtidoPorMim: !post.curtidoPorMim }
            : post
        )
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível curtir o post.');
    }
  };

  const handleComentar = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, totalComentarios: post.totalComentarios + 1 }
          : post
      )
    );
  };

  const handleCriarPost = async () => {
    if (!novoPost.trim()) {
      Alert.alert('Aviso', 'Digite algo para postar.');
      return;
    }
    try {
      const newPost = await postService.criarPost(novoPost);
      setPosts(prev => [newPost, ...prev]);
      setNovoPost('');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o post.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando feed...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header fixo */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity style={styles.postButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onCurtir={handleCurtir}
            onComentar={handleComentar}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>Nenhum post ainda.</Text>
            <Text style={styles.emptySubText}>Seja o primeiro a postar!</Text>
          </View>
        }
      />

      {/* Modal de criação de post */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Post</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="O que você está pensando?"
              placeholderTextColor={colors.textLight}
              value={novoPost}
              onChangeText={setNovoPost}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCriarPost}
              >
                <Text style={styles.submitButtonText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
  },
  postButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  postNome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  postData: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  postConteudo: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  commentsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    maxHeight: 80,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  commentNome: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentConteudo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  commentData: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
  emptyComments: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    width: '90%',
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 16,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  cancelButton: {
    backgroundColor: colors.surfaceHigh,
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
});