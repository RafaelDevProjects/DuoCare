// app/(tabs)/perfil.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Animated,
  Easing, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ligaService, LigaInfo } from '../../src/services/ligaService';
import { desafioService } from '../../src/services/desafioService';
import { conexaoService } from '../../src/services/conexaoService';
import api from '../../src/services/api';
import { colors } from '../../src/theme/colors';
import Svg, { Path, Circle, Polygon, Polyline, Line, Rect } from 'react-native-svg';

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

function IconTarget({ size = 18, color = colors.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="6"  stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="2"  fill={color} />
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

function IconChevron({ size = 16, color = colors.textSecondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconEdit({ size = 20, color = colors.primary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconLogout({ size = 20, color = colors.error }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function IconBell({ size = 20, color = colors.textSecondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconLock({ size = 20, color = colors.textSecondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="1.8" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconHelp({ size = 20, color = colors.textSecondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Componentes locais ───────────────────────────────────
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

function MenuItem({ icon, label, onPress, isLast }: {
  icon: React.ReactNode; label: string; onPress?: () => void; isLast?: boolean;
}) {
  return (
    <>
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconWrapper}>{icon}</View>
        <Text style={styles.menuText}>{label}</Text>
        <IconChevron size={16} color={colors.textLight} />
      </TouchableOpacity>
      {!isLast && <View style={styles.menuDivider} />}
    </>
  );
}

// ─── Tela principal ───────────────────────────────────────
export default function PerfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [liga, setLiga] = useState<LigaInfo | null>(null);
  const [totalDesafiosConcluidos, setTotalDesafiosConcluidos] = useState(0);
  const [totalConexoes, setTotalConexoes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalEditar, setModalEditar] = useState(false);
  const [nome, setNome] = useState(user?.nome ?? '');
  const [bio, setBio]   = useState('');
  const [salvando, setSalvando] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    carregarEstatisticas();
  }, []);

  async function carregarEstatisticas() {
    try {
      const [ligaData, todosDesafios, conexoes] = await Promise.all([
        ligaService.minhaLiga(),
        desafioService.meusTodosDesafios(),
        conexaoService.listar(), // ✅ busca as conexões aceitas do usuário
      ]);
      setLiga(ligaData);
      const concluidos = todosDesafios.filter(d => d.status === 'CONCLUIDO').length;
      setTotalDesafiosConcluidos(concluidos);
      setTotalConexoes(conexoes.length);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do perfil:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar vazio.');
      return;
    }
    setSalvando(true);
    try {
      await api.put('/api/users/me', null, {
        params: { nome: nome.trim(), bio: bio.trim() || undefined },
      });
      Alert.alert('✅ Perfil atualizado!', 'Suas informações foram salvas.');
      setModalEditar(false);
      carregarEstatisticas();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const progresso = liga
    ? ((liga.pontos - liga.pontosMinimo) / (liga.pontosMaximo - liga.pontosMinimo)) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.userSection, { opacity: headerFade }]}>
          <AvatarGrande nome={user?.nome ?? ''} size={80} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.nome}</Text>
            {liga && (
              <View style={[styles.ligaChip, { backgroundColor: liga.ligaCor + '22', borderColor: liga.ligaCor + '44' }]}>
                <IconTrophy size={14} color={liga.ligaCor} />
                <Text style={[styles.ligaChipText, { color: liga.ligaCor }]}>{liga.ligaNome}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.btnEditar} onPress={() => setModalEditar(true)}>
            <IconEdit size={18} color={colors.primary} />
            <Text style={styles.btnEditarText}>Editar</Text>
          </TouchableOpacity>
        </Animated.View>

        {liga && (
          <View style={styles.ligaProgressCard}>
            <View style={styles.ligaProgressHeader}>
              <Text style={styles.ligaProgressTitulo}>Progresso na liga</Text>
              <Text style={styles.ligaProgressPontos}>{liga.pontos.toLocaleString()} pts</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${Math.min(progresso, 100)}%` as any,
                backgroundColor: liga.ligaCor,
              }]} />
            </View>
            <Text style={styles.ligaProgressSub}>
              {liga.pontosParaProxima > 0
                ? `Faltam ${liga.pontosParaProxima.toLocaleString()} pts para a próxima liga`
                : '🎉 Liga máxima alcançada!'}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Suas estatísticas</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon={<IconStar size={22} color={colors.accent} />}
            value={(user?.pontos ?? 0).toLocaleString()}
            label="Pontos"
            color={colors.accent}
            delay={0}
          />
          <StatCard
            icon={<IconTrophy size={22} color={liga?.ligaCor || colors.accent} />}
            value={liga?.ligaNome ?? '—'}
            label="Liga"
            color={liga?.ligaCor || colors.accent}
            delay={100}
          />
          <StatCard
            icon={<IconTarget size={22} color={colors.primary} />}
            value={totalDesafiosConcluidos}
            label="Desafios"
            color={colors.primary}
            delay={200}
          />
          {/* 🆕 Card de Conexões */}
          <StatCard
            icon={<IconUsers size={22} color={colors.secondary} />}
            value={totalConexoes}
            label="Conexões"
            color={colors.secondary}
            delay={300}
          />
        </View>

        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon={<IconEdit size={20} color={colors.primary} />}
            label="Editar perfil"
            onPress={() => setModalEditar(true)}
          />
          <MenuItem
            icon={<IconBell size={20} color={colors.textSecondary} />}
            label="Notificações"
          />
          <MenuItem
            icon={<IconLock size={20} color={colors.textSecondary} />}
            label="Privacidade"
          />
          <MenuItem
            icon={<IconHelp size={20} color={colors.textSecondary} />}
            label="Ajuda"
            isLast
          />
        </View>

        <TouchableOpacity style={styles.btnSair} onPress={handleLogout}>
          <IconLogout size={20} color={colors.error} />
          <Text style={styles.btnSairText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.versao}>Care Plus v1.0.0</Text>
      </ScrollView>

      {/* Modal de edição (igual ao original) */}
      <Modal visible={modalEditar} animationType="slide" onRequestClose={() => setModalEditar(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalEditar(false)}>
                <Text style={styles.modalCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitulo}>Editar perfil</Text>
              <TouchableOpacity
                style={[styles.modalSalvarBtn, salvando && { opacity: 0.6 }]}
                onPress={handleSalvar}
                disabled={salvando}
              >
                {salvando
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <Text style={styles.modalSalvarText}>Salvar</Text>
                }
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.modalAvatarWrapper}>
                <AvatarGrande nome={nome || user?.nome || ''} size={80} />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.inputBio]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Conte um pouco sobre você..."
                  placeholderTextColor={colors.textLight}
                  multiline
                  maxLength={300}
                />
                <Text style={styles.contador}>{bio.length}/300</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Estilos (mantidos iguais aos originais) ─────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 40 },
  userSection: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarGrande: {
    backgroundColor: colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.primary + '44',
  },
  avatarGrandeText: { fontWeight: '700', color: colors.primary },
  userInfo: { flex: 1, gap: 6 },
  userName: { fontSize: 20, fontWeight: '700', color: colors.text },
  ligaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1, alignSelf: 'flex-start',
  },
  ligaChipText: { fontSize: 13, fontWeight: '600' },
  btnEditar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  btnEditarText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  ligaProgressCard: {
    backgroundColor: colors.surface, margin: 16,
    borderRadius: 16, padding: 16, gap: 10,
  },
  ligaProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ligaProgressTitulo: { fontSize: 15, fontWeight: '700', color: colors.text },
  ligaProgressPontos: { fontSize: 15, fontWeight: '700', color: colors.primary },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  ligaProgressSub: { fontSize: 12, color: colors.textSecondary },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.text,
    paddingHorizontal: 16, marginBottom: 8, marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 10, marginBottom: 8,
  },
  statCard: {
    width: '46%', backgroundColor: colors.surface,
    borderRadius: 16, padding: 14, alignItems: 'center', gap: 8,
    borderWidth: 0, borderBottomWidth: 2,
  },
  statIconBg: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  menuCard: {
    backgroundColor: colors.surface, borderRadius: 16, marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    gap: 14,
  },
  menuIconWrapper: { width: 28, alignItems: 'center' },
  menuText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: 58 },
  btnSair: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 24, borderWidth: 1.5,
    borderColor: colors.error, borderRadius: 14, paddingVertical: 14,
  },
  btnSairText: { color: colors.error, fontSize: 15, fontWeight: '700' },
  versao: { textAlign: 'center', fontSize: 12, color: colors.textLight, marginTop: 16 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalTitulo: { fontSize: 17, fontWeight: '700', color: colors.text },
  modalCancelar: { fontSize: 16, color: colors.textSecondary },
  modalSalvarBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  modalSalvarText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  modalContent: { padding: 20, gap: 20 },
  modalAvatarWrapper: { alignItems: 'center', paddingVertical: 8 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 14, height: 48, fontSize: 16,
    color: colors.text, backgroundColor: colors.background,
  },
  inputBio: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  contador: { fontSize: 11, color: colors.textLight, textAlign: 'right' },
});