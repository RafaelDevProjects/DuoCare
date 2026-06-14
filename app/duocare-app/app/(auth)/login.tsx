import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Animated, Easing, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';
 
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
 
  // ── Animações ──────────────────────────────────────────────
  const mascoteFade   = useRef(new Animated.Value(0)).current;
  const mascotefloat  = useRef(new Animated.Value(0)).current;
  const formSlide     = useRef(new Animated.Value(40)).current;
  const formFade      = useRef(new Animated.Value(0)).current;
  const btnScale      = useRef(new Animated.Value(1)).current;
  const shakeAnim     = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    // Entrada sequencial
    Animated.sequence([
      Animated.parallel([
        Animated.timing(mascoteFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(formSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
 
    // Mascote flutuando em loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotefloat, { toValue: -10, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(mascotefloat, { toValue: 0,   duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);
 
  function animarBotao() {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
  }
 
  function animarShake() {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  }
 
  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      animarShake();
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    animarBotao();
    setIsLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), senha });
      router.replace('/(tabs)/desafios');
    } catch (error: any) {
      animarShake();
      const msg = error.response?.data?.mensagem || 'E-mail ou senha incorretos.';
      Alert.alert('Erro', msg);
    } finally {
      setIsLoading(false);
    }
  }
 
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
 
        {/* Mascote animado */}
        <Animated.View style={[styles.mascooteWrapper, { opacity: mascoteFade, transform: [{ translateY: mascotefloat }] }]}>
          <Image
            source={require('../../assets/mascote.png')}
            style={styles.mascote}
            resizeMode="contain"
          />
          <View style={styles.mascoteSombra} />
        </Animated.View>
 
        {/* Formulário com slide + fade */}
        <Animated.View style={[styles.form, { opacity: formFade, transform: [{ translateY: formSlide }, { translateX: shakeAnim }] }]}>
          <Text style={styles.title}>Bem-vindo! 👋</Text>
          <Text style={styles.subtitle}>Faça login para continuar sua jornada</Text>
 
          {/* E-mail */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <Animated.View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </Animated.View>
          </View>
 
          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={[styles.inputWrapper, senhaFocused && styles.inputWrapperFocused]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textLight}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
                onFocus={() => setSenhaFocused(true)}
                onBlur={() => setSenhaFocused(false)}
              />
              <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{senhaVisivel ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
 
          {/* Botão com escala */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.buttonText}>Entrar</Text>
              }
            </TouchableOpacity>
          </Animated.View>
 
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>
 
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>
              Não tem conta? <Text style={styles.linkTextBold}>Cadastre-se grátis</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 32 },
 
  mascooteWrapper: { alignItems: 'center', marginTop: 48, marginBottom: 8 },
  mascote: { width: 160, height: 160 },
  mascoteSombra: {
    width: 80, height: 12, borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: 4,
  },
 
  form: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 28 },
 
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 14,
    backgroundColor: colors.background, paddingHorizontal: 16, height: 52,
  },
  inputWrapperFocused: { borderColor: colors.primary, backgroundColor: colors.background },
  input: { flex: 1, fontSize: 16, color: colors.text, height: '100%' },
  eyeButton: { padding: 4 },
  eyeText: { fontSize: 18 },
 
  button: {
    backgroundColor: colors.primary, borderRadius: 14, height: 54,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
 
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 16, fontSize: 13, color: colors.textLight },
 
  linkButton: { alignItems: 'center', padding: 8 },
  linkText: { fontSize: 15, color: colors.textSecondary },
  linkTextBold: { color: colors.primary, fontWeight: '700' },
});