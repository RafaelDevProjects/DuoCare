// app/(tabs)/conexoes.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Animated,
  Easing, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { conexaoService, Conexao, UserBusca } from '../../src/services/conexaoService';
import { colors } from '../../src/theme/colors';
import { IconSearch } from '../../src/components/icons/CarePlusIcons';
import Svg, { Circle, Path, Line, Polyline, Polygon } from 'react-native-svg';
import { useSubscription } from '../../src/contexts/SocketContext';

// ─── Ícones ──────────────────────────────────────────────
function IconConectado({ size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="6" fill={colors.success} />
      <Polyline points="4,7 6,9 10,5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconPendente({ size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="6" stroke={colors.warning} strokeWidth="1.5" />
      <Line x1="7" y1="4" x2="7" y2="7.5" stroke={colors.warning} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="7" cy="10" r="0.8" fill={colors.warning} />
    </Svg>
  );
}

function IconEnviado({ size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <Circle cx="7" cy="7" r="6" stroke={colors.primary} strokeWidth="1.5" />
      <Line x1="7" y1="4" x2="7" y2="7.5" stroke={colors.primary} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="7" cy="10" r="0.8" fill={colors.primary} />
    </Svg>
  );
}

function IconEstrela({ size = 13, color = colors.accent }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </Svg>
  );
}

