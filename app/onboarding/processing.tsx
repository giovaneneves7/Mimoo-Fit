import { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'

const loadingTexts = [
  '🔍 Analisando seus dados...',
  '📊 Calculando seu metabolismo...',
  '🎯 Definindo suas metas...',
  '💚 Preparando seu plano personalizado...',
  '✨ Quase lá...',
]

export default function Processing() {
  const router = useRouter()
  const { data } = useOnboarding()
  const [currentText, setCurrentText] = useState(0)
  const [progress] = useState(new Animated.Value(0))

  useEffect(() => {
    // Anima a barra de progresso
    Animated.timing(progress, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: false,
    }).start()

    // Muda os textos
    const interval = setInterval(() => {
      setCurrentText((prev) => {
        if (prev < loadingTexts.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 800)

    // Redireciona após 4s
    const timer = setTimeout(() => {
      router.replace('/onboarding/results')
    }, 4000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 items-center justify-center px-6">
        {/* Mimoo animado */}
        <View className="w-32 h-32 bg-coral-500 rounded-full items-center justify-center mb-8 shadow-lg">
          <Text className="text-6xl">🐰</Text>
        </View>

        {/* Texto atual */}
        <Text className="font-heading text-2xl font-bold text-gray-800 text-center mb-8">
          {loadingTexts[currentText]}
        </Text>

        {/* Barra de progresso */}
        <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            style={{ width: widthInterpolate }}
            className="h-full bg-coral-500 rounded-full"
          />
        </View>

        {/* Info */}
        <View className="mt-12 bg-sage-50 rounded-2xl p-6">
          <Text className="text-sage-700 text-center">
            O Mimoo está criando um plano especialmente para você,{' '}
            <Text className="font-bold">{data.nome || 'amiga'}</Text>! 💚
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

