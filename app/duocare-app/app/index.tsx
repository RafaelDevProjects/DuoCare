// ============================================================
//  app/index.tsx  — Redirect inicial
// ============================================================
import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/theme/colors';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/desafios" />;
  }

  return <Redirect href="/(auth)/login" />;
}