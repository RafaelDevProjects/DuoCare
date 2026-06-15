// app/(tabs)/desafios.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  IconForca,
} from '../../src/components/icons/CarePlusIcons';
import Svg, { Path, Polygon, Circle, Line } from 'react-native-svg';
import { useSubscription } from '../../src/contexts/SocketContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CATEGORIA_CONFIG: Record<string, { nome: string; Icon: React.ComponentType<any>; cor: string }> = {
  CORRIDA:    { nome: 'Corrida',    Icon: IconCorrida,    cor: colors.success },
  HIDRATACAO: { nome: 'Hidratação', Icon: IconHidratacao, cor: colors.primary },
  MEDITACAO:  { nome: 'Meditação',  Icon: IconMeditacao,  cor: colors.accent },
  NUTRICAO:   { nome: 'Nutrição',   Icon: IconNutricao,   cor: colors.warning },
  FORCA:      { nome: 'Força',      Icon: IconForca,      cor: colors.forca ?? '#EF4444' },
};

const CATEGORIAS = Object.entries(CATEGORIA_CONFIG).map(([key, val]) => ({
  key,
  nome: val.nome,
  Icon: val.Icon,
  cor: val.cor,
}));

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

function IconTarget({ size = 24, color = colors.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="6"  stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="2"  fill={color} />
    </Svg>
  );
}

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
  const categoria = CATEGORIA_CONFIG[ud.categoriaNome];
  const CategoriaIcon = categoria?.Icon || IconCorrida;
  const categoriaCor = categoria?.cor || colors.primary;

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
              <View style={[styles.cardIconWrapper, { backgroundColor: categoriaCor + '22' }]}>
                <CategoriaIcon size={28} color={categoriaCor} strokeWidth={1.8} />
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
  const categoria = CATEGORIA_CONFIG[desafio.categoriaNome];
  const CategoriaIcon = categoria?.Icon || IconCorrida;
  const categoriaCor = categoria?.cor || colors.primary;

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
          <View style={[styles.cardDispIconWrapper, { backgroundColor: categoriaCor + '22' }]}>
            <CategoriaIcon size={32} color={categoriaCor} strokeWidth={1.8} />
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

