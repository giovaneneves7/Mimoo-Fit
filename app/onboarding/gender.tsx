import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'

const genders = [
  {
    id: 'feminino',
    emoji: '👩',
    title: 'Feminino',
    color: 'bg-pink-100',
    borderColor: 'border-pink-500',
    selectedBg: 'bg-pink-50',
  },
  {
    id: 'masculino',
    emoji: '👨',
    title: 'Masculino',
    color: 'bg-blue-100',
    borderColor: 'border-blue-500',
    selectedBg: 'bg-blue-50',
  },
]

export default function Gender() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const handleSelect = (genderId: string) => {
    updateData({ genero: genderId as any })
    router.push('/onboarding/age')
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Progress */}
        <View className="flex-row gap-2 mb-8">
          <View className="flex-1 h-2 bg-coral-500 rounded-full" />
          <View className="flex-1 h-2 bg-coral-500 rounded-full" />
          <View className="flex-1 h-2 bg-coral-500 rounded-full" />
          <View className="flex-1 h-2 bg-gray-200 rounded-full" />
          <View className="flex-1 h-2 bg-gray-200 rounded-full" />
        </View>

        {/* Header */}
        <View className="mb-8">
          <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
            {data.nome ? `${data.nome}, qual seu sexo?` : 'Qual seu sexo?'}
          </Text>
          <Text className="text-gray-500 text-lg">
            Isso ajuda a calcular suas calorias
          </Text>
        </View>

        {/* Options */}
        <View className="flex-row gap-4 flex-1">
          {genders.map((gender) => (
            <TouchableOpacity
              key={gender.id}
              onPress={() => handleSelect(gender.id)}
              className={`flex-1 rounded-3xl border-2 items-center justify-center py-8 ${
                data.genero === gender.id
                  ? `${gender.selectedBg} ${gender.borderColor}`
                  : 'bg-white border-gray-100'
              }`}
              activeOpacity={0.7}
            >
              <View
                className={`w-24 h-24 rounded-full items-center justify-center mb-4 ${gender.color}`}
              >
                <Text className="text-5xl">{gender.emoji}</Text>
              </View>
              <Text
                className={`font-semibold text-xl ${
                  data.genero === gender.id ? 'text-gray-800' : 'text-gray-600'
                }`}
              >
                {gender.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}


