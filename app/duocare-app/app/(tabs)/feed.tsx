// ============================================================
//  app/(tabs)/feed.tsx — com ícones SVG
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { postService, Post, Comentario } from '../../src/services/postService';
import { colors } from '../../src/theme/colors';
import { IconComment, IconPlus } from '../../src/components/icons/CarePlusIcons';
import Svg, { Path, Line, Circle, Polyline, G } from 'react-native-svg';

// ─── Ícones locais ────────────────────────────────────────────

function IconHeart({ size = 20, filled = false, color = '#6B7280' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#EF4444' : 'none'}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={filled ? '#EF4444' : color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconSend({ size = 20, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="22,2 15,22 11,13 2,9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconDots({ size = 18, color = '#6B7280' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx="5" cy="12" r="1.5" />
      <Circle cx="12" cy="12" r="1.5" />
      <Circle cx="19" cy="12" r="1.5" />
    </Svg>
  );
}

function IconGlobe({ size = 16, color = '#6B7280' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

function IconUsers({ size = 16, color = '#6B7280' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconClose({ size = 14, color = '#6B7280' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
  );
}

function IconEmpty({ size = 64, color = '#D1D5DB' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Rect x="8" y="12" width="48" height="40" rx="8" stroke={color} strokeWidth="2.5" />
      <Line x1="16" y1="24" x2="48" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="16" y1="32" x2="40" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="16" y1="40" x2="32" y2="40" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Precisamos importar Rect do react-native-svg ────────────
import { Rect } from 'react-native-svg';

// ─── Avatar ─────────────────────────────────────────────────
function Avatar({ nome, size = 40 }: { nome: string; size?: number }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{iniciais}</Text>
    </View>
  );
}

// ─── Tempo relativo ─────────────────────────────────────────
function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ─── Modal de comentários ─────────────────────────────────────
function ModalComentarios({ post, visible, onClose, onUpdate }: {
  post: Post | null; visible: boolean;
  onClose: () => void; onUpdate: (p: Post) => void;
}) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { if (visible && post) carregarComentarios(); }, [visible, post]);

  async function carregarComentarios() {
    if (!post) return;
    setLoading(true);
    try { setComentarios(await postService.listarComentarios(post.id)); }
    catch { Alert.alert('Erro', 'Não foi possível carregar comentários.'); }
    finally { setLoading(false); }
  }

  async function enviar() {
    if (!texto.trim() || !post) return;
    setEnviando(true);
    try {
      const novo = await postService.comentar(post.id, texto.trim());
      setComentarios(prev => [...prev, novo]);
      setTexto('');
      onUpdate({ ...post, totalComentarios: post.totalComentarios + 1 });
    } catch { Alert.alert('Erro', 'Não foi possível enviar o comentário.'); }
    finally { setEnviando(false); }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.modalComentarios}>
          <View style={styles.modalCmtHeader}>
            <Text style={styles.modalCmtTitulo}>Comentários</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCmtClose}>
              <IconClose size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>
          ) : comentarios.length === 0 ? (
            <View style={styles.centeredEmpty}>
              <IconComment size={48} color={colors.border} strokeWidth={1.2} />
              <Text style={styles.emptyTitle}>Nenhum comentário ainda</Text>
              <Text style={styles.emptySub}>Seja o primeiro a comentar!</Text>
            </View>
          ) : (
            <FlatList
              data={comentarios}
              keyExtractor={c => String(c.id)}
              contentContainerStyle={{ padding: 16, gap: 16 }}
              renderItem={({ item }) => (
                <View style={styles.comentarioItem}>
                  <Avatar nome={item.nomeUsuario} size={36} />
                  <View style={styles.comentarioBody}>
                    <View style={styles.comentarioHeader}>
                      <Text style={styles.comentarioNome}>{item.nomeUsuario}</Text>
                      <Text style={styles.comentarioTempo}>{tempoRelativo(item.criadoEm)}</Text>
                    </View>
                    <Text style={styles.comentarioTexto}>{item.conteudo}</Text>
                  </View>
                </View>
              )}
            />
          )}

          <View style={styles.inputComentarioWrapper}>
            <TextInput
              style={styles.inputComentario}
              placeholder="Escreva um comentário..."
              placeholderTextColor={colors.textLight}
              value={texto}
              onChangeText={setTexto}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.btnEnviar, (!texto.trim() || enviando) && styles.btnEnviarDisabled]}
              onPress={enviar}
              disabled={!texto.trim() || enviando}
            >
              {enviando
                ? <ActivityIndicator color={colors.white} size="small" />
                : <IconSend size={18} color={colors.white} />
              }
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Card de post ─────────────────────────────────────────────
function CardPost({ post, onCurtir, onComentar, onDelete, meId }: {
  post: Post; onCurtir: (id: number) => void;
  onComentar: (p: Post) => void; onDelete: (id: number) => void; meId: number;
}) {
  const isMeu = post.userId === meId;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar nome={post.nomeUsuario} />
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardNome}>{post.nomeUsuario}</Text>
          <Text style={styles.cardTempo}>{tempoRelativo(post.criadoEm)}</Text>
        </View>
        {isMeu && (
          <TouchableOpacity
            onPress={() => Alert.alert('Deletar post', 'Tem certeza?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Deletar', style: 'destructive', onPress: () => onDelete(post.id) },
            ])}
            style={styles.cardMenu}
          >
            <IconDots size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.cardConteudo}>{post.conteudo}</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onCurtir(post.id)}>
          <IconHeart size={20} filled={post.curtidoPorMim} />
          <Text style={[styles.actionText, post.curtidoPorMim && styles.actionTextActive]}>
            {post.totalCurtidas}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onComentar(post)}>
          <IconComment size={20} color={colors.textSecondary} strokeWidth={1.8} />
          <Text style={styles.actionText}>{post.totalComentarios}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Modal novo post ──────────────────────────────────────────
