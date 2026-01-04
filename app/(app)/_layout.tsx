import { View, Text, Platform, SafeAreaView } from 'react-native'
import { Tabs } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import { Redirect } from 'expo-router'
import { Ionicons, Feather } from '@expo/vector-icons'

// Ícone customizado para o scanner central
const ScannerTabIcon = ({ focused }: { focused: boolean }) => (
  <View className="items-center justify-center -mt-6">
    <View 
      className={`w-16 h-16 rounded-full items-center justify-center shadow-lg ${
        focused ? 'bg-coral-600' : 'bg-coral-500'
      }`}
      style={{
        shadowColor: '#FF7F6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Ionicons name="camera" size={28} color="white" />
    </View>
  </View>
)

export default function AppLayout() {
  const { session, loading } = useAuth()

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
            borderTopColor: '#f3f4f6',
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#FF7F6B',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Início',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Progresso',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'stats-chart' : 'stats-chart-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />

        <Tabs.Screen
          name="scanner"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => <ScannerTabIcon focused={focused} />,
          }}
        />

        <Tabs.Screen
          name="premium"
          options={{
            title: 'Premium',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'diamond' : 'diamond-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
    </View>
  )
}
