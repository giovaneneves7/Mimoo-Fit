import { useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'

const barriers = [
  { id: 'tempo', emoji: '⏰', title: 'Falta de tempo' },
  { id: 'motivacao', emoji: '😔', title: 'Falta de motivação' },
  { id: 'ansiedade', emoji: '😰', title: 'Ansiedade' },
  { id: 'stress', emoji: '🤯', title: 'Estresse' },
  { id: 'compulsao', emoji: '🍕', title: 'Compulsão alimentar' },
  { id: 'social', emoji: '👥', title: 'Eventos sociais' },
  { id: 'tpm', emoji: '🌙', title: 'TPM' },
  { id: 'cansaco', emoji: '😴', title: 'Cansaço' },
  { id: 'nenhuma', emoji: '✨', title: 'Nenhuma barreira' },
]

export default function Barriers() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const [selected, setSelected] = useState<string[]>(data.barreiras || [])

  const handleToggle = (barrierId: string) => {
    if (barrierId === 'nenhuma') {
      setSelected(['nenhuma'])
      return
    }

    const newSelected = selected.filter((id) => id !== 'nenhuma')
    if (selected.includes(barrierId)) {
      setSelected(newSelected.filter((id) => id !== barrierId))
    } else {
      setSelected([...newSelected, barrierId])
    }
  }

  const handleContinue = () => {
    updateData({ barreiras: selected })
    router.push('/onboarding/processing')
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-8">
          {/* Progress */}
          <View className="flex-row gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} className="flex-1 h-2 bg-coral-500 rounded-full" />
            ))}
          </View>

          {/* Header */}
          <View className="mb-8">
            <View className="w-20 h-20 bg-coral-100 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">🤔</Text>
            </View>
            <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
              Quais são suas barreiras?
            </Text>
            <Text className="text-gray-500 text-lg">
              O Mimoo quer te conhecer melhor 💚
            </Text>
          </View>

          {/* Options */}
          <View className="flex-row flex-wrap gap-3">
            {barriers.map((barrier) => (
              <TouchableOpacity
                key={barrier.id}
                onPress={() => handleToggle(barrier.id)}
                className={`px-5 py-3 rounded-2xl border-2 ${
                  selected.includes(barrier.id)
                    ? 'bg-coral-50 border-coral-500'
                    : 'bg-white border-gray-100'
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-xl mr-2">{barrier.emoji}</Text>
                  <Text
                    className={`font-medium ${
                      selected.includes(barrier.id)
                        ? 'text-coral-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {barrier.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info */}
          <View className="bg-sage-50 rounded-2xl p-4 mt-8">
            <Text className="text-sage-700 text-center">
              💡 Conhecer suas barreiras ajuda o Mimoo a te apoiar melhor nos
              momentos difíceis.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={selected.length === 0}
          className={`h-16 rounded-2xl items-center justify-center ${
            selected.length > 0 ? 'bg-coral-500' : 'bg-gray-200'
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`font-bold text-lg ${
              selected.length > 0 ? 'text-white' : 'text-gray-400'
            }`}
          >
            Continuar
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}







