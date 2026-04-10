// ============================================================
//  app/(auth)/register.tsx
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Validações em tempo real
  const senhaValida = senha.length >= 6;
  const senhasIguais = senha === confirmarSenha && confirmarSenha.length > 0;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nomeValido = nome.trim().length >= 2;

  const podeCadastrar = nomeValido && emailValido && senhaValida && senhasIguais;

  async function handleRegister() {
    if (!podeCadastrar) {
      Alert.alert('Atenção', 'Verifique os campos antes de continuar.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ nome: nome.trim(), email: email.trim().toLowerCase(), senha });
      Alert.alert(
        'Cadastro realizado! 🎉',
        'Sua conta foi criada com sucesso. Faça login para começar.',
        [{ text: 'Fazer Login', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      const msg = error.response?.data?.mensagem || 'Erro ao criar conta. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Comece sua jornada de saúde agora 🌱</Text>
          </View>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {[nomeValido, emailValido, senhaValida, senhasIguais].map((valid, i) => (
            <View
              key={i}
              style={[styles.progressDot, valid && styles.progressDotActive]}
            />
          ))}
          <Text style={styles.progressText}>
            {[nomeValido, emailValido, senhaValida, senhasIguais].filter(Boolean).length}/4 campos válidos
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>

          {/* Nome */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Nome completo</Text>
              {nomeValido && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={[styles.inputWrapper, nomeFocused && styles.inputWrapperFocused, nomeValido && styles.inputWrapperValid]}>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={colors.textLight}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                onFocus={() => setNomeFocused(true)}
                onBlur={() => setNomeFocused(false)}
              />
            </View>
          </View>

          {/* E-mail */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>E-mail</Text>
              {emailValido && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused, emailValido && styles.inputWrapperValid]}>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Senha</Text>
              {senhaValida && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={[styles.inputWrapper, senhaFocused && styles.inputWrapperFocused, senhaValida && styles.inputWrapperValid]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mínimo 6 caracteres"
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
            {senha.length > 0 && !senhaValida && (
              <Text style={styles.fieldError}>Mínimo de 6 caracteres</Text>
            )}
          </View>

          {/* Confirmar Senha */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Confirmar senha</Text>
              {senhasIguais && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={[
              styles.inputWrapper,
              confirmFocused && styles.inputWrapperFocused,
              senhasIguais && styles.inputWrapperValid,
              confirmarSenha.length > 0 && !senhasIguais && styles.inputWrapperError,
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Repita a senha"
                placeholderTextColor={colors.textLight}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!senhaVisivel}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
              />
            </View>
            {confirmarSenha.length > 0 && !senhasIguais && (
              <Text style={styles.fieldError}>As senhas não coincidem</Text>
            )}
          </View>

          {/* Botão Cadastrar */}
          <TouchableOpacity
            style={[styles.button, (!podeCadastrar || isLoading) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!podeCadastrar || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Criar minha conta</Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.terms}>
            Ao criar uma conta você concorda com nossos{' '}
            <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
            <Text style={styles.termsLink}>Política de Privacidade</Text>
          </Text>

          {/* Link Login */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.linkText}>
              Já tem conta?{' '}
              <Text style={styles.linkTextBold}>Fazer login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 18,
    color: colors.text,
  },
  headerContent: {},
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 8,
  },
  form: {},
  fieldGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.3,
  },
  checkmark: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  inputWrapperValid: {
    borderColor: colors.success,
    backgroundColor: '#F0FDF4',
  },
  inputWrapperError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  terms: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    padding: 8,
    marginTop: 16,
  },
  linkText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});