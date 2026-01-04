import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'

export default function TargetWeight() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const [targetWeight, setTargetWeight] = useState(data.peso_meta?.toString() || '')

  const handleContinue = () => {
    const targetNum = parseFloat(targetWeight)
    if (!targetNum) return
    updateData({ peso_meta: targetNum })
    router.push('/onboarding/activity')
  }

  const isValid = () => {
    const target = parseFloat(targetWeight)
    return target >= 30 && target <= 300
  }

  const getDifference = () => {
    const current = data.peso || 0
    const target = parseFloat(targetWeight)
    if (!target) return null
    return (current - target).toFixed(1)
  }

  const diff = getDifference()

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Progress */}
          <View className="flex-row gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i <= 5 ? 'bg-coral-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </View>

          {/* Header */}
          <View className="mb-8">
            <View className="w-20 h-20 bg-coral-100 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">🎯</Text>
            </View>
            <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
              Qual seu peso meta?
            </Text>
            <Text className="text-gray-500 text-lg">
              Onde você quer chegar?
            </Text>
          </View>

          {/* Current weight display */}
          {data.peso && (
            <View className="bg-gray-100 rounded-2xl p-4 mb-6">
              <Text className="text-gray-600 text-center">
                Peso atual: <Text className="font-bold">{data.peso} kg</Text>
              </Text>
            </View>
          )}

          {/* Input */}
          <View className="flex-row items-center justify-center mb-6">
            <TextInput
              value={targetWeight}
              onChangeText={setTargetWeight}
              placeholder="65"
              keyboardType="decimal-pad"
              maxLength={5}
              autoFocus
              className="w-32 h-24 text-center bg-white rounded-3xl border-2 border-coral-200 text-5xl font-bold text-gray-800"
              placeholderTextColor="#D1D5DB"
            />
            <Text className="text-2xl text-gray-500 ml-4">kg</Text>
          </View>

          {/* Difference */}
          {diff && parseFloat(diff) !== 0 && (
            <View
              className={`rounded-2xl p-4 ${
                parseFloat(diff) > 0 ? 'bg-sage-50' : 'bg-amber-50'
              }`}
            >
              <Text
                className={`text-center ${
                  parseFloat(diff) > 0 ? 'text-sage-700' : 'text-amber-700'
                }`}
              >
                {parseFloat(diff) > 0 ? '📉' : '📈'}{' '}
                {parseFloat(diff) > 0 ? 'Perder' : 'Ganhar'}{' '}
                <Text className="font-bold">{Math.abs(parseFloat(diff))} kg</Text>
              </Text>
            </View>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isValid()}
            className={`h-16 rounded-2xl items-center justify-center ${
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

