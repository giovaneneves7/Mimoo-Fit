import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'

const activities = [
  {
    id: 'sedentario',
    emoji: '🛋️',
    title: 'Sedentário',
    description: 'Trabalho de escritório, pouco exercício',
  },
  {
    id: 'leve',
    emoji: '🚶',
    title: 'Levemente ativo',
    description: 'Exercício leve 1-3 dias/semana',
  },
  {
    id: 'moderado',
    emoji: '🏃',
    title: 'Moderadamente ativo',
    description: 'Exercício moderado 3-5 dias/semana',
    recommended: true,
  },
  {
    id: 'muito',
    emoji: '🏋️',
    title: 'Muito ativo',
    description: 'Exercício intenso 6-7 dias/semana',
  },
]

export default function Activity() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const handleSelect = (activityId: string) => {
    updateData({ nivel_atividade: activityId as any })
    router.push('/onboarding/speed')
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-8">
          {/* Progress */}
          <View className="flex-row gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                className="flex-1 h-2 bg-coral-500 rounded-full"
              />
            ))}
          </View>

          {/* Header */}
          <View className="mb-8">
            <View className="w-20 h-20 bg-sage-100 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">💪</Text>
            </View>
            <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
              Qual seu nível de atividade?
            </Text>
            <Text className="text-gray-500 text-lg">
              Seja honesta, o Mimoo não julga! 💚
            </Text>
          </View>

          {/* Options */}
          <View className="space-y-4">
            {activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                onPress={() => handleSelect(activity.id)}
                className={`p-5 rounded-3xl border-2 relative ${
                  data.nivel_atividade === activity.id
                    ? 'bg-sage-50 border-sage-500'
                    : 'bg-white border-gray-100'
                }`}
                activeOpacity={0.7}
              >
                {activity.recommended && (
                  <View className="absolute -top-3 right-4 bg-sage-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">
                      Recomendado
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-gray-100 rounded-2xl items-center justify-center mr-4">
                    <Text className="text-3xl">{activity.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold text-lg ${
                        data.nivel_atividade === activity.id
                          ? 'text-sage-700'
                          : 'text-gray-800'
                      }`}
                    >
                      {activity.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {activity.description}
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 ${
                      data.nivel_atividade === activity.id
                        ? 'border-sage-500 bg-white'
                        : 'border-gray-300'
                    } items-center justify-center`}
                  >
                    {data.nivel_atividade === activity.id && (
                      <View className="w-3 h-3 rounded-full bg-sage-500" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}







