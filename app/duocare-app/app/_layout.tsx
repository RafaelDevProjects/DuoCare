// ============================================================
//  app/_layout.tsx  — Layout raiz com providers
// ============================================================
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { SocketProvider } from '../src/contexts/SocketContext'; // ✅ novo

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* SocketProvider fica dentro de AuthProvider para ter acesso ao token */}
      <SocketProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SocketProvider>
    </AuthProvider>
  );
}