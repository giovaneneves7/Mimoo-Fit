import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        tabBarActiveTintColor: '#FF7F6B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`w-10 h-10 rounded-xl items-center justify-center ${
                focused ? 'bg-coral-100' : ''
              }`}
            >
              <Text style={{ fontSize: 24 }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`w-14 h-14 rounded-full items-center justify-center -mt-6 ${
                focused ? 'bg-coral-500' : 'bg-coral-400'
              } shadow-lg`}
            >
              <Text style={{ fontSize: 28 }}>📸</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`w-10 h-10 rounded-xl items-center justify-center ${
                focused ? 'bg-coral-100' : ''
              }`}
            >
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  )
}