function ModalNovoPost({ visible, onClose, onPublicar }: {
  visible: boolean; onClose: () => void;
  onPublicar: (texto: string) => Promise<void>;
}) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);

  async function publicar() {
    if (!texto.trim()) return;
    setLoading(true);
    try { await onPublicar(texto.trim()); setTexto(''); onClose(); }
    finally { setLoading(false); }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.modalNovoPost}>
          <View style={styles.modalNovoHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalNovoCancelar}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalNovoTitulo}>Novo post</Text>
            <TouchableOpacity
              style={[styles.modalNovoPublicar, (!texto.trim() || loading) && styles.modalNovoPublicarDisabled]}
              onPress={publicar}
              disabled={!texto.trim() || loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.modalNovoPublicarText}>Publicar</Text>
              }
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.inputNovoPost}
            placeholder="Compartilhe sua conquista, dica ou motivação..."
            placeholderTextColor={colors.textLight}
            value={texto}
            onChangeText={setTexto}
            multiline
            autoFocus
            maxLength={1000}
          />
          <Text style={styles.contadorTexto}>{texto.length}/1000</Text>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Tela Feed ────────────────────────────────────────────────
export default function FeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalPost, setModalPost] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState<Post | null>(null);
  const [aba, setAba] = useState<'global' | 'conexoes'>('global');

  async function carregar() {
    try {
      const data = aba === 'global'
        ? await postService.feedGlobal()
        : await postService.feedConexoes();
      setPosts(data);
    } catch { Alert.alert('Erro', 'Não foi possível carregar o feed.'); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { setLoading(true); carregar(); }, [aba]);
  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, [aba]);

  async function handleCurtir(postId: number) {
    try {
      const updated = await postService.curtir(postId);
      setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    } catch { Alert.alert('Erro', 'Não foi possível curtir o post.'); }
  }

  async function handlePublicar(texto: string) {
    try {
      const novo = await postService.criarPost(texto);
      setPosts(prev => [novo, ...prev]);
    } catch { Alert.alert('Erro', 'Não foi possível publicar o post.'); throw new Error(); }
  }

  async function handleDelete(postId: number) {
    try {
      await postService.deletar(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch { Alert.alert('Erro', 'Não foi possível deletar o post.'); }
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity style={styles.btnNovoPost} onPress={() => setModalPost(true)}>
          <IconPlus size={16} color={colors.white} strokeWidth={2.5} />
          <Text style={styles.btnNovoPostText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, aba === 'global' && styles.tabActive]}
          onPress={() => setAba('global')}
        >
          <View style={styles.tabInner}>
            <IconGlobe size={14} color={aba === 'global' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, aba === 'global' && styles.tabTextActive]}>Global</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, aba === 'conexoes' && styles.tabActive]}
          onPress={() => setAba('conexoes')}
        >
          <View style={styles.tabInner}>
            <IconUsers size={14} color={aba === 'conexoes' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, aba === 'conexoes' && styles.tabTextActive]}>Conexões</Text>
          </View>
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <View style={styles.centeredEmpty}>
          <IconEmpty size={64} color={colors.border} />
          <Text style={styles.emptyTitle}>Nenhum post ainda</Text>
          <Text style={styles.emptySub}>
            {aba === 'global' ? 'Seja o primeiro a publicar!' : 'Conecte-se com outras pessoas para ver posts aqui.'}
          </Text>
          {aba === 'global' && (
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalPost(true)}>
              <Text style={styles.emptyBtnText}>Publicar agora</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={p => String(p.id)}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <CardPost
              post={item}
              meId={user?.userId ?? 0}
              onCurtir={handleCurtir}
              onComentar={setPostSelecionado}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      <ModalNovoPost visible={modalPost} onClose={() => setModalPost(false)} onPublicar={handlePublicar} />
      <ModalComentarios
        post={postSelecionado}
        visible={!!postSelecionado}
        onClose={() => setPostSelecionado(null)}
        onUpdate={p => setPosts(prev => prev.map(x => x.id === p.id ? p : x))}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centeredEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  btnNovoPost: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  btnNovoPostText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  tabs: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: 20, paddingBottom: 12, gap: 8,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: colors.background },
  tabActive: { backgroundColor: colors.primary },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  card: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardHeaderInfo: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardTempo: { fontSize: 12, color: colors.textLight },
  cardMenu: { padding: 6 },
  cardConteudo: { fontSize: 15, color: colors.text, lineHeight: 22 },
  cardFooter: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  actionTextActive: { color: colors.error },

  avatar: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryDark, fontWeight: '700' },

  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  emptyBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },

  modalComentarios: { flex: 1, backgroundColor: colors.white },
  modalCmtHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalCmtTitulo: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalCmtClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
  },
  comentarioItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  comentarioBody: { flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 10 },
  comentarioHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  comentarioNome: { fontSize: 13, fontWeight: '700', color: colors.text },
  comentarioTempo: { fontSize: 11, color: colors.textLight },
  comentarioTexto: { fontSize: 14, color: colors.text, lineHeight: 20 },
  inputComentarioWrapper: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white,
  },
  inputComentario: {
    flex: 1, minHeight: 44, maxHeight: 100,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: colors.text, backgroundColor: colors.background,
  },
  btnEnviar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  btnEnviarDisabled: { backgroundColor: colors.border },

  modalNovoPost: { flex: 1, backgroundColor: colors.white },
  modalNovoHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalNovoTitulo: { fontSize: 17, fontWeight: '700', color: colors.text },
  modalNovoCancelar: { fontSize: 16, color: colors.textSecondary },
  modalNovoPublicar: {
    backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
  },
  modalNovoPublicarDisabled: { backgroundColor: colors.border },
  modalNovoPublicarText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  inputNovoPost: {
    flex: 1, padding: 20, fontSize: 17, color: colors.text,
    textAlignVertical: 'top', lineHeight: 26,
  },
  contadorTexto: { textAlign: 'right', paddingHorizontal: 20, paddingBottom: 12, fontSize: 12, color: colors.textLight },
});