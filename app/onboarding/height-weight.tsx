import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'

export default function HeightWeight() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const [height, setHeight] = useState(data.altura?.toString() || '')
  const [weight, setWeight] = useState(data.peso?.toString() || '')

  const handleContinue = () => {
    const heightNum = parseFloat(height)
    const weightNum = parseFloat(weight)
    if (!heightNum || !weightNum) return
    updateData({ altura: heightNum, peso: weightNum })
    router.push('/onboarding/target-weight')
  }

  const isValid = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    return h >= 100 && h <= 250 && w >= 30 && w <= 300
  }

  // Calcula IMC se tiver ambos os valores
  const calculateIMC = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || !w) return null
    return (w / Math.pow(h / 100, 2)).toFixed(1)
  }

  const imc = calculateIMC()

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-12 pb-8">
            {/* Progress */}
            <View className="flex-row gap-2 mb-8">
              <View className="flex-1 h-2 bg-coral-500 rounded-full" />
              <View className="flex-1 h-2 bg-coral-500 rounded-full" />
              <View className="flex-1 h-2 bg-coral-500 rounded-full" />
              <View className="flex-1 h-2 bg-coral-500 rounded-full" />
              <View className="flex-1 h-2 bg-coral-500 rounded-full" />
            </View>

            {/* Header */}
            <View className="mb-8">
              <View className="w-20 h-20 bg-sage-100 rounded-full items-center justify-center mb-6">
                <Text className="text-4xl">📏</Text>
              </View>
              <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
                Medidas atuais
              </Text>
              <Text className="text-gray-500 text-lg">
                Altura e peso atual
              </Text>
            </View>

            {/* Inputs */}
            <View className="space-y-6">
              {/* Altura */}
              <View>
                <Text className="text-sm font-medium text-gray-600 mb-2">
                  Altura
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    value={height}
                    onChangeText={setHeight}
                    placeholder="170"
                    keyboardType="number-pad"
                    maxLength={3}
                    className="flex-1 h-16 px-6 bg-white rounded-2xl border-2 border-gray-100 text-2xl font-bold text-gray-800"
                    placeholderTextColor="#D1D5DB"
                  />
                  <Text className="text-xl text-gray-500 ml-4">cm</Text>
                </View>
              </View>

              {/* Peso */}
              <View>
                <Text className="text-sm font-medium text-gray-600 mb-2">
                  Peso atual
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="70"
                    keyboardType="decimal-pad"
                    maxLength={5}
                    className="flex-1 h-16 px-6 bg-white rounded-2xl border-2 border-gray-100 text-2xl font-bold text-gray-800"
                    placeholderTextColor="#D1D5DB"
                  />
                  <Text className="text-xl text-gray-500 ml-4">kg</Text>
                </View>
              </View>
            </View>

            {/* IMC Preview */}
            {imc && (
              <View className="bg-coral-50 rounded-2xl p-4 mt-6">
                <Text className="text-coral-600 text-center">
                  <Text className="font-bold">Seu IMC:</Text> {imc}
                </Text>
              </View>
            )}

            {/* Spacer */}
            <View className="flex-1" />

            {/* Button */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={!isValid()}
              className={`h-16 rounded-2xl items-center justify-center mt-8 ${
                isValid() ? 'bg-coral-500' : 'bg-gray-200'
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`font-bold text-lg ${
                  isValid() ? 'text-white' : 'text-gray-400'
                }`}
              >
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

