import { View, Text, TouchableOpacity, Platform, SafeAreaView } from 'react-native'
import { Tabs, usePathname, useRouter } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import { Redirect } from 'expo-router'

// Ícones SVG-like usando emoji (em produção use @expo/vector-icons)
const TabIcon = ({ icon, label, focused }: { icon: string; label: string; focused: boolean }) => (
  <View className={`items-center justify-center py-2`}>
    <Text className={`text-xl ${focused ? 'scale-110' : ''}`}>{icon}</Text>
    <Text className={`text-xs font-medium mt-1 ${focused ? 'text-coral-600' : 'text-gray-500'}`}>
      {label}
    </Text>
  </View>
)

export default function AppLayout() {
  const { session, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-gray-500">Carregando...</Text>
      </SafeAreaView>
    )
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <View className="flex-1 bg-cream">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🏠" label="Início" focused={focused} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="analytics"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📊" label="Progresso" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="scanner"
          options={{
            tabBarIcon: ({ focused }) => (
              <View className="items-center justify-center -mt-8">
                <View className={`w-16 h-16 rounded-full items-center justify-center shadow-lg ${
                  focused ? 'bg-coral-600' : 'bg-coral-500'
                }`}>
                  <Text className="text-3xl">📷</Text>
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="premium"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="✨" label="Premium" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="👤" label="Perfil" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  )
}