function IconClose({ size = 14, color = colors.error }) {
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

// ─── Avatar clicável ──────────────────────────────────────
function Avatar({ nome, size = 44, onPress }: { nome: string; size?: number; onPress?: () => void }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{iniciais}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Item de conexão aceita ───────────────────────────────
function ItemConexao({ item, index, onRemover, onPressAvatar }: {
  item: Conexao; index: number; onRemover: (id: number) => void; onPressAvatar: (userId: number) => void;
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
      <Avatar nome={item.nome} size={48} onPress={() => onPressAvatar(item.userId)} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <View style={styles.statusRow}>
          <IconConectado size={13} />
          <Text style={[styles.itemStatus, { color: colors.success }]}>Conectado</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.btnRemover}
        onPress={() => Alert.alert('Remover conexão', `Remover ${item.nome}?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Remover', style: 'destructive', onPress: () => onRemover(item.id) },
        ])}
      >
        <IconClose size={13} color={colors.error} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Item de solicitação recebida (pendente) ──────────────
function ItemPendente({ item, index, onAceitar, onRecusar, onPressAvatar }: {
  item: Conexao; index: number; onAceitar: (id: number) => void; onRecusar: (id: number) => void; onPressAvatar: (userId: number) => void;
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
      <Avatar nome={item.nome} size={48} onPress={() => onPressAvatar(item.userId)} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <View style={styles.statusRow}>
          <IconPendente size={13} />
          <Text style={[styles.itemStatus, { color: colors.warning }]}>Quer se conectar</Text>
        </View>
        <View style={styles.pendenteBtns}>
          <TouchableOpacity style={styles.btnAceitar} onPress={handleAceitar} disabled={loadingAceitar}>
            {loadingAceitar ? <ActivityIndicator color={colors.white} size="small" /> : <><IconCheck size={13} color={colors.white} /><Text style={styles.btnAceitarText}>Aceitar</Text></>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnRecusar} onPress={handleRecusar} disabled={loadingRecusar}>
            {loadingRecusar ? <ActivityIndicator color={colors.error} size="small" /> : <><IconClose size={13} color={colors.textSecondary} /><Text style={styles.btnRecusarText}>Recusar</Text></>}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// Item de solicitação enviada (pendente) com botão cancelar
function ItemEnviado({ item, index, onCancelar, onPressAvatar }: {
  item: Conexao; index: number; onCancelar: (receptorId: number) => void; onPressAvatar: (userId: number) => void;
}) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  async function handleCancelar() {
    setLoading(true);
    await onCancelar(item.userId);
    setLoading(false);
  }
  return (
    <Animated.View style={[styles.itemCard, styles.itemCardEnviado, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <Avatar nome={item.nome} size={48} onPress={() => onPressAvatar(item.userId)} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <View style={styles.statusRow}>
          <IconEnviado size={13} />
          <Text style={[styles.itemStatus, { color: colors.primary }]}>Solicitação enviada</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color={colors.error} /> : <Text style={styles.btnCancelarText}>Cancelar</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Item de busca ─────────────────────────────────────────
function ItemBusca({ item, onConectar, jaSolicitado, onPressAvatar }: {
  item: UserBusca; onConectar: (id: number) => void; jaSolicitado: boolean; onPressAvatar: (userId: number) => void;
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
      <Avatar nome={item.nome} size={44} onPress={() => onPressAvatar(item.id)} />
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
        style={[styles.btnConectarBusca, jaSolicitado && styles.btnConectarDisabled]}
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

// ─── Empty state ───────────────────────────────────────────
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

// ─── Tela principal ────────────────────────────────────────
export default function ConexoesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [aba, setAba] = useState<'conexoes' | 'pendentes' | 'enviadas' | 'buscar'>('conexoes');
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [pendentes, setPendentes] = useState<Conexao[]>([]);
  const [enviadas, setEnviadas] = useState<Conexao[]>([]);
  const [resultadoBusca, setResultadoBusca] = useState<UserBusca[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [solicitados, setSolicitados] = useState<Set<number>>(new Set());
  const [novasSolicitacoes, setNovasSolicitacoes] = useState(0);
  const headerFade = useRef(new Animated.Value(0)).current;

  async function carregar() {
    try {
      const [conRes, penRes, envRes] = await Promise.all([
        conexaoService.listar(),
        conexaoService.pendentes(),
        conexaoService.enviadas(),
      ]);
      setConexoes(conRes);
      setPendentes(penRes);
      setEnviadas(envRes);
      
      // IDs de usuários que não podem receber nova solicitação
      const idsIndisponiveis = new Set<number>();
      conRes.forEach(c => idsIndisponiveis.add(c.userId));
      penRes.forEach(p => idsIndisponiveis.add(p.userId));
      envRes.forEach(e => idsIndisponiveis.add(e.userId));
      setSolicitados(idsIndisponiveis);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar conexões.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    carregar();
  }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); carregar(); }, []);

  useSubscription(
    `/topic/conexoes/${user?.userId}`,
    useCallback((payload) => {
      if (payload.tipo === 'NOVA_SOLICITACAO') {
        const novaSolicitacao = payload.dados as Conexao;
        setPendentes(prev => [novaSolicitacao, ...prev]);
        setSolicitados(prev => new Set([...prev, novaSolicitacao.userId]));
        setNovasSolicitacoes(prev => prev + 1);
        Alert.alert('Nova solicitação! 🤝', payload.mensagem);
      }
      if (payload.tipo === 'CONEXAO_ACEITA') {
        carregar();
        Alert.alert('Conexão aceita! 🎉', payload.mensagem);
      }
    }, [])
  );

  async function handleBuscar() {
    if (!termoBusca.trim()) return;
    setBuscando(true);
    try {
      const resultado = await conexaoService.buscar(termoBusca.trim());
      // Filtra o próprio usuário e aqueles que já são conexões ou têm pendência
      const filtrados = resultado.filter(u => 
        u.id !== user?.userId && !solicitados.has(u.id)
      );
      setResultadoBusca(filtrados);
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar usuários.');
    } finally {
      setBuscando(false);
    }
  }

  async function handleConectar(userId: number) {
    // Marca imediatamente como pendente
    setSolicitados(prev => new Set([...prev, userId]));
    try {
      await conexaoService.solicitar(userId);
      Alert.alert('Solicitação enviada!', 'Aguarde a pessoa aceitar.');
      await carregar(); // recarrega para sincronizar
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert('Aviso', 'Já existe uma solicitação pendente entre vocês.');
        await carregar();
      } else {
        Alert.alert('Erro', error.response?.data?.mensagem || 'Erro ao enviar solicitação.');
        // Remove a marcação local se erro não for 409
        setSolicitados(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    }
  }

  async function handleAceitar(conexaoId: number) {
    try {
      await conexaoService.aceitar(conexaoId);
      Alert.alert('Conexão aceita!', 'Vocês agora estão conectados!');
      await carregar();
    } catch { Alert.alert('Erro', 'Não foi possível aceitar a solicitação.'); }
  }

  async function handleRecusar(conexaoId: number) {
    try {
      await conexaoService.recusar(conexaoId);
      await carregar();
    } catch { Alert.alert('Erro', 'Não foi possível recusar a solicitação.'); }
  }

  async function handleRemover(conexaoId: number) {
    try {
      await conexaoService.remover(conexaoId);
      setConexoes(prev => prev.filter(c => c.id !== conexaoId));
    } catch {
      Alert.alert('Erro', 'Não foi possível remover a conexão.');
    }
  }

  async function handleCancelarEnviada(receptorId: number) {
    Alert.alert('Cancelar solicitação', 'Deseja cancelar essa solicitação?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            await conexaoService.cancelar(receptorId);
            Alert.alert('Solicitação cancelada');
            await carregar();
          } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.mensagem || 'Não foi possível cancelar.');
          }
        },
      },
    ]);
  }

  const goToPerfil = (userId: number) => {
    router.push(`/perfil/${userId}`);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const totalPendentes = pendentes.length + enviadas.length;
  const badgeCount = totalPendentes + novasSolicitacoes;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <Text style={styles.headerTitle}>Conexões</Text>
        {badgeCount > 0 && (
          <TouchableOpacity style={styles.badgePendente} onPress={() => setAba('pendentes')}>
            <IconPendente size={13} />
            <Text style={styles.badgePendenteText}>{badgeCount} pendente{badgeCount > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <View style={styles.tabs}>
        {[
          { key: 'conexoes',  label: `Minhas (${conexoes.length})` },
          { key: 'pendentes', label: `Recebidas (${pendentes.length})${novasSolicitacoes > 0 ? ' 🔔' : ''}` },
          { key: 'enviadas',  label: `Enviadas (${enviadas.length})` },
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
              {buscando ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.btnBuscarText}>Buscar</Text>}
            </TouchableOpacity>
          </View>
          <FlatList
            data={resultadoBusca}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={termoBusca ? <EmptyConexoes mensagem="Nenhum usuário encontrado" /> : <EmptyConexoes mensagem="Busque por nome para encontrar pessoas" />}
            renderItem={({ item }) => (
              <ItemBusca
                item={item}
                onConectar={handleConectar}
                jaSolicitado={false} // já não aparecem na lista se forem pendentes
                onPressAvatar={goToPerfil}
              />
            )}
          />
        </View>
      ) : (
        <FlatList
          data={aba === 'conexoes' ? conexoes : aba === 'pendentes' ? pendentes : enviadas}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyConexoes mensagem={
              aba === 'conexoes' ? 'Nenhuma conexão ainda' :
              aba === 'pendentes' ? 'Sem solicitações recebidas' : 'Nenhuma solicitação enviada'
            } />
          }
          renderItem={({ item, index }) =>
            aba === 'conexoes' ? (
              <ItemConexao item={item} index={index} onRemover={handleRemover} onPressAvatar={goToPerfil} />
            ) : aba === 'pendentes' ? (
              <ItemPendente item={item} index={index} onAceitar={handleAceitar} onRecusar={handleRecusar} onPressAvatar={goToPerfil} />
            ) : (
              <ItemEnviado item={item} index={index} onCancelar={handleCancelarEnviada} onPressAvatar={goToPerfil} />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos (mantidos iguais) ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 30, paddingVertical: 30,
    backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.background,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  badgePendente: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.warningMuted, paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20,
  },
  badgePendenteText: { fontSize: 12, fontWeight: '700', color: colors.warning },
  tabs: {
    flexDirection: 'row', backgroundColor: colors.background,
    paddingHorizontal: 12, paddingBottom: 12, gap: 6,
  },
  tab: { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: 'center', backgroundColor: colors.border },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  listContent: { padding: 16, gap: 10, paddingBottom: 40 },
  itemCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 16, padding: 14,
  },
  itemCardPendente: { borderWidth: 1, borderColor: colors.warning + '55' },
  itemCardEnviado: { borderWidth: 1, borderColor: colors.primary + '55' },
  itemInfo: { flex: 1, gap: 4 },
  itemNome: { fontSize: 15, fontWeight: '700', color: colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  itemStatus: { fontSize: 12, color: colors.textSecondary },
  itemBio: { fontSize: 12, color: colors.textSecondary },
  btnRemover: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.errorMuted, alignItems: 'center', justifyContent: 'center',
  },
  btnCancelar: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: colors.errorMuted, borderWidth: 1, borderColor: colors.error,
  },
  btnCancelarText: { color: colors.error, fontWeight: '600', fontSize: 12 },
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
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
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
    backgroundColor: colors.surface, borderRadius: 16, padding: 14,
  },
  btnConectarBusca: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  btnConectarDisabled: { backgroundColor: colors.border },
  btnConectarText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  btnConectarTextDisabled: { color: colors.textSecondary },
  avatar: { backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: colors.primary },
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyMascote: { width: 130, height: 130 },
  emptySombra: { width: 65, height: 10, borderRadius: 50, backgroundColor: 'rgba(0, 0, 0, 0.1)', marginTop: 2 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
});