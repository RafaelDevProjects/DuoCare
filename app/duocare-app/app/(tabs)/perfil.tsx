// ============================================================
//  app/(tabs)/perfil.tsx
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Animated,
  Easing, Modal, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ligaService, LigaInfo } from '../../src/services/ligaService';
import api from '../../src/services/api';
import { colors } from '../../src/theme/colors';

const LIGA_EMOJI: Record<string, string> = {
  Bronze: '🥉', Prata: '🥈', Ouro: '🥇',
  Platina: '💎', Diamante: '💠', Safira: '🔷',
};

// ─── Avatar grande ───────────────────────────────────────────
function AvatarGrande({ nome, size = 80 }: { nome: string; size?: number }) {
  const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <View style={[styles.avatarGrande, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarGrandeText, { fontSize: size * 0.38 }]}>{iniciais}</Text>
    </View>
  );
}

// ─── Card de estatística ─────────────────────────────────────
function StatCard({ emoji, valor, label, delay }: {
  emoji: string; valor: string | number; label: string; delay: number;
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
    <Animated.View style={[styles.statCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Tela Perfil ─────────────────────────────────────────────
export default function PerfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [liga, setLiga] = useState<LigaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalEditar, setModalEditar] = useState(false);
  const [nome, setNome] = useState(user?.nome ?? '');
  const [bio, setBio]   = useState('');
  const [salvando, setSalvando] = useState(false);

  const headerFade  = useRef(new Animated.Value(0)).current;
  const mascoteSlide = useRef(new Animated.Value(30)).current;
  const floatAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,   { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(mascoteSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,  duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    carregarLiga();
  }, []);

  async function carregarLiga() {
    try {
      const data = await ligaService.minhaLiga();
      setLiga(data);
    } catch {
      // silencioso
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

        {/* Header com mascote */}
        <Animated.View style={[styles.heroSection, { opacity: headerFade }]}>
          <Animated.Image
            source={require('../../assets/mascote.png')}
            style={[styles.mascote, { transform: [{ translateY: floatAnim }, { translateY: mascoteSlide }] }]}
            resizeMode="contain"
          />
          <View style={styles.emptySombra} />
        </Animated.View>

        {/* Info do usuário */}
        <View style={styles.userSection}>
          <AvatarGrande nome={user?.nome ?? ''} size={80} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.nome}</Text>
            {liga && (
              <View style={styles.ligaChip}>
                <Text style={styles.ligaChipEmoji}>{LIGA_EMOJI[liga.ligaNome] ?? '🏅'}</Text>
                <Text style={[styles.ligaChipText, { color: liga.ligaCor }]}>{liga.ligaNome}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.btnEditar} onPress={() => setModalEditar(true)}>
            <Text style={styles.btnEditarText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Progresso da liga */}
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

        {/* Stats */}
        <Text style={styles.sectionTitle}>Suas estatísticas</Text>
        <View style={styles.statsGrid}>
          <StatCard emoji="⭐" valor={(user?.pontos ?? 0).toLocaleString()} label="Pontos"    delay={0}   />
          <StatCard emoji="🏅" valor={liga?.ligaNome ?? '—'}              label="Liga"      delay={100} />
          <StatCard emoji="🎯" valor="—"                                  label="Desafios"  delay={200} />
          <StatCard emoji="🤝" valor="—"                                  label="Conexões"  delay={300} />
        </View>

        {/* Menu de ações */}
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setModalEditar(true)}>
            <Text style={styles.menuEmoji}>✏️</Text>
            <Text style={styles.menuText}>Editar perfil</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuEmoji}>🔔</Text>
            <Text style={styles.menuText}>Notificações</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuEmoji}>🔒</Text>
            <Text style={styles.menuText}>Privacidade</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuEmoji}>❓</Text>
            <Text style={styles.menuText}>Ajuda</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Botão sair */}
        <TouchableOpacity style={styles.btnSair} onPress={handleLogout}>
          <Text style={styles.btnSairText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.versao}>Care Plus v1.0.0</Text>
      </ScrollView>

      {/* Modal editar perfil */}
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

// ─── Estilos ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 40 },

  heroSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 8, backgroundColor: colors.white },
  mascote: { width: 120, height: 120 },
  emptySombra: {
    width: 60, height: 8, borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.07)', marginTop: 4,
  },

  userSection: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, paddingHorizontal: 20,
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  avatarGrande: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.primary + '44',
  },
  avatarGrandeText: { fontWeight: '700', color: colors.primaryDark },
  userInfo: { flex: 1, gap: 6 },
  userName: { fontSize: 20, fontWeight: '700', color: colors.text },
  ligaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ligaChipEmoji: { fontSize: 16 },
  ligaChipText: { fontSize: 14, fontWeight: '700' },
  btnEditar: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  btnEditarText: { color: colors.primary, fontWeight: '700', fontSize: 13 },

  ligaProgressCard: {
    backgroundColor: colors.white, margin: 16,
    borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: colors.border,
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
    width: '46%', backgroundColor: colors.white,
    borderRadius: 14, padding: 16, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  statEmoji: { fontSize: 28 },
  statValor: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary },

  menuCard: {
    backgroundColor: colors.white, borderRadius: 16, marginHorizontal: 16,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuEmoji: { fontSize: 20, width: 28 },
  menuText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: colors.textLight },
  menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: 56 },

  btnSair: {
    marginHorizontal: 16, marginTop: 24, borderWidth: 1.5,
    borderColor: colors.error, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center',
  },
  btnSairText: { color: colors.error, fontSize: 15, fontWeight: '700' },

  versao: {
    textAlign: 'center', fontSize: 12, color: colors.textLight,
    marginTop: 16,
  },

  // Modal editar
  modalContainer: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalTitulo: { fontSize: 17, fontWeight: '700', color: colors.text },
  modalCancelar: { fontSize: 16, color: colors.textSecondary },
  modalSalvarBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 10,
  },
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