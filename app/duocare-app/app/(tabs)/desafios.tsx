// app/(tabs)/desafios.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Modal,
  TextInput, Animated, Easing, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { desafioService, UserDesafio, Desafio } from '../../src/services/desafioService';
import { colors } from '../../src/theme/colors';
import {
  IconCorrida, IconHidratacao, IconMeditacao, IconNutricao,
} from '../../src/components/icons/CarePlusIcons';
import Svg, { Path, Polygon, Circle, Line } from 'react-native-svg';
import { useSubscription } from '../../src/contexts/SocketContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

function IconEstrela({ size = 16, color = colors.accent }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Svg>
  );
}

function IconInfo({ size = 16, color = colors.textSecondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="16" x2="12" y2="12" />
      <Line x1="12" y1="8" x2="12.01" y2="8" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

const CATEGORIA_ICON: Record<string, React.ComponentType<any>> = {
  CORRIDA:    IconCorrida,
  HIDRATACAO: IconHidratacao,
  MEDITACAO:  IconMeditacao,
  NUTRICAO:   IconNutricao,
};

const NIVEL_CONFIG = {
  FACIL:   { label: 'Fácil',   color: colors.success, bg: colors.successMuted, gradiente: ['#34D399', '#10B981'] },
  MEDIO:   { label: 'Médio',   color: colors.warning, bg: colors.warningMuted, gradiente: ['#FB923C', '#F59E0B'] },
  DIFICIL: { label: 'Difícil', color: colors.error,   bg: colors.errorMuted,   gradiente: ['#F87171', '#EF4444'] },
};

function tempoRestante(prazoISO: string) {
  if (!prazoISO) return 'Sem prazo';
  const prazo = new Date(prazoISO).getTime();
  const agora = Date.now();
  const diff = prazo - agora;
  if (diff <= 0) return 'Expirado';
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
  if (dias > 0) return `${dias}d ${horas}h`;
  return `${Math.floor(diff / (1000 * 60 * 60))}h`;
}

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
  const [showDetails, setShowDetails] = useState(false);

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
        Alert.alert('🎉 Desafio concluído!', `Você ganhou ${updated.pontosGanhos} pontos!`);
      }
      onAtualizar();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o progresso.');
    } finally {
      setLoading(false);
    }
  }

  const barColor = ud.percentual >= 100 ? colors.success : ud.percentual >= 50 ? colors.primary : colors.warning;
  const nivelInfo = NIVEL_CONFIG[ud.nivel as keyof typeof NIVEL_CONFIG] || NIVEL_CONFIG.FACIL;
  const prazo = tempoRestante(ud.prazoFinal);
  const CategoriaIcon = CATEGORIA_ICON[ud.categoriaNome] || IconCorrida;

  return (
    <>
      <Animated.View style={[styles.cardAtivo, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient
          colors={[barColor + '22', colors.surface]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardAtivoHeader}>
            <View style={styles.cardAtivoTitleRow}>
              <View style={styles.cardIconWrapper}>
                <CategoriaIcon size={28} color={nivelInfo.color} strokeWidth={1.8} />
              </View>
              <Text style={styles.cardAtivoTitulo} numberOfLines={2}>{ud.tituloDesafio}</Text>
              <View style={[styles.nivelBadge, { backgroundColor: nivelInfo.bg }]}>
                <Text style={[styles.nivelText, { color: nivelInfo.color }]}>{nivelInfo.label}</Text>
              </View>
            </View>
            <Text style={styles.cardAtivoSub}>{ud.progressoAtual} / {ud.metaValor} {ud.metaUnidade}</Text>
          </View>

          <View style={styles.progressWrapper}>
            <View style={styles.progressBar}>
              <Animated.View style={[
                styles.progressFill,
                { width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: barColor },
              ]} />
            </View>
            <Text style={[styles.cardAtivoPct, { color: barColor }]}>{ud.percentual.toFixed(0)}%</Text>
          </View>

          <View style={styles.cardAtivoMeta}>
            <View style={styles.metaItem}>
              <IconEstrela size={14} color={colors.accent} />
              <Text style={styles.metaText}>Recompensa: {ud.pontosRecompensa} pts</Text>
            </View>
            <View style={styles.metaItem}>
              <Svg width="12" height="12" viewBox="0 0 12 12">
                <Circle cx="6" cy="6" r="5" fill={prazo === 'Expirado' ? colors.error : colors.warning} />
              </Svg>
              <Text style={[styles.metaText, { color: prazo === 'Expirado' ? colors.error : colors.warning }]}>{prazo}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
              <IconInfo size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {showDetails && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsText}>{ud.descricao || 'Sem descrição'}</Text>
              {ud.dicas && <Text style={styles.dicasText}>💡 Dica: {ud.dicas}</Text>}
              <Text style={styles.rewardText}>🏆 Pontuação total: {ud.pontosRecompensa} pts</Text>
            </View>
          )}

          <TouchableOpacity style={[styles.btnAtualizar, { borderColor: barColor }]} onPress={() => setModal(true)}>
            <Text style={styles.btnAtualizarText}>Atualizar progresso</Text>
          </TouchableOpacity>
        </LinearGradient>
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

function CardDisponivel({ desafio, jaIniciado, onIniciar, index }: {
  desafio: Desafio;
  jaIniciado: boolean;
  onIniciar: (id: number) => void;
  index: number;
}) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showDetails, setShowDetails] = useState(false);

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
      <LinearGradient
        colors={[colors.surface, colors.surfaceHigh]}
        style={styles.cardDispGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardDispTop}>
          <View style={[styles.cardDispIconWrapper, { backgroundColor: nivel.bg }]}>
            <CategoriaIcon size={32} color={nivel.color} strokeWidth={1.8} />
          </View>
          <View style={styles.cardDispInfo}>
            <Text style={styles.cardDispTitulo} numberOfLines={2}>{desafio.titulo}</Text>
            <Text style={styles.cardDispMeta}>Meta: {desafio.metaValor} {desafio.metaUnidade}</Text>
          </View>
          <View style={[styles.nivelBadge, { backgroundColor: nivel.bg }]}>
            <Text style={[styles.nivelText, { color: nivel.color }]}>{nivel.label}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.detailsButton} onPress={() => setShowDetails(!showDetails)}>
          <Text style={styles.detailsButtonText}>{showDetails ? '▼ Menos detalhes' : '▶ Mais detalhes'}</Text>
        </TouchableOpacity>

        {showDetails && (
          <View style={styles.detailsBox}>
            <Text style={styles.detailsText}>{desafio.descricao || 'Sem descrição'}</Text>
            {desafio.dicas && <Text style={styles.dicasText}>💡 Dica: {desafio.dicas}</Text>}
            <Text style={styles.rewardText}>🏆 Recompensa: {desafio.pontosRecompensa} pts</Text>
          </View>
        )}

        <View style={styles.cardDispFooter}>
          <View style={styles.pontosContainer}>
            <IconEstrela size={18} color={colors.accent} />
            <Text style={styles.pontosText}>{desafio.pontosRecompensa} pts</Text>
          </View>
          <TouchableOpacity
            style={[styles.btnIniciar, jaIniciado && styles.btnIniciarDisabled, { backgroundColor: nivel.color }]}
            onPress={handlePress}
            disabled={jaIniciado}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnIniciarText, jaIniciado && styles.btnIniciarTextDisabled]}>
              {jaIniciado ? '✓ Iniciado' : 'Iniciar'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

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

  useSubscription(
    `/topic/desafios/${user?.userId}`,
    useCallback((payload) => {
      if (payload.tipo === 'DESAFIO_CONCLUIDO') {
        const udConcluido = payload.dados as UserDesafio;
        setAtivos(prev => prev.map(ud => ud.id === udConcluido.id ? udConcluido : ud));
        refreshUser();
        Alert.alert('🎉 Parabéns!', payload.mensagem);
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
          <IconEstrela size={16} color={colors.accent} />
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
          {aba === 'ativos' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, aba === 'disponiveis' && styles.tabActive]}
          onPress={() => setAba('disponiveis')}
        >
          <Text style={[styles.tabText, aba === 'disponiveis' && styles.tabTextActive]}>
            Disponíveis ({disponiveis.length})
          </Text>
          {aba === 'disponiveis' && <View style={styles.tabIndicator} />}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20,
    backgroundColor: colors.background,
  },
  headerGreeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  pontosChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.accentMuted, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 30,
    borderWidth: 1, borderColor: colors.accent + '44',
  },
  pontosChipText: { fontSize: 16, fontWeight: '700', color: colors.accent },
  tabs: {
    flexDirection: 'row', backgroundColor: colors.background,
    paddingHorizontal: 20, paddingBottom: 8, gap: 16,
  },
  tab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 30, position: 'relative' },
  tabActive: { backgroundColor: colors.surface },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  tabIndicator: { position: 'absolute', bottom: 0, left: '20%', width: '60%', height: 2, backgroundColor: colors.primary, borderRadius: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
  cardAtivo: { borderRadius: 20, overflow: 'hidden', marginBottom: 4 },
  cardGradient: { padding: 16, borderRadius: 20, gap: 12 },
  cardAtivoHeader: { gap: 6 },
  cardAtivoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  cardAtivoTitulo: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  cardAtivoSub: { fontSize: 13, color: colors.textSecondary, marginLeft: 54 },
  progressWrapper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBar: { flex: 1, height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  cardAtivoPct: { fontSize: 16, fontWeight: '700', width: 45, textAlign: 'right' },
  cardAtivoMeta: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  detailsBox: { backgroundColor: colors.surfaceHigh, padding: 12, borderRadius: 12, gap: 6 },
  detailsText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  dicasText: { fontSize: 12, color: colors.primary, fontStyle: 'italic' },
  rewardText: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  btnAtualizar: { borderWidth: 1.5, borderRadius: 40, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.primaryMuted + '80' },
  btnAtualizarText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  cardDisp: { borderRadius: 20, overflow: 'hidden', marginBottom: 4 },
  cardDispGradient: { padding: 16, borderRadius: 20, gap: 12 },
  cardDispTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  cardDispIconWrapper: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  cardDispInfo: { flex: 1 },
  cardDispTitulo: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardDispMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  detailsButton: { alignSelf: 'flex-start' },
  detailsButtonText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  cardDispFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  pontosContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pontosText: { fontSize: 15, fontWeight: '700', color: colors.accent },
  btnIniciar: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 40, alignItems: 'center' },
  btnIniciarDisabled: { opacity: 0.5 },
  btnIniciarText: { fontSize: 14, fontWeight: '700', color: colors.white },
  btnIniciarTextDisabled: { color: colors.textSecondary },
  nivelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, flexShrink: 0 },
  nivelText: { fontSize: 11, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyMascote: { width: 150, height: 150 },
  emptySombra: { width: 75, height: 10, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30, marginTop: 8 },
  emptyBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
  modalSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  modalInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, height: 54, fontSize: 18, color: colors.text, backgroundColor: colors.background },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  modalConfirm: { flex: 1, backgroundColor: colors.primary, borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center' },
  modalConfirmText: { fontSize: 16, fontWeight: '700', color: colors.white },
});