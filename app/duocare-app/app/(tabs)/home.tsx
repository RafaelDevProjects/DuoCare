// ============================================================
//  app/(tabs)/home.tsx — Dashboard principal (tema escuro moderno)
// ============================================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { desafioService, UserDesafio, Desafio } from '../../src/services/desafioService';
import { conexaoService } from '../../src/services/conexaoService';
import { postService, Post } from '../../src/services/postService';
import { ligaService, LigaInfo } from '../../src/services/ligaService';
import { colors } from '../../src/theme/colors';
import Svg, { Path, Circle, Polygon, Polyline, Line, Rect } from 'react-native-svg';

// ─── Ícones locais ────────────────────────────────────────────
function IconStar({ size = 16, color = colors.accent }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Svg>
  );
}

function IconChevron({ size = 16, color = colors.textSecondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconFlame({ size = 18, color = colors.warning }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2c0 0-5 5-5 10a5 5 0 0 0 10 0c0-3-2-5-2-5s-1 2-3 2c0 0 2-4 0-7z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function IconTarget({ size = 18, color = colors.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="6"  stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="2"  fill={color} />
    </Svg>
  );
}

function IconHeart({ size = 16, color = colors.error }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconLightning({ size = 16, color = colors.accent }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </Svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────
function Avatar({ nome, size = 40 }: { nome: string; size?: number }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <View style={[st.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[st.avatarText, { fontSize: size * 0.38 }]}>{iniciais}</Text>
    </View>
  );
}

// ─── Seção header ─────────────────────────────────────────────
function SectionHeader({ title, onPress, label = 'Ver todos' }: {
  title: string; onPress?: () => void; label?: string;
}) {
  return (
    <View style={st.sectionHeader}>
      <Text style={st.sectionTitle}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress} style={st.sectionLink}>
          <Text style={st.sectionLinkText}>{label}</Text>
          <IconChevron size={14} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Card de estatística ──────────────────────────────────────
function StatCard({ icon, value, label, color: c }: {
  icon: React.ReactNode; value: string | number; label: string; color: string;
}) {
  return (
    <View style={[st.statCard, { borderBottomColor: c + '33', borderBottomWidth: 2 }]}>
      <View style={[st.statIconBg, { backgroundColor: c + '1A' }]}>{icon}</View>
      <Text style={st.statValue}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Card desafio ativo ───────────────────────────────────────
function CardDesafioAtivo({ ud }: { ud: UserDesafio }) {
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: Math.min(ud.percentual, 100) / 100,
      duration: 1000, delay: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  const pct = ud.percentual;
  const barColor = pct >= 100 ? colors.success : pct >= 50 ? colors.primary : colors.accent;

  return (
    <View style={st.challengeCard}>
      <View style={st.challengeCardTop}>
        <View style={[st.challengeIconBg, { backgroundColor: barColor + '22' }]}>
          <IconTarget size={20} color={barColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.challengeTitle} numberOfLines={1}>{ud.tituloDesafio}</Text>
          <Text style={st.challengeSub}>{ud.progressoAtual} / {ud.metaValor} {ud.metaUnidade}</Text>
        </View>
        <Text style={[st.challengePct, { color: barColor }]}>{pct.toFixed(0)}%</Text>
      </View>
      <View style={st.progressBar}>
        <Animated.View style={[
          st.progressFill,
          {
            width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: barColor,
          },
        ]} />
      </View>
    </View>
  );
}

// ─── Card liga ────────────────────────────────────────────────
function CardLiga({ liga, onPress }: { liga: LigaInfo; onPress: () => void }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const progresso = liga.pontosMaximo > liga.pontosMinimo
    ? ((liga.pontos - liga.pontosMinimo) / (liga.pontosMaximo - liga.pontosMinimo)) * 100
    : 100;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: Math.min(progresso, 100) / 100,
      duration: 1200, delay: 400,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <TouchableOpacity style={st.ligaCard} onPress={onPress} activeOpacity={0.85}>
      <View style={st.ligaCardTop}>
        <View style={[st.ligaIconBg, { backgroundColor: liga.ligaCor + '22' }]}>
          <IconTrophy size={22} color={liga.ligaCor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[st.ligaNome, { color: liga.ligaCor }]}>{liga.ligaNome}</Text>
          <Text style={st.ligaSub}>{liga.pontos.toLocaleString()} pontos</Text>
        </View>
        <View style={st.ligaChevron}>
          <Text style={[st.ligaVerMais, { color: liga.ligaCor }]}>Ranking</Text>
          <IconChevron size={14} color={liga.ligaCor} />
        </View>
      </View>
      <View style={st.progressBar}>
        <Animated.View style={[
          st.progressFill,
          {
            width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: liga.ligaCor,
          },
        ]} />
      </View>
      {liga.pontosParaProxima > 0 && (
        <Text style={st.ligaProgressText}>
          Faltam {liga.pontosParaProxima.toLocaleString()} pts para a próxima liga
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Card recomendação ────────────────────────────────────────
const NIVEL_COLORS = {
  FACIL: colors.success,
  MEDIO: colors.warning,
  DIFICIL: colors.error,
};
const NIVEL_LABELS = { FACIL: 'Fácil', MEDIO: 'Médio', DIFICIL: 'Difícil' };

function CardRecomendacao({ desafio, onIniciar, loading }: {
  desafio: Desafio; onIniciar: () => void; loading: boolean;
}) {
  const cor = NIVEL_COLORS[desafio.nivel] ?? colors.primary;
  return (
    <View style={st.recomCard}>
      <View style={st.recomTop}>
        <View style={[st.recomIcon, { backgroundColor: cor + '22' }]}>
          <IconLightning size={20} color={cor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.recomTitle} numberOfLines={2}>{desafio.titulo}</Text>
          <View style={st.recomMeta}>
            <View style={[st.nivelBadge, { backgroundColor: cor + '22' }]}>
              <Text style={[st.nivelText, { color: cor }]}>{NIVEL_LABELS[desafio.nivel]}</Text>
            </View>
            <Text style={st.recomPontos}>
              <IconStar size={11} color={colors.accent} /> {desafio.pontosRecompensa} pts
            </Text>
          </View>
        </View>
      </View>
      {desafio.descricao ? (
        <Text style={st.recomDesc} numberOfLines={2}>{desafio.descricao}</Text>
      ) : null}
      <TouchableOpacity
        style={[st.recomBtn, loading && { opacity: 0.6 }]}
        onPress={onIniciar}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={colors.white} size="small" />
          : <Text style={st.recomBtnText}>Começar desafio</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

// ─── Mini card de post (com navegação para perfil) ────────────
function MiniPost({ post }: { post: Post }) {
  const router = useRouter();

  const navegarParaPerfil = () => {
    router.push(`/perfil/${post.userId}`);
  };

  return (
    <TouchableOpacity onPress={navegarParaPerfil} activeOpacity={0.7}>
      <View style={st.miniPost}>
        <Avatar nome={post.nomeUsuario} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={st.miniPostNome}>{post.nomeUsuario}</Text>
          <Text style={st.miniPostTexto} numberOfLines={2}>{post.conteudo}</Text>
        </View>
        <View style={st.miniPostMeta}>
          <IconHeart size={13} color={colors.error} />
          <Text style={st.miniPostCount}>{post.totalCurtidas}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Tela Home (Dashboard) ────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conexoes, setConexoes] = useState(0);
  const [ativos, setAtivos] = useState<UserDesafio[]>([]);
  const [desafiosConcluidos, setDesafiosConcluidos] = useState(0);
  const [disponiveis, setDisponiveis] = useState<Desafio[]>([]);
  const [liga, setLiga] = useState<LigaInfo | null>(null);
  const [feed, setFeed] = useState<Post[]>([]);
  const [iniciando, setIniciando] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  async function carregar() {
    try {
      const [conRes, todosDesafiosRes, dispRes, feedRes] = await Promise.all([
        conexaoService.listar(),
        desafioService.meusTodosDesafios(), // NOVO endpoint
        desafioService.listarDisponiveis(),
        postService.feedGlobal(0, 3),
      ]);
      
      setConexoes(conRes.length);
      
      // Separa desafios ativos e concluídos
      const ativosFiltrados = todosDesafiosRes.filter(d => d.status === 'EM_ANDAMENTO');
      const concluidosFiltrados = todosDesafiosRes.filter(d => d.status === 'CONCLUIDO');
      
      setAtivos(ativosFiltrados);
      setDesafiosConcluidos(concluidosFiltrados.length);
      setDisponiveis(dispRes);
      setFeed(feedRes);

      try {
        const ligaRes = await ligaService.minhaLiga();
        setLiga(ligaRes);
      } catch {}

      await refreshUser();
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar o dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }

  useEffect(() => { carregar(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  const idsAtivos = new Set(ativos.map(a => a.desafioId));
  const recomendado = disponiveis.find(d => !idsAtivos.has(d.id)) ?? null;
  const desafioDestaque = ativos[0] ?? null;

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const primeiroNome = user?.nome?.split(' ')[0] ?? '';

  async function handleIniciarRecomendado() {
    if (!recomendado) return;
    setIniciando(true);
    try {
      await desafioService.iniciarDesafio(recomendado.id);
      Alert.alert('Desafio iniciado! 🎯', 'Boa sorte, você consegue!');
      carregar();
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.mensagem ?? 'Erro ao iniciar desafio.');
    } finally {
      setIniciando(false);
    }
  }

  if (loading) {
    return (
      <View style={st.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={st.loadingText}>Carregando seu dashboard…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={st.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Header com avatar e XP */}
          <View style={st.hero}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar nome={user?.nome ?? '?'} size={50} />
              <View>
                <Text style={st.heroGreeting}>{saudacao}, {primeiroNome}! 👋</Text>
                <Text style={st.heroSub}>Continue evoluindo</Text>
              </View>
            </View>
            <View style={st.xpBadge}>
              <IconStar size={16} color={colors.accent} />
              <Text style={st.xpText}>{(user?.pontos ?? 0).toLocaleString()}</Text>
              <Text style={st.xpLabel}>XP</Text>
            </View>
          </View>

          {/* Stats rápidos (4 cards) */}
          <View style={st.statsRow}>
            <StatCard
              icon={<IconUsers size={18} color={colors.secondary} />}
              value={conexoes}
              label="Conexões"
              color={colors.secondary}
            />
            <StatCard
              icon={<IconTarget size={18} color={colors.primary} />}
              value={ativos.length}
              label="Ativos"
              color={colors.primary}
            />
            <StatCard
              icon={<IconTrophy size={18} color={colors.accent} />}
              value={liga?.ligaNome ?? '—'}
              label="Liga"
              color={colors.accent}
            />
            <StatCard
              icon={<IconFlame size={18} color={colors.warning} />}
              value={desafiosConcluidos}
              label="Concluídos"
              color={colors.warning}
            />
          </View>

          {/* Desafio em destaque */}
          {desafioDestaque && (
            <>
              <SectionHeader title="🎯 Em andamento" onPress={() => router.push('/(tabs)/desafios')} />
              <CardDesafioAtivo ud={desafioDestaque} />
            </>
          )}

          {/* Liga atual */}
          {liga && (
            <>
              <SectionHeader title="🏆 Minha liga" onPress={() => router.push('/(tabs)/liga')} label="Ver ranking" />
              <CardLiga liga={liga} onPress={() => router.push('/(tabs)/liga')} />
            </>
          )}

          {/* Recomendação */}
          {recomendado && (
            <>
              <SectionHeader title="⚡ Recomendado para você" />
              <CardRecomendacao desafio={recomendado} onIniciar={handleIniciarRecomendado} loading={iniciando} />
            </>
          )}

          {/* Feed recente */}
          {feed.length > 0 && (
            <>
              <SectionHeader title="📰 Feed recente" onPress={() => router.push('/(tabs)/feed')} />
              <View style={st.feedCard}>
                {feed.slice(0, 3).map((post, i) => (
                  <React.Fragment key={post.id}>
                    <MiniPost post={post} />
                    {i < Math.min(feed.length, 3) - 1 && <View style={st.divider} />}
                  </React.Fragment>
                ))}
                <TouchableOpacity style={st.feedVerMais} onPress={() => router.push('/(tabs)/feed')}>
                  <Text style={st.feedVerMaisText}>Ver feed completo</Text>
                  <IconChevron size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Estado vazio */}
          {!desafioDestaque && !liga && feed.length === 0 && (
            <View style={st.emptyState}>
              <Text style={st.emptyEmoji}>🌱</Text>
              <Text style={st.emptyTitle}>Bem‑vindo ao DuoCare!</Text>
              <Text style={st.emptySub}>Comece um desafio e conecte‑se com pessoas para ver seu progresso aqui.</Text>
              <TouchableOpacity style={st.emptyBtn} onPress={() => router.push('/(tabs)/desafios')}>
                <Text style={st.emptyBtnText}>Explorar desafios</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 20 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos (dark, moderno, arredondado) ─────────────────────
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  scroll: { paddingBottom: 24 },

  hero: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
  },
  heroGreeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  heroSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.accentMuted, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 40, borderWidth: 1, borderColor: colors.accent + '44',
  },
  xpText: { fontSize: 16, fontWeight: '700', color: colors.accent },
  xpLabel: { fontSize: 11, color: colors.accent + 'AA', fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 12,
  },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 20,
    padding: 12, alignItems: 'center', gap: 6,
    borderWidth: 0, borderBottomWidth: 2,
  },
  statIconBg: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionLinkText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  challengeCard: {
    backgroundColor: colors.surface, borderRadius: 24,
    marginHorizontal: 20, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  challengeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  challengeTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  challengeSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  challengePct: { fontSize: 18, fontWeight: '800' },

  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  ligaCard: {
    backgroundColor: colors.surface, borderRadius: 24,
    marginHorizontal: 20, padding: 16, gap: 12,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  ligaCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ligaIconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  ligaNome: { fontSize: 18, fontWeight: '700' },
  ligaSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  ligaChevron: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ligaVerMais: { fontSize: 13, fontWeight: '600' },
  ligaProgressText: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },

  recomCard: {
    backgroundColor: colors.surface, borderRadius: 24,
    marginHorizontal: 20, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  recomTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  recomIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  recomTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  recomMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  nivelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  nivelText: { fontSize: 11, fontWeight: '700' },
  recomPontos: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  recomDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  recomBtn: {
    backgroundColor: colors.primary, borderRadius: 40,
    paddingVertical: 14, alignItems: 'center',
  },
  recomBtnText: { color: colors.background, fontWeight: '700', fontSize: 16 },

  feedCard: {
    backgroundColor: colors.surface, borderRadius: 24,
    marginHorizontal: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  miniPost: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  miniPostNome: { fontSize: 14, fontWeight: '700', color: colors.text },
  miniPostTexto: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  miniPostMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  miniPostCount: { fontSize: 12, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 14 },
  feedVerMais: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border,
  },
  feedVerMaisText: { fontSize: 14, fontWeight: '600', color: colors.primary },

  avatar: { backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: colors.primary },

  emptyState: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 40, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 40, marginTop: 8,
  },
  emptyBtnText: { color: colors.background, fontWeight: '700', fontSize: 16 },
});