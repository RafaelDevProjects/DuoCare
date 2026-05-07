// ============================================================
//  app/(tabs)/liga.tsx — com ícones SVG
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Animated, Easing, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { ligaService, LigaInfo, RankingItem } from '../../src/services/ligaService';
import { colors } from '../../src/theme/colors';
import {
  IconBronze, IconPrata, IconOuro, IconPlatina, IconDiamante, IconSafira,
} from '../../src/components/icons/CarePlusIcons';
import Svg, { Path, Polygon } from 'react-native-svg';

// ─── Ícone de medalha para o pódio ───────────────────────────
function IconMedal({ posicao, size = 32 }: { posicao: number; size?: number }) {
  const medalCores = ['#F59E0B', '#9CA3AF', '#CD7F32'];
  const cor = medalCores[posicao - 1] ?? '#9CA3AF';
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path d="M16 4l3 6h7l-5.5 4.5 2 7L16 18l-6.5 3.5 2-7L6 10h7z"
        stroke={cor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={cor + '22'}/>
      <Path d="M12 22l-2 6M20 22l2 6" stroke={cor} strokeWidth="1.8" strokeLinecap="round"/>
      <Path d="M10 28h12" stroke={cor} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

// ─── Config das ligas com ícones SVG ─────────────────────────
const LIGA_CONFIG: Record<string, {
  desc: string;
  Icon: React.ComponentType<any>;
  cor: string;
}> = {
  Bronze:   { desc: 'Iniciante',    Icon: IconBronze,   cor: '#CD7F32' },
  Prata:    { desc: 'Comprometido', Icon: IconPrata,    cor: '#9CA3AF' },
  Ouro:     { desc: 'Dedicado',     Icon: IconOuro,     cor: '#F59E0B' },
  Platina:  { desc: 'Avançado',     Icon: IconPlatina,  cor: '#6B7280' },
  Diamante: { desc: 'Elite',        Icon: IconDiamante, cor: '#3B82F6' },
  Safira:   { desc: 'Lendário',     Icon: IconSafira,   cor: '#0F52BA' },
};

// ─── Avatar com iniciais ─────────────────────────────────────
function Avatar({ nome, size = 40, cor }: { nome: string; size?: number; cor?: string }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: cor ? `${cor}22` : colors.primaryLight },
    ]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38, color: cor ?? colors.primaryDark }]}>
        {iniciais}
      </Text>
    </View>
  );
}