// Componente de carrossel de categorias (sem onScroll)
function CategoriaCarousel({ categorias, selectedKey, onSelectCategory }: {
  categorias: { key: string; nome: string; Icon: React.ComponentType<any>; cor: string }[];
  selectedKey: string;
  onSelectCategory: (key: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const index = categorias.findIndex(c => c.key === selectedKey);
    if (index !== -1 && containerWidth > 0 && scrollRef.current) {
      const itemWidth = 80;
      const offset = index * itemWidth - containerWidth / 2 + itemWidth / 2;
      scrollRef.current.scrollTo({ x: Math.max(0, offset), animated: true });
    }
  }, [selectedKey, containerWidth]);

  return (
    <View style={styles.categoriaContainer} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriaScrollContent}
      >
        {categorias.map((cat) => {
          const isSelected = cat.key === selectedKey;
          return (
            <TouchableOpacity
              key={cat.key}
              style={styles.categoriaItem}
              onPress={() => onSelectCategory(cat.key)}
              activeOpacity={0.7}
            >
              <cat.Icon size={28} color={isSelected ? cat.cor : colors.textSecondary} strokeWidth={1.8} />
              <Text style={[styles.categoriaNome, isSelected && { color: cat.cor, fontWeight: '600' }]}>
                {cat.nome}
              </Text>
              {isSelected && <View style={[styles.categoriaUnderline, { backgroundColor: cat.cor }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function DesafiosScreen() {
  const { user, refreshUser } = useAuth();
  const [aba, setAba] = useState<'ativos' | 'disponiveis'>('ativos');
  const [ativos, setAtivos] = useState<UserDesafio[]>([]);
  const [disponiveis, setDisponiveis] = useState<Desafio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('CORRIDA');
  const [categoriaAtivaSelecionada, setCategoriaAtivaSelecionada] = useState<string>('TODOS');

  const headerFade = useRef(new Animated.Value(0)).current;
  const tabSlide   = useRef(new Animated.Value(-20)).current;

  const categoriasAtivas = useMemo(() => {
    const cats = new Set(ativos.map(a => a.categoriaNome));
    return ['TODOS', ...Array.from(cats).sort()];
  }, [ativos]);

  const ativosFiltrados = useMemo(() => {
    if (categoriaAtivaSelecionada === 'TODOS') return ativos;
    return ativos.filter(a => a.categoriaNome === categoriaAtivaSelecionada);
  }, [ativos, categoriaAtivaSelecionada]);

  const idsAtivos = useMemo(() => new Set(ativos.map((a) => a.desafioId)), [ativos]);

  const desafiosFiltrados = useMemo(() => {
    return disponiveis.filter(d => 
      d.categoriaNome === categoriaSelecionada && !idsAtivos.has(d.id)
    );
  }, [disponiveis, categoriaSelecionada, idsAtivos]);

  // Ordenar por dificuldade
  const sortByDifficulty = <T extends { nivel: string }>(items: T[]): T[] => {
    const order: Record<string, number> = { FACIL: 0, MEDIO: 1, DIFICIL: 2 };
    return [...items].sort((a, b) => (order[a.nivel] ?? 999) - (order[b.nivel] ?? 999));
  };

  const ativosOrdenados = useMemo(() => sortByDifficulty(ativosFiltrados), [ativosFiltrados]);
  const disponiveisOrdenados = useMemo(() => sortByDifficulty(desafiosFiltrados), [desafiosFiltrados]);

  const categoriasAtivasParaCarrossel = useMemo(() => {
    return categoriasAtivas.map(cat => {
      if (cat === 'TODOS') {
        return {
          key: 'TODOS',
          nome: 'Todos',
          Icon: () => <IconTarget size={24} color={colors.primary} />,
          cor: colors.primary,
        };
      }
      const config = CATEGORIA_CONFIG[cat];
      return {
        key: cat,
        nome: config?.nome || cat,
        Icon: config?.Icon || IconCorrida,
        cor: config?.cor || colors.primary,
      };
    });
  }, [categoriasAtivas]);

  useSubscription(
    `/topic/desafios/${user?.userId}`,
    useCallback((payload) => {
      if (payload.tipo === 'DESAFIO_CONCLUIDO') {
        const udConcluido = payload.dados as UserDesafio;
        setAtivos(prev => prev.map(ud => ud.id === udConcluido.id ? udConcluido : ud));
        refreshUser();
        Alert.alert('🎉 Parabéns!', payload.mensagem);
      }
    }, [refreshUser, user?.userId])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(tabSlide,   { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    carregar();
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

  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  async function iniciarDesafio(desafioId: number) {
    try {
      await desafioService.iniciarDesafio(desafioId);
      Alert.alert('Desafio iniciado!', 'Boa sorte! Você consegue!');
      await carregar();
      setAba('ativos');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.mensagem || 'Erro ao iniciar desafio.');
    }
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  // Helper para renderizar seções agrupadas por dificuldade
  const renderGroupedChallenges = (items: any[], isActive: boolean) => {
    const levels = [
      { key: 'FACIL', label: 'Fácil' },
      { key: 'MEDIO', label: 'Médio' },
      { key: 'DIFICIL', label: 'Difícil' },
    ];
    return levels.map(level => {
      const filtered = items.filter(i => i.nivel === level.key);
      if (filtered.length === 0) return null;
      return (
        <View key={level.key}>
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionDividerText}>{level.label}</Text>
            <View style={styles.dividerLine} />
          </View>
          {filtered.map((item, idx) => (
            isActive ? (
              <CardAtivo key={item.id} ud={item} onAtualizar={carregar} index={idx} />
            ) : (
              <CardDisponivel
                key={item.id} 
                desafio={item}
                jaIniciado={false}
                onIniciar={iniciarDesafio}
                index={idx}
              />
            )
          ))}
        </View>
      );
    });
  };

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
            Disponíveis ({disponiveisOrdenados.length})
          </Text>
          {aba === 'disponiveis' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </Animated.View>

      {/* Carrossel para ativos */}
      {aba === 'ativos' && categoriasAtivasParaCarrossel.length > 1 && (
        <CategoriaCarousel
          categorias={categoriasAtivasParaCarrossel}
          selectedKey={categoriaAtivaSelecionada}
          onSelectCategory={setCategoriaAtivaSelecionada}
        />
      )}

      {/* Carrossel para disponíveis */}
      {aba === 'disponiveis' && (
        <CategoriaCarousel
          categorias={CATEGORIAS}
          selectedKey={categoriaSelecionada}
          onSelectCategory={setCategoriaSelecionada}
        />
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {aba === 'ativos' ? (
          ativosOrdenados.length === 0 ? (
            <EmptyDesafios onExplorar={() => setAba('disponiveis')} />
          ) : (
            renderGroupedChallenges(ativosOrdenados, true)
          )
        ) : (
          disponiveisOrdenados.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum desafio disponível</Text>
              <Text style={styles.emptySub}>Tente outra categoria ou volte mais tarde.</Text>
            </View>
          ) : (
            renderGroupedChallenges(disponiveisOrdenados, false)
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
  categoriaContainer: { marginVertical: 8, backgroundColor: colors.background },
  categoriaScrollContent: { paddingHorizontal: 16, gap: 12, alignItems: 'center' },
  categoriaItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    minWidth: 80,
    position: 'relative',
  },
  categoriaNome: { fontSize: 12, marginTop: 4, color: colors.textSecondary, fontWeight: '500' },
  categoriaUnderline: {
    position: 'absolute',
    bottom: -4,
    left: '20%',
    width: '60%',
    height: 2,
    borderRadius: 2,
  },
  cardAtivo: { borderRadius: 20, overflow: 'hidden', marginBottom: 4 },
  cardGradient: { padding: 16, borderRadius: 20, gap: 12 },
  cardAtivoHeader: { gap: 6 },
  cardAtivoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconWrapper: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
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
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  sectionDividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
});