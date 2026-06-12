// ============================================================
//  app/(tabs)/desafios.tsx — com ícones SVG
// ============================================================
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSubscription } from '../../src/contexts/SocketContext';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Modal,
  TextInput, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { desafioService, Desafio, UserDesafio } from '../../src/services/desafioService';
import { colors } from '../../src/theme/colors';
import {
  IconCorrida, IconHidratacao, IconMeditacao, IconNutricao,
} from '../../src/components/icons/CarePlusIcons';
import Svg, { Path, Polygon } from 'react-native-svg';

// ─── Ícone de estrela para pontos ────────────────────────────
function IconEstrela({ size = 16, color = '#F59E0B' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Svg>
  );
}

// ─── Helpers ────────────────────────────────────────────────
const NIVEL_CONFIG = {
  FACIL:   { label: 'Fácil',   color: colors.success, bg: '#F0FDF4' },
  MEDIO:   { label: 'Médio',   color: colors.warning, bg: '#FFFBEB' },
  DIFICIL: { label: 'Difícil', color: colors.error,   bg: colors.errorLight },
};

const CATEGORIA_ICON: Record<string, React.ComponentType<any>> = {
  CORRIDA:    IconCorrida,
  HIDRATACAO: IconHidratacao,
  MEDITACAO:  IconMeditacao,
  NUTRICAO:   IconNutricao,
};

// ─── Empty state com mascote flutuando ───────────────────────
function EmptyDesafios({ onExplorar }: { onExplorar: () => void }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
      <Animated.Image
        source={require('../../assets/mascote.png')}
        style={[styles.emptyMascote, { transform: [{ translateY: floatAnim }] }]}
        resizeMode="contain"
      />
      <View style={styles.emptySombra} />
      <Text style={styles.emptyTitle}>Nenhum desafio ativo</Text>
      <Text style={styles.emptySub}>Explore os desafios e comece sua jornada de saúde!</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onExplorar}>
        <Text style={styles.emptyBtnText}>Ver desafios disponíveis</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Card de desafio ativo animado ───────────────────────────
