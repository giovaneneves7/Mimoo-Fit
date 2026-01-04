import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'

export default function Welcome() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-sage-50">
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Hero */}
        <View className="flex-1 items-center justify-center">
          <View className="w-40 h-40 bg-coral-500 rounded-full items-center justify-center mb-8 shadow-xl">
            <Text className="text-7xl">🐰</Text>
          </View>

          <Text className="font-heading text-4xl font-bold text-gray-800 text-center mb-4">
            Olá! Eu sou o{'\n'}
            <Text className="text-coral-500">Mimoo</Text>
          </Text>

          <Text className="text-gray-600 text-center text-lg px-8 leading-relaxed">
            Seu companheiro de nutrição afetiva.{'\n'}
            Vou te ajudar a cuidar da sua saúde{'\n'}
            com carinho e sem neuras! 💚
          </Text>
        </View>

        {/* Features */}
        <View className="bg-white rounded-3xl p-6 mb-8 shadow-lg">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-coral-100 rounded-2xl items-center justify-center mr-4">
              <Text className="text-2xl">📸</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">Foto do prato</Text>
              <Text className="text-gray-500 text-sm">
                Tire uma foto e descubra as calorias
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-sage-100 rounded-2xl items-center justify-center mr-4">
              <Text className="text-2xl">💧</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">Hidratação</Text>
              <Text className="text-gray-500 text-sm">
                Lembretes carinhosos para beber água
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-amber-100 rounded-2xl items-center justify-center mr-4">
              <Text className="text-2xl">🎯</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">Sem julgamentos</Text>
              <Text className="text-gray-500 text-sm">
                Consciência com carinho, não culpa
              </Text>
            </View>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={() => router.push('/onboarding/goal')}
          className="h-16 bg-coral-500 rounded-2xl items-center justify-center shadow-lg"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">Vamos começar! 🌱</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

