import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'

const goals = [
  {
    id: 'perder_peso',
    emoji: '📉',
    title: 'Perder peso',
    description: 'Quero emagrecer de forma saudável',
    color: 'bg-coral-100',
    borderColor: 'border-coral-500',
    textColor: 'text-coral-600',
  },
  {
    id: 'manter_peso',
    emoji: '⚖️',
    title: 'Manter peso',
    description: 'Quero manter meu peso atual',
    color: 'bg-sage-100',
    borderColor: 'border-sage-500',
    textColor: 'text-sage-600',
  },
  {
    id: 'ganhar_massa',
    emoji: '📈',
    title: 'Ganhar massa',
    description: 'Quero ganhar massa muscular',
    color: 'bg-amber-100',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-600',
  },
]

export default function Goal() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const handleSelect = (goalId: string) => {
    updateData({ objetivo: goalId as any })
    router.push('/onboarding/name')
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Progress */}
        <View className="flex-row gap-2 mb-8">
          <View className="flex-1 h-2 bg-coral-500 rounded-full" />
          <View className="flex-1 h-2 bg-gray-200 rounded-full" />
          <View className="flex-1 h-2 bg-gray-200 rounded-full" />
          <View className="flex-1 h-2 bg-gray-200 rounded-full" />
          <View className="flex-1 h-2 bg-gray-200 rounded-full" />
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
            Qual é seu objetivo?
          </Text>
          <Text className="text-gray-500 text-lg">
            O Mimoo vai te ajudar a chegar lá! 💚
          </Text>
        </View>

        {/* Options */}
        <View className="flex-1 space-y-4">
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              onPress={() => handleSelect(goal.id)}
              className={`p-5 rounded-3xl border-2 ${
                data.objetivo === goal.id
                  ? `${goal.color} ${goal.borderColor}`
                  : 'bg-white border-gray-100'
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${goal.color}`}
                >
                  <Text className="text-3xl">{goal.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-semibold text-lg ${
                      data.objetivo === goal.id ? goal.textColor : 'text-gray-800'
                    }`}
                  >
                    {goal.title}
                  </Text>
                  <Text className="text-gray-500">{goal.description}</Text>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 ${
                    data.objetivo === goal.id
                      ? `${goal.borderColor} bg-white`
                      : 'border-gray-300'
                  } items-center justify-center`}
                >
                  {data.objetivo === goal.id && (
                    <View className={`w-3 h-3 rounded-full ${goal.color.replace('100', '500')}`} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

