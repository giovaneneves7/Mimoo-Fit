import { useEffect } from 'react'
import { View, Text, ActivityIndicator, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'

export default function Index() {
  const router = useRouter()
  const { session, loading, hasCompletedOnboarding } = useAuth()

  useEffect(() => {
    if (loading) return

    // Aguarda um pouco para mostrar a splash
    const timer = setTimeout(() => {
      if (!session) {
        router.replace('/(auth)/login')
      } else if (!hasCompletedOnboarding) {
        router.replace('/onboarding/welcome')
      } else {
        router.replace('/(app)/dashboard')
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [loading, session, hasCompletedOnboarding])

  return (
    <View className="flex-1 bg-cream items-center justify-center">
      {/* Logo Mimoo */}
      <View className="w-32 h-32 bg-coral-500 rounded-full items-center justify-center mb-8 shadow-lg">
        <Text className="text-6xl">🐰</Text>
      </View>

      <Text className="font-heading text-4xl font-bold text-coral-500 mb-2">
        Mimoo
      </Text>
      <Text className="text-sage-600 text-lg mb-8">
        Seu companheiro de nutrição
      </Text>

      <ActivityIndicator size="large" color="#FF7F6B" />
    </View>
  )
}

