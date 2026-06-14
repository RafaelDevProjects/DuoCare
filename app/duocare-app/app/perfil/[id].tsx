// app/perfil/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Animated, RefreshControl,
  FlatList, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { userService, UserProfile, Post } from '../../src/services/userService';
import { postService, Comentario } from '../../src/services/postService';
import { conexaoService, Conexao } from '../../src/services/conexaoService';
import { colors } from '../../src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Polygon, Polyline, Line, Rect } from 'react-native-svg';
import api from '../../src/services/api';


// ─── Ícones ──────────────────────────────────────────────
function IconStar({ size = 16, color = colors.accent }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Svg>
  );
}

function IconTrophy({ size = 18, color = colors.accent }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 21h8M12 17v4M7 4H4a1 1 0 0 0-1 1v3a4 4 0 0 0 4 4M17 4h3a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 4h10v7a5 5 0 0 1-10 0V4z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconUsers({ size = 18, color = colors.secondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function AvatarGrande({ nome, size = 80 }: { nome: string; size?: number }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <View style={[styles.avatarGrande, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarGrandeText, { fontSize: size * 0.38 }]}>{iniciais}</Text>
    </View>
  );
}

function StatCard({ icon, value, label, color: c, delay }: {
  icon: React.ReactNode; value: string | number; label: string; color: string; delay: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, delay, useNativeDriver: true, tension: 70, friction: 8 }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }], borderBottomColor: c + '33', borderBottomWidth: 2 }]}>
      <View style={[styles.statIconBg, { backgroundColor: c + '1A' }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

function PostItem({ post, onCurtir, onComentar }: {
  post: Post;
  onCurtir: (id: number) => void;
  onComentar: (id: number, novoComentario: Comentario) => void;
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
      onComentar(post.id, comentado);
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
    if (post.userId) router.push(`/perfil/${post.userId}`);
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={navegarParaPerfil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(post.nomeUsuario || '?').charAt(0).toUpperCase()}
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

      <Text style={styles.postConteudo}>{post.conteudo}</Text>

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

export default function PerfilUsuarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conexoesCount, setConexoesCount] = useState<number>(0); // 🆕

  type ConexaoStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';
  const [conexaoStatus, setConexaoStatus] = useState<ConexaoStatus>('none');
  const [acaoConexaoLoading, setAcaoConexaoLoading] = useState(false);

  const userId = parseInt(id, 10);
  const isOwnProfile = user?.userId === userId;

  useEffect(() => {
    carregarPerfil();
  }, [userId]);

  useEffect(() => {
    if (!isOwnProfile && userId && user?.userId) {
      carregarStatusConexao();
    }
  }, [userId, user?.userId]);

  async function carregarPerfil() {
    setLoading(true);
    try {
      const perfil = await userService.getUserProfile(userId);
      setProfile(perfil);
      await carregarPosts();
      await carregarConexoesCount(); // 🆕
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o perfil.');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // 🆕 Buscar número de conexões do usuário
  async function carregarConexoesCount() {
    try {
      const response = await api.get(`/api/conexoes/${userId}/contagem`);
      setConexoesCount(response.data);
    } catch (error) {
      console.error('Erro ao carregar contagem de conexões:', error);
      setConexoesCount(0);
    }
  }

  async function carregarPosts() {
    try {
      const [userPosts, userLikes] = await Promise.all([
        userService.getUserPosts(userId),
        userService.getUserLikedPosts(userId),
      ]);
      setPosts(userPosts);
      setLikedPosts(userLikes);
    } catch (error) {
      console.error(error);
    }
  }

  async function carregarStatusConexao() {
    try {
      const [conexoes, pendentesRecebidas, pendentesEnviadas] = await Promise.all([
        conexaoService.listar(),
        conexaoService.pendentes(),
        conexaoService.enviadas(),
      ]);

      const isConnected = conexoes.some(c => c.userId === userId);
      if (isConnected) {
        setConexaoStatus('connected');
        return;
      }

      const temSolicitacaoRecebida = pendentesRecebidas.some(c => c.userId === userId);
      if (temSolicitacaoRecebida) {
        setConexaoStatus('pending_received');
        return;
      }

      const temSolicitacaoEnviada = pendentesEnviadas.some(c => c.userId === userId);
      if (temSolicitacaoEnviada) {
        setConexaoStatus('pending_sent');
        return;
      }

      setConexaoStatus('none');
    } catch (error) {
      console.error('Erro ao carregar status de conexão:', error);
    }
  }

  async function handleSolicitarConexao() {
    if (!userId) return;
    setAcaoConexaoLoading(true);
    try {
      await conexaoService.solicitar(userId);
      Alert.alert('Solicitação enviada!', 'Aguardando a pessoa aceitar.');
      setConexaoStatus('pending_sent');
      setTimeout(() => carregarStatusConexao(), 2000);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.mensagem || 'Não foi possível enviar solicitação.');
    } finally {
      setAcaoConexaoLoading(false);
    }
  }

  async function handleCancelarSolicitacao() {
    if (!userId) return;
    Alert.alert('Cancelar solicitação', `Deseja cancelar a solicitação enviada para ${profile?.nome}?`, [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          setAcaoConexaoLoading(true);
          try {
            await conexaoService.cancelar(userId);
            setConexaoStatus('none');
            Alert.alert('Solicitação cancelada');
          } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.mensagem || 'Não foi possível cancelar a solicitação.');
          } finally {
            setAcaoConexaoLoading(false);
          }
        },
      },
    ]);
  }

  async function handleAceitarConexao() {
    if (!userId) return;
    setAcaoConexaoLoading(true);
    try {
      const pendentes = await conexaoService.pendentes();
      const conexaoPendente = pendentes.find(c => c.userId === userId);
      if (!conexaoPendente) throw new Error('Solicitação não encontrada.');
      await conexaoService.aceitar(conexaoPendente.id);
      Alert.alert('Conectado!', `Agora você e ${profile?.nome} são conexões.`);
      setConexaoStatus('connected');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.mensagem || 'Não foi possível aceitar solicitação.');
    } finally {
      setAcaoConexaoLoading(false);
    }
  }

  async function handleDesconectar() {
    if (!userId) return;
    Alert.alert('Remover conexão', `Deseja remover ${profile?.nome} das suas conexões?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setAcaoConexaoLoading(true);
          try {
            const conexoes = await conexaoService.listar();
            const conexao = conexoes.find(c => c.userId === userId);
            if (!conexao) throw new Error('Conexão não encontrada.');
            await conexaoService.remover(conexao.id);
            setConexaoStatus('none');
            Alert.alert('Conexão removida');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível remover a conexão.');
          } finally {
            setAcaoConexaoLoading(false);
          }
        },
      },
    ]);
  }

  const handleCurtir = async (postId: number) => {
    try {
      const updatedPost = await postService.curtir(postId);
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, curtidoPorMim: updatedPost.curtidoPorMim, totalCurtidas: updatedPost.totalCurtidas } : p)
      );
      setLikedPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, curtidoPorMim: updatedPost.curtidoPorMim, totalCurtidas: updatedPost.totalCurtidas } : p)
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível curtir o post.');
    }
  };

  const handleComentar = (postId: number) => {
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, totalComentarios: p.totalComentarios + 1 } : p)
    );
    setLikedPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, totalComentarios: p.totalComentarios + 1 } : p)
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarPerfil();
    if (!isOwnProfile) carregarStatusConexao();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) return null;

  const currentList = activeTab === 'posts' ? posts : likedPosts;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.userSection}>
          <AvatarGrande nome={profile.nome} size={80} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile.nome}</Text>
            {profile.bio ? <Text style={styles.userBio}>{profile.bio}</Text> : null}
            <View style={[styles.ligaChip, { backgroundColor: profile.ligaCor + '22', borderColor: profile.ligaCor + '44' }]}>
              <IconTrophy size={14} color={profile.ligaCor} />
              <Text style={[styles.ligaChipText, { color: profile.ligaCor }]}>{profile.ligaNome}</Text>
            </View>
          </View>

          {!isOwnProfile && (
            <View style={styles.conexaoButtonContainer}>
              {conexaoStatus === 'connected' && (
                <TouchableOpacity
                  style={[styles.btnConectar, styles.btnDesconectar]}
                  onPress={handleDesconectar}
                  disabled={acaoConexaoLoading}
                >
                  <Text style={styles.btnConectarText}>Conectado</Text>
                </TouchableOpacity>
              )}
              {conexaoStatus === 'pending_received' && (
                <TouchableOpacity
                  style={[styles.btnConectar, styles.btnAceitar]}
                  onPress={handleAceitarConexao}
                  disabled={acaoConexaoLoading}
                >
                  <Text style={styles.btnConectarText}>Aceitar solicitação</Text>
                </TouchableOpacity>
              )}
              {conexaoStatus === 'pending_sent' && (
                <TouchableOpacity
                  style={[styles.btnEnviado]}
                  onPress={handleCancelarSolicitacao}
                  disabled={acaoConexaoLoading}
                >
                  <Text style={styles.btnEnviadoText}>Solicitação enviada</Text>
                </TouchableOpacity>
              )}
              {conexaoStatus === 'none' && (
                <TouchableOpacity
                  style={styles.btnConectar}
                  onPress={handleSolicitarConexao}
                  disabled={acaoConexaoLoading}
                >
                  <Text style={styles.btnConectarText}>Conectar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isOwnProfile && (
            <TouchableOpacity style={styles.btnEditar} onPress={() => router.push('/(tabs)/perfil')}>
              <Text style={styles.btnEditarText}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Estatísticas</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon={<IconStar size={22} color={colors.accent} />}
            value={profile.pontos.toLocaleString()}
            label="Pontos"
            color={colors.accent}
            delay={0}
          />
          <StatCard
            icon={<IconTrophy size={22} color={profile.ligaCor || colors.accent} />}
            value={profile.ligaNome}
            label="Liga"
            color={profile.ligaCor || colors.accent}
            delay={100}
          />
          <StatCard
            icon={<IconUsers size={22} color={colors.secondary} />}
            value={conexoesCount.toLocaleString()}
            label="Conexões"
            color={colors.secondary}
            delay={200}
          />
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'posts' && styles.tabButtonActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons
              name="grid-outline"
              size={28}
              color={activeTab === 'posts' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'likes' && styles.tabButtonActive]}
            onPress={() => setActiveTab('likes')}
          >
            <Ionicons
              name="heart-outline"
              size={28}
              color={activeTab === 'likes' ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {currentList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'posts' ? 'images-outline' : 'heart-outline'}
              size={48}
              color={colors.textLight}
            />
            <Text style={styles.emptyText}>
              {activeTab === 'posts' ? 'Nenhuma publicação ainda.' : 'Nenhuma curtida ainda.'}
            </Text>
          </View>
        ) : (
          currentList.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              onCurtir={handleCurtir}
              onComentar={handleComentar}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (estilos iguais aos do arquivo anterior, sem alterações)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarGrande: {
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary + '44',
  },
  avatarGrandeText: { fontWeight: '700', color: colors.primary },
  userInfo: { flex: 1, gap: 6 },
  userName: { fontSize: 20, fontWeight: '700', color: colors.text },
  userBio: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  ligaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  ligaChipText: { fontSize: 13, fontWeight: '600' },
  btnEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnEditarText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  conexaoButtonContainer: {
    minWidth: 140,
    alignItems: 'flex-end',
  },
  btnConectar: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDesconectar: {
    backgroundColor: colors.errorMuted,
    borderWidth: 1,
    borderColor: colors.error,
  },
  btnAceitar: {
    backgroundColor: colors.success,
  },
  btnEnviado: {
    backgroundColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  btnConectarText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  btnEnviadoText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 0,
    borderBottomWidth: 2,
  },
  statIconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', textAlign: 'center' },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
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
    fontSize: 16,
    color: colors.textSecondary,
  },
});