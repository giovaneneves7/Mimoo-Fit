import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'

const speeds = [
  {
    id: 'lento',
    emoji: '🐢',
    title: 'Devagar e sempre',
    description: '~0.25kg por semana',
    weeks: 4,
  },
  {
    id: 'normal',
    emoji: '🚶',
    title: 'Normal',
    description: '~0.5kg por semana',
    weeks: 2,
    recommended: true,
  },
  {
    id: 'rapido',
    emoji: '🏃',
    title: 'Acelerado',
    description: '~0.75kg por semana',
    weeks: 1.3,
  },
]

export default function Speed() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const handleSelect = (speedId: string) => {
    updateData({ velocidade: speedId as any })
    router.push('/onboarding/barriers')
  }

  // Calcula tempo estimado
  const getEstimate = (weeksPerKg: number) => {
    if (!data.peso || !data.peso_meta) return null
    const diff = Math.abs(data.peso - data.peso_meta)
    const weeks = Math.ceil(diff * weeksPerKg * 4)
    if (weeks < 4) return `~${weeks} semanas`
    const months = Math.ceil(weeks / 4)
    return `~${months} ${months === 1 ? 'mês' : 'meses'}`
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Progress */}
        <View className="flex-row gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} className="flex-1 h-2 bg-coral-500 rounded-full" />
          ))}
        </View>

        {/* Header */}
        <View className="mb-8">
          <View className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">⚡</Text>
          </View>
          <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
            Em que velocidade?
          </Text>
          <Text className="text-gray-500 text-lg">
            Lembre-se: consistência é mais importante que velocidade!
          </Text>
        </View>

        {/* Options */}
        <View className="flex-1 space-y-4">
          {speeds.map((speed) => {
            const estimate = getEstimate(speed.weeks)
            return (
              <TouchableOpacity
                key={speed.id}
                onPress={() => handleSelect(speed.id)}
                className={`p-5 rounded-3xl border-2 relative ${
                  data.velocidade === speed.id
                    ? 'bg-amber-50 border-amber-500'
                    : 'bg-white border-gray-100'
                }`}
                activeOpacity={0.7}
              >
                {speed.recommended && (
                  <View className="absolute -top-3 right-4 bg-amber-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">
                      Recomendado
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-amber-100 rounded-2xl items-center justify-center mr-4">
                    <Text className="text-3xl">{speed.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold text-lg ${
                        data.velocidade === speed.id
                          ? 'text-amber-700'
                          : 'text-gray-800'
                      }`}
                    >
                      {speed.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {speed.description}
                    </Text>
                    {estimate && (
                      <Text className="text-amber-600 text-xs mt-1 font-medium">
                        Estimativa: {estimate}
                      </Text>
                    )}
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 ${
                      data.velocidade === speed.id
                        ? 'border-amber-500 bg-white'
                        : 'border-gray-300'
                    } items-center justify-center`}
                  >
                    {data.velocidade === speed.id && (
                      <View className="w-3 h-3 rounded-full bg-amber-500" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Tip */}
        <View className="bg-sage-50 rounded-2xl p-4 mt-4">
          <Text className="text-sage-700 text-center text-sm">
            💡 O Mimoo recomenda o ritmo normal - é sustentável e saudável!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}


