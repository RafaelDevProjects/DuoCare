// ============================================================
//  app/(tabs)/conexoes.tsx — com ícones SVG
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Animated,
  Easing, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { conexaoService, Conexao, UserBusca } from '../../src/services/conexaoService';
import { colors } from '../../src/theme/colors';
import { IconSearch } from '../../src/components/icons/CarePlusIcons';
import Svg, { Circle, Path, Line, Polyline, Polygon } from 'react-native-svg';

// ─── Ícones locais ────────────────────────────────────────────

function IconConectado({ size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="6" fill="#10B981" />
      <Polyline points="4,7 6,9 10,5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconPendente({ size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="6" stroke="#F59E0B" strokeWidth="1.5" />
      <Line x1="7" y1="4" x2="7" y2="7.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="7" cy="10" r="0.8" fill="#F59E0B" />
    </Svg>
  );
}

function IconEstrela({ size = 13, color = '#F59E0B' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Svg>
  );
}

function IconClose({ size = 14, color = '#EF4444' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconUserPlus({ size = 14, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="8.5" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="20" y1="8" x2="20" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="23" y1="11" x2="17" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function IconCheck({ size = 14, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="20,6 9,17 4,12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Avatar ──────────────────────────────────────────────────
function Avatar({ nome, size = 44 }: { nome: string; size?: number }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{iniciais}</Text>
    </View>
  );
}

// ─── Item de conexão animado ─────────────────────────────────
function ItemConexao({ item, index, onRemover }: {
  item: Conexao; index: number; onRemover: (id: number) => void;
}) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.itemCard, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <Avatar nome={item.nome} size={48} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <View style={styles.statusRow}>
          <IconConectado size={13} />
          <Text style={[styles.itemStatus, { color: colors.success }]}>Conectado</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.btnRemover}
        onPress={() =>
          Alert.alert('Remover conexão', `Remover ${item.nome}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: () => onRemover(item.id) },
          ])
        }
      >
        <IconClose size={13} color={colors.error} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Item de solicitação pendente ────────────────────────────
function ItemPendente({ item, index, onAceitar, onRecusar }: {
  item: Conexao; index: number;
  onAceitar: (id: number) => void;
  onRecusar: (id: number) => void;
}) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [loadingAceitar, setLoadingAceitar] = useState(false);
  const [loadingRecusar, setLoadingRecusar] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleAceitar() { setLoadingAceitar(true); await onAceitar(item.id); setLoadingAceitar(false); }
  async function handleRecusar() { setLoadingRecusar(true); await onRecusar(item.id); setLoadingRecusar(false); }

  return (
    <Animated.View style={[styles.itemCard, styles.itemCardPendente, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <Avatar nome={item.nome} size={48} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <View style={styles.statusRow}>
          <IconPendente size={13} />
          <Text style={[styles.itemStatus, { color: colors.warning }]}>Quer se conectar</Text>
        </View>
        <View style={styles.pendenteBtns}>
          <TouchableOpacity style={styles.btnAceitar} onPress={handleAceitar} disabled={loadingAceitar}>
            {loadingAceitar
              ? <ActivityIndicator color={colors.white} size="small" />
              : <><IconCheck size={13} color={colors.white} /><Text style={styles.btnAceitarText}>Aceitar</Text></>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnRecusar} onPress={handleRecusar} disabled={loadingRecusar}>
            {loadingRecusar
              ? <ActivityIndicator color={colors.error} size="small" />
              : <><IconClose size={13} color={colors.textSecondary} /><Text style={styles.btnRecusarText}>Recusar</Text></>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Item de resultado de busca ──────────────────────────────
function ItemBusca({ item, onConectar, jaSolicitado }: {
  item: UserBusca; onConectar: (id: number) => void; jaSolicitado: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    if (jaSolicitado) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start(() => onConectar(item.id));
  }

  return (
    <Animated.View style={[styles.itemBusca, { transform: [{ scale: scaleAnim }] }]}>
      <Avatar nome={item.nome} size={44} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        {item.bio ? (
          <Text style={styles.itemBio} numberOfLines={1}>{item.bio}</Text>
        ) : (
          <View style={styles.statusRow}>
            <IconEstrela size={12} />
            <Text style={styles.itemStatus}>{item.pontos} pontos</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.btnConectar, jaSolicitado && styles.btnConectarDisabled]}
        onPress={handlePress}
        disabled={jaSolicitado}
      >
        {jaSolicitado
          ? <><IconCheck size={13} color={colors.textSecondary} /><Text style={[styles.btnConectarText, styles.btnConectarTextDisabled]}>Enviado</Text></>
          : <><IconUserPlus size={13} color={colors.white} /><Text style={styles.btnConectarText}>Conectar</Text></>
        }
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Empty state com mascote ─────────────────────────────────
function EmptyConexoes({ mensagem }: { mensagem: string }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
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
      <Text style={styles.emptyTitle}>{mensagem}</Text>
      <Text style={styles.emptySub}>Use a busca para encontrar pessoas!</Text>
    </Animated.View>
  );
}

// ─── Tela Conexões ───────────────────────────────────────────
export default function ConexoesScreen() {
  const { user } = useAuth();
  const [aba, setAba] = useState<'conexoes' | 'pendentes' | 'buscar'>('conexoes');
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [pendentes, setPendentes] = useState<Conexao[]>([]);
  const [resultadoBusca, setResultadoBusca] = useState<UserBusca[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [solicitados, setSolicitados] = useState<Set<number>>(new Set());

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    carregar();
  }, []);

  async function carregar() {
    try {
      const [conRes, penRes] = await Promise.all([
        conexaoService.listar(),
        conexaoService.pendentes(),
      ]);
      setConexoes(conRes);
      setPendentes(penRes);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar conexões.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  async function handleBuscar() {
    if (!termoBusca.trim()) return;
    setBuscando(true);
    try {
      const resultado = await conexaoService.buscar(termoBusca.trim());
      setResultadoBusca(resultado.filter(u => u.id !== user?.userId));
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar usuários.');
    } finally {
      setBuscando(false);
    }
  }

  async function handleConectar(userId: number) {
    try {
      await conexaoService.solicitar(userId);
      setSolicitados(prev => new Set([...prev, userId]));
      Alert.alert('Solicitação enviada!', 'Aguarde a pessoa aceitar.');
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.mensagem || 'Erro ao enviar solicitação.');
    }
  }

  async function handleAceitar(conexaoId: number) {
    try {
      await conexaoService.aceitar(conexaoId);
      Alert.alert('Conexão aceita!', 'Vocês agora estão conectados!');
      carregar();
    } catch { Alert.alert('Erro', 'Não foi possível aceitar a solicitação.'); }
  }

  async function handleRecusar(conexaoId: number) {
    try { await conexaoService.recusar(conexaoId); carregar(); }
    catch { Alert.alert('Erro', 'Não foi possível recusar a solicitação.'); }
  }

async function handleRemover(conexaoId: number) {
  try {
    // Pega o userId da pessoa antes de remover
    const conexao = conexoes.find(c => c.id === conexaoId);

    await conexaoService.remover(conexaoId);

    setConexoes(prev => prev.filter(c => c.id !== conexaoId));

    // Limpa do Set para permitir reconectar
    if (conexao) {
      setSolicitados(prev => {
        const next = new Set(prev);
        next.delete(conexao.userId); // ou o campo que representa o userId da pessoa
        return next;
      });
    }
  } catch {
    Alert.alert('Erro', 'Não foi possível remover a conexão.');
  }
}

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <Text style={styles.headerTitle}>Conexões</Text>
        {pendentes.length > 0 && (
          <TouchableOpacity style={styles.badgePendente} onPress={() => setAba('pendentes')}>
            <IconPendente size={13} />
            <Text style={styles.badgePendenteText}>{pendentes.length} pendente{pendentes.length > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <View style={styles.tabs}>
        {[
          { key: 'conexoes',  label: `Minhas (${conexoes.length})` },
          { key: 'pendentes', label: `Pendentes (${pendentes.length})` },
          { key: 'buscar',    label: 'Buscar' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, aba === key && styles.tabActive]}
            onPress={() => setAba(key as any)}
          >
            <Text style={[styles.tabText, aba === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {aba === 'buscar' ? (
        <View style={styles.buscaContainer}>
          <View style={styles.buscaInputRow}>
            <View style={styles.buscaInputWrapper}>
              <IconSearch size={18} color={colors.textLight} />
              <TextInput
                style={styles.buscaInput}
                placeholder="Buscar por nome..."
                placeholderTextColor={colors.textLight}
                value={termoBusca}
                onChangeText={setTermoBusca}
                onSubmitEditing={handleBuscar}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity
              style={[styles.btnBuscar, buscando && styles.btnBuscarDisabled]}
              onPress={handleBuscar}
              disabled={buscando}
            >
              {buscando
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.btnBuscarText}>Buscar</Text>
              }
            </TouchableOpacity>
          </View>

          <FlatList
            data={resultadoBusca}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={termoBusca ? null : <EmptyConexoes mensagem="Busque por nome para encontrar pessoas" />}
            renderItem={({ item }) => (
              <ItemBusca item={item} onConectar={handleConectar} jaSolicitado={solicitados.has(item.id)} />
            )}
          />
        </View>
      ) : (
        <FlatList
          data={aba === 'conexoes' ? conexoes : pendentes}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyConexoes mensagem={aba === 'conexoes' ? 'Nenhuma conexão ainda' : 'Sem solicitações pendentes'} />
          }
          renderItem={({ item, index }) =>
            aba === 'conexoes' ? (
              <ItemConexao item={item} index={index} onRemover={handleRemover} />
            ) : (
              <ItemPendente item={item} index={index} onAceitar={handleAceitar} onRecusar={handleRecusar} />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  badgePendente: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.warning + '22', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20,
  },
  badgePendenteText: { fontSize: 12, fontWeight: '700', color: colors.warning },

  tabs: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: 12, paddingBottom: 12, gap: 6,
  },
  tab: { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: 'center', backgroundColor: colors.background },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  listContent: { padding: 16, gap: 10, paddingBottom: 40 },

  itemCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  itemCardPendente: { borderColor: colors.warning + '55', backgroundColor: '#FFFBEB' },
  itemInfo: { flex: 1, gap: 4 },
  itemNome: { fontSize: 15, fontWeight: '700', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  itemStatus: { fontSize: 12, color: colors.textSecondary },
  itemBio: { fontSize: 12, color: colors.textSecondary },

  btnRemover: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.errorLight, alignItems: 'center', justifyContent: 'center',
  },

  pendenteBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btnAceitar: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primary, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7, minWidth: 80,
  },
  btnAceitarText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  btnRecusar: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 7, minWidth: 80,
  },
  btnRecusarText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },

  buscaContainer: { flex: 1 },
  buscaInputRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  buscaInputWrapper: {
    flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 12, backgroundColor: colors.background,
  },
  buscaInput: { flex: 1, fontSize: 15, color: colors.text },
  btnBuscar: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 16, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  btnBuscarDisabled: { backgroundColor: colors.border },
  btnBuscarText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  itemBusca: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  btnConectar: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  btnConectarDisabled: { backgroundColor: colors.border },
  btnConectarText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  btnConectarTextDisabled: { color: colors.textSecondary },

  avatar: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: colors.primaryDark },

  emptyState: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyMascote: { width: 130, height: 130 },
  emptySombra: { width: 65, height: 10, borderRadius: 32, backgroundColor: 'rgba(0,0,0,0.08)', marginTop: 2 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
});