// ============================================================
//  app/(tabs)/_layout.tsx — com ícones SVG
// ============================================================
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { colors } from '../../src/theme/colors';
import {
  IconDesafios, IconFeed, IconLiga, IconConexoes, IconPerfil,
} from '../../src/components/icons/CarePlusIcons';
 
function TabIcon({ Icon, focused }: { Icon: any; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon
        size={22}
        color={focused ? colors.primary : colors.textLight}
        strokeWidth={focused ? 2.2 : 1.6}
      />
    </View>
  );
}
 
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="desafios"
        options={{
          title: 'Desafios',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconDesafios} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconFeed} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="liga"
        options={{
          title: 'Liga',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconLiga} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="conexoes"
        options={{
          title: 'Conexões',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconConexoes} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon Icon={IconPerfil} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
 