// ─── Card da minha liga ──────────────────────────────────────
function CardMinhaLiga({ liga }: { liga: LigaInfo }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const barAnim   = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const config = LIGA_CONFIG[liga.ligaNome];
  const LigaIcon = config?.Icon ?? IconBronze;
  const progresso = liga.pontosMaximo > liga.pontosMinimo
    ? ((liga.pontos - liga.pontosMinimo) / (liga.pontosMaximo - liga.pontosMinimo)) * 100
    : 100;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start();

    Animated.timing(barAnim, {
      toValue: Math.min(progresso, 100) / 100,
      duration: 1200, delay: 400,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.cardLiga, { opacity: fadeAnim, transform: [{ scale: scaleAnim }], borderColor: liga.ligaCor }]}>
      <View style={styles.cardLigaTop}>
        <Animated.Image
          source={require('../../assets/mascote.png')}
          style={[styles.ligaMascote, { transform: [{ translateY: floatAnim }] }]}
          resizeMode="contain"
        />
        <View style={styles.cardLigaInfo}>
          <View style={styles.ligaBadge}>
            {/* Ícone SVG da liga */}
            <View style={[styles.ligaIconWrapper, { backgroundColor: liga.ligaCor + '18' }]}>
              <LigaIcon size={36} color={liga.ligaCor} strokeWidth={1.8} />
            </View>
            <View>
              <Text style={[styles.ligaNome, { color: liga.ligaCor }]}>{liga.ligaNome}</Text>
              <Text style={styles.ligaDesc}>{config?.desc}</Text>
            </View>
          </View>
          <Text style={styles.ligaPontos}>{liga.pontos.toLocaleString()} pts</Text>
        </View>
      </View>

      <View style={styles.ligaProgressWrapper}>
        <View style={styles.ligaProgressBar}>
          <Animated.View style={[
            styles.ligaProgressFill,
            {
              width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: liga.ligaCor,
            },
          ]} />
        </View>
        <Text style={styles.ligaProgressText}>
          {liga.pontosParaProxima > 0
            ? `Faltam ${liga.pontosParaProxima.toLocaleString()} pts para a próxima liga`
            : 'Você está na liga máxima!'}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Item do ranking ─────────────────────────────────────────
function ItemRanking({ item, index, meId }: { item: RankingItem; index: number; meId: number }) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const config = LIGA_CONFIG[item.ligaNome];
  const LigaIcon = config?.Icon ?? IconBronze;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const isMe = item.userId === meId;

  return (
    <Animated.View style={[
      styles.rankingItem,
      isMe && styles.rankingItemMe,
      { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
    ]}>
      {/* Posição: ícone de medalha para top 3, número para o resto */}
      <View style={styles.rankingPosWrapper}>
        {item.posicao <= 3
          ? <IconMedal posicao={item.posicao} size={28} />
          : <Text style={styles.rankingPos}>{item.posicao}º</Text>
        }
      </View>

      <Avatar nome={item.nome} size={40} cor={item.ligaCor} />

      <View style={styles.rankingInfo}>
        <Text style={styles.rankingNome} numberOfLines={1}>
          {item.nome}{isMe ? ' (você)' : ''}
        </Text>
        <View style={styles.rankingLigaRow}>
          <LigaIcon size={14} color={item.ligaCor} strokeWidth={2} />
          <Text style={[styles.rankingLiga, { color: item.ligaCor }]}>{item.ligaNome}</Text>
        </View>
      </View>

      <Text style={styles.rankingPontos}>{item.pontos.toLocaleString()}</Text>
    </Animated.View>
  );
}

// ─── Pódio top 3 animado ─────────────────────────────────────
function Podio({ top3 }: { top3: RankingItem[] }) {
  const scaleAnims = [0, 1, 2].map(() => useRef(new Animated.Value(0)).current);
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    [1, 0, 2].forEach((idx, i) => {
      Animated.spring(scaleAnims[idx], {
        toValue: 1, delay: 200 + i * 150,
        useNativeDriver: true, tension: 70, friction: 8,
      }).start();
    });
  }, []);

  const alturas = [130, 100, 80];
  const ordem   = [1, 0, 2];

  return (
    <Animated.View style={[styles.podio, { opacity: fadeAnim }]}>
      {ordem.map((rankIdx) => {
        const item = top3[rankIdx];
        if (!item) return null;
        return (
          <Animated.View
            key={item.userId}
            style={[styles.podioItem, { transform: [{ scale: scaleAnims[rankIdx] }] }]}
          >
            <IconMedal posicao={rankIdx + 1} size={36} />
            <Avatar nome={item.nome} size={44} cor={item.ligaCor} />
            <Text style={styles.podioNome} numberOfLines={1}>{item.nome.split(' ')[0]}</Text>
            <Text style={styles.podioPontos}>{item.pontos.toLocaleString()}</Text>
            <View style={[styles.podioBase, { height: alturas[rankIdx], backgroundColor: item.ligaCor + '22', borderColor: item.ligaCor + '55' }]}>
              <Text style={[styles.podioPosicao, { color: item.ligaCor }]}>{rankIdx + 1}º</Text>
            </View>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

// ─── Tela Liga ───────────────────────────────────────────────
export default function LigaScreen() {
  const { user } = useAuth();
  const [liga, setLiga] = useState<LigaInfo | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aba, setAba] = useState<'minha' | 'ranking'>('minha');

  async function carregar() {
    try {
      const [ligaRes, rankingRes] = await Promise.all([
        ligaService.minhaLiga(),
        ligaService.ranking(50),
      ]);
      setLiga(ligaRes);
      setRanking(rankingRes);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a liga.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { carregar(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const top3 = ranking.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Liga & Ranking</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, aba === 'minha' && styles.tabActive]} onPress={() => setAba('minha')}>
          <Text style={[styles.tabText, aba === 'minha' && styles.tabTextActive]}>Minha liga</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, aba === 'ranking' && styles.tabActive]} onPress={() => setAba('ranking')}>
          <Text style={[styles.tabText, aba === 'ranking' && styles.tabTextActive]}>Ranking ({ranking.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {aba === 'minha' ? (
          <>
            {liga && <CardMinhaLiga liga={liga} />}

            <Text style={styles.sectionTitle}>Todas as ligas</Text>
            <View style={styles.ligasGrid}>
              {Object.entries(LIGA_CONFIG).map(([nome, cfg]) => {
                const LigaIcon = cfg.Icon;
                const ativa = liga?.ligaNome === nome;
                return (
                  <View key={nome} style={[styles.ligaGridItem, ativa && { borderColor: cfg.cor, backgroundColor: cfg.cor + '11' }]}>
                    {/* Ícone SVG da liga no grid */}
                    <View style={[styles.ligaGridIconWrapper, { backgroundColor: cfg.cor + '18' }]}>
                      <LigaIcon size={28} color={cfg.cor} strokeWidth={1.8} />
                    </View>
                    <Text style={styles.ligaGridNome}>{nome}</Text>
                    <Text style={styles.ligaGridDesc}>{cfg.desc}</Text>
                    {ativa && (
                      <View style={[styles.ligaAtualBadge, { backgroundColor: cfg.cor }]}>
                        <Text style={styles.ligaAtualBadgeText}>atual</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <>
            {top3.length >= 3 && <Podio top3={top3} />}
            <Text style={styles.sectionTitle}>Classificação completa</Text>
            {ranking.map((item, index) => (
              <ItemRanking key={item.userId} item={item} index={index} meId={user?.userId ?? 0} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },

  tabs: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: 20, paddingBottom: 12, gap: 8,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: colors.background },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },

  // Card liga
  cardLiga: {
    backgroundColor: colors.white, borderRadius: 20, padding: 20,
    borderWidth: 2, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardLigaTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ligaMascote: { width: 80, height: 80 },
  cardLigaInfo: { flex: 1, gap: 8 },
  ligaBadge: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ligaIconWrapper: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ligaNome: { fontSize: 22, fontWeight: '700' },
  ligaDesc: { fontSize: 13, color: colors.textSecondary },
  ligaPontos: { fontSize: 28, fontWeight: '700', color: colors.text },

  ligaProgressWrapper: { gap: 6 },
  ligaProgressBar: { height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' },
  ligaProgressFill: { height: '100%', borderRadius: 5 },
  ligaProgressText: { fontSize: 12, color: colors.textSecondary },

  // Grid ligas
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  ligasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ligaGridItem: {
    width: '30%', backgroundColor: colors.white, borderRadius: 14,
    padding: 12, alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: colors.border,
  },
  ligaGridIconWrapper: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ligaGridNome: { fontSize: 12, fontWeight: '700', color: colors.text },
  ligaGridDesc: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
  ligaAtualBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  ligaAtualBadgeText: { fontSize: 10, color: colors.white, fontWeight: '700' },

  // Pódio
  podio: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  podioItem: { alignItems: 'center', flex: 1 },
  podioNome: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: 4, maxWidth: 80, textAlign: 'center' },
  podioPontos: { fontSize: 11, color: colors.textSecondary, marginBottom: 6 },
  podioBase: { width: '100%', borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  podioPosicao: { fontSize: 20, fontWeight: '700' },

  // Ranking
  rankingItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  rankingItemMe: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  rankingPosWrapper: { width: 32, alignItems: 'center' },
  rankingPos: { fontSize: 15, fontWeight: '700', color: colors.textSecondary, textAlign: 'center' },
  rankingInfo: { flex: 1 },
  rankingNome: { fontSize: 15, fontWeight: '700', color: colors.text },
  rankingLigaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rankingLiga: { fontSize: 12, fontWeight: '600' },
  rankingPontos: { fontSize: 15, fontWeight: '700', color: colors.text },

  // Avatar
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700' },
});