function CardAtivo({ ud, onAtualizar, index }: {
  ud: UserDesafio;
  onAtualizar: () => void;
  index: number;
}) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const barAnim   = useRef(new Animated.Value(0)).current;
  const [modal, setModal] = useState(false);
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: index * 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    Animated.timing(barAnim, {
      toValue: Math.min(ud.percentual, 100) / 100,
      duration: 900, delay: index * 120 + 300,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, []);

  async function salvar() {
    const num = parseFloat(valor.replace(',', '.'));
    if (isNaN(num) || num < 0) { Alert.alert('Atenção', 'Digite um valor válido.'); return; }
    setLoading(true);
    try {
      const updated = await desafioService.atualizarProgresso(ud.id, num);
      setModal(false);
      setValor('');
      if (updated.status === 'CONCLUIDO') {
        Alert.alert('Desafio concluído!', `Você ganhou ${updated.pontosGanhos} pontos!`);
      }
      onAtualizar();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o progresso.');
    } finally {
      setLoading(false);
    }
  }

  const barColor = ud.percentual >= 100 ? colors.success : ud.percentual >= 50 ? colors.primary : colors.warning;

  return (
    <>
      <Animated.View style={[styles.cardAtivo, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.cardAtivoHeader}>
          <View style={styles.cardAtivoTitleRow}>
            <Text style={styles.cardAtivoTitulo} numberOfLines={1}>{ud.tituloDesafio}</Text>
            <Text style={[styles.cardAtivoPct, { color: barColor }]}>{ud.percentual.toFixed(0)}%</Text>
          </View>
          <Text style={styles.cardAtivoSub}>{ud.progressoAtual} / {ud.metaValor} {ud.metaUnidade}</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View style={[
            styles.progressFill,
            { width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: barColor },
          ]} />
        </View>
        <TouchableOpacity style={styles.btnAtualizar} onPress={() => setModal(true)}>
          <Text style={styles.btnAtualizarText}>Atualizar progresso</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Atualizar progresso</Text>
            <Text style={styles.modalSub}>{ud.tituloDesafio}</Text>
            <Text style={styles.modalLabel}>Novo valor ({ud.metaUnidade})</Text>
            <TextInput
              style={styles.modalInput}
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
              placeholder={`Ex: ${ud.metaValor}`}
              placeholderTextColor={colors.textLight}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={salvar} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.modalConfirmText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Card de desafio disponível animado ─────────────────────
function CardDisponivel({ desafio, jaIniciado, onIniciar, index }: {
  desafio: Desafio;
  jaIniciado: boolean;
  onIniciar: (id: number) => void;
  index: number;
}) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const nivel = NIVEL_CONFIG[desafio.nivel] ?? NIVEL_CONFIG.FACIL;
  const CategoriaIcon = CATEGORIA_ICON[desafio.categoriaNome] ?? IconCorrida;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  function handlePress() {
    if (jaIniciado) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start(() => onIniciar(desafio.id));
  }

  return (
    <Animated.View style={[styles.cardDisp, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
      <View style={styles.cardDispTop}>
        <View style={styles.cardDispIconWrapper}>
          <CategoriaIcon size={28} color={colors.primary} strokeWidth={1.8} />
        </View>
        <View style={styles.cardDispInfo}>
          <Text style={styles.cardDispTitulo} numberOfLines={2}>{desafio.titulo}</Text>
          <Text style={styles.cardDispMeta}>Meta: {desafio.metaValor} {desafio.metaUnidade}</Text>
        </View>
        <View style={[styles.nivelBadge, { backgroundColor: nivel.bg }]}>
          <Text style={[styles.nivelText, { color: nivel.color }]}>{nivel.label}</Text>
        </View>
      </View>

      {desafio.descricao ? (
        <Text style={styles.cardDispDesc} numberOfLines={2}>{desafio.descricao}</Text>
      ) : null}

      <View style={styles.cardDispFooter}>
        <View style={styles.pontosContainer}>
          <IconEstrela size={16} color="#F59E0B" />
          <Text style={styles.pontosText}>{desafio.pontosRecompensa} pts</Text>
        </View>
        <TouchableOpacity
          style={[styles.btnIniciar, jaIniciado && styles.btnIniciarDisabled]}
          onPress={handlePress}
          disabled={jaIniciado}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnIniciarText, jaIniciado && styles.btnIniciarTextDisabled]}>
            {jaIniciado ? '✓ Iniciado' : 'Iniciar'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Tela principal ─────────────────────────────────────────
export default function DesafiosScreen() {
  const { user, refreshUser } = useAuth();
  const [aba, setAba] = useState<'ativos' | 'disponiveis'>('ativos');
  const [ativos, setAtivos] = useState<UserDesafio[]>([]);
  const [disponiveis, setDisponiveis] = useState<Desafio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const tabSlide   = useRef(new Animated.Value(-20)).current;
  const idsAtivos  = new Set(ativos.map((a) => a.desafioId));

  // ✅ WebSocket: escuta conclusão de desafios em tempo real
  useSubscription(
    `/topic/desafios/${user?.userId}`,
    useCallback((payload) => {
      if (payload.tipo === 'DESAFIO_CONCLUIDO') {
        const udConcluido = payload.dados as UserDesafio;

        // Atualiza o card do desafio na lista (status e pontuação)
        setAtivos(prev =>
          prev.map(ud => ud.id === udConcluido.id ? udConcluido : ud)
        );

        // Atualiza pontos do usuário no contexto de autenticação
        refreshUser();

        Alert.alert(
          '🏆 Desafio concluído!',
          payload.mensagem,
          [{ text: 'Eba!', style: 'default' }]
        );
      }
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(tabSlide,   { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  

  async function carregar() {
    try {
      // 🔁 Atualiza os pontos do usuário no contexto antes de carregar os desafios
      await refreshUser();
      const [meusRes, dispRes] = await Promise.all([
        desafioService.meusDesafios(),
        desafioService.listarDisponiveis(),
      ]);
      setAtivos(meusRes);
      setDisponiveis(dispRes);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os desafios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  async function iniciarDesafio(desafioId: number) {
    try {
      await desafioService.iniciarDesafio(desafioId);
      Alert.alert('Desafio iniciado!', 'Boa sorte! Você consegue!');
      carregar();
      setAba('ativos');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.mensagem || 'Erro ao iniciar desafio.');
    }
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <View>
          <Text style={styles.headerGreeting}>Olá, {user?.nome?.split(' ')[0]}</Text>
          <Text style={styles.headerSub}>{ativos.length} desafio{ativos.length !== 1 ? 's' : ''} em andamento</Text>
        </View>
        <View style={styles.pontosChip}>
          <IconEstrela size={14} color={colors.primaryDark} />
          <Text style={styles.pontosChipText}>{user?.pontos ?? 0}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.tabs, { transform: [{ translateY: tabSlide }] }]}>
        <TouchableOpacity
          style={[styles.tab, aba === 'ativos' && styles.tabActive]}
          onPress={() => setAba('ativos')}
        >
          <Text style={[styles.tabText, aba === 'ativos' && styles.tabTextActive]}>
            Meus desafios ({ativos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, aba === 'disponiveis' && styles.tabActive]}
          onPress={() => setAba('disponiveis')}
        >
          <Text style={[styles.tabText, aba === 'disponiveis' && styles.tabTextActive]}>
            Disponíveis ({disponiveis.length})
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {aba === 'ativos' ? (
          ativos.length === 0 ? (
            <EmptyDesafios onExplorar={() => setAba('disponiveis')} />
          ) : (
            ativos.map((ud, index) => (
              <CardAtivo key={ud.id} ud={ud} onAtualizar={carregar} index={index} />
            ))
          )
        ) : (
          disponiveis.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum desafio disponível</Text>
              <Text style={styles.emptySub}>Novos desafios em breve!</Text>
            </View>
          ) : (
            disponiveis.map((d, index) => (
              <CardDisponivel
                key={d.id}
                desafio={d}
                jaIniciado={idsAtivos.has(d.id)}
                onIniciar={iniciarDesafio}
                index={index}
              />
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerGreeting: { fontSize: 20, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  pontosChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primaryLight, paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 20,
  },
  pontosChipText: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },

  tabs: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: 20, paddingBottom: 12, gap: 8,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: colors.background },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },

  cardAtivo: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  cardAtivoHeader: { gap: 4 },
  cardAtivoTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardAtivoTitulo: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  cardAtivoPct: { fontSize: 16, fontWeight: '700' },
  cardAtivoSub: { fontSize: 13, color: colors.textSecondary },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  btnAtualizar: {
    backgroundColor: colors.primaryLight, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  btnAtualizarText: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },

  cardDisp: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, gap: 10,
  },
  cardDispTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardDispIconWrapper: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardDispInfo: { flex: 1 },
  cardDispTitulo: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardDispMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  nivelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  nivelText: { fontSize: 11, fontWeight: '700' },
  cardDispDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  cardDispFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pontosContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pontosText: { fontSize: 14, fontWeight: '700', color: colors.text },
  btnIniciar: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  btnIniciarDisabled: { backgroundColor: colors.border },
  btnIniciarText: { fontSize: 14, fontWeight: '700', color: colors.white },
  btnIniciarTextDisabled: { color: colors.textSecondary },

  emptyState: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyMascote: { width: 150, height: 150 },
  emptySombra: { width: 75, height: 10, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.08)', marginTop: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  emptyBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  modalSub: { fontSize: 14, color: colors.textSecondary },
  modalLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  modalInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, height: 52, fontSize: 18,
    color: colors.text, backgroundColor: colors.background,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancel: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  modalConfirm: { flex: 1, backgroundColor: colors.primary, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: colors.white },
});