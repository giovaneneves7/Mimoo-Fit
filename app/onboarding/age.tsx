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

export default function Age() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const [age, setAge] = useState(data.idade?.toString() || '')

  const handleContinue = () => {
    const ageNum = parseInt(age)
    if (!ageNum || ageNum < 13 || ageNum > 100) return
    updateData({ idade: ageNum })
    router.push('/onboarding/height-weight')
  }

  const isValid = () => {
    const ageNum = parseInt(age)
    return ageNum && ageNum >= 13 && ageNum <= 100
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Progress */}
          <View className="flex-row gap-2 mb-8">
            <View className="flex-1 h-2 bg-coral-500 rounded-full" />
            <View className="flex-1 h-2 bg-coral-500 rounded-full" />
            <View className="flex-1 h-2 bg-coral-500 rounded-full" />
            <View className="flex-1 h-2 bg-coral-500 rounded-full" />
            <View className="flex-1 h-2 bg-gray-200 rounded-full" />
          </View>

          {/* Header */}
          <View className="mb-8">
            <View className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">🎂</Text>
            </View>
            <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
              Qual sua idade?
            </Text>
            <Text className="text-gray-500 text-lg">
              Idade influencia no metabolismo
            </Text>
          </View>

          {/* Input */}
          <View className="flex-row items-center justify-center mb-8">
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="25"
              keyboardType="number-pad"
              maxLength={3}
              autoFocus
              className="w-32 h-24 text-center bg-white rounded-3xl border-2 border-gray-100 text-5xl font-bold text-gray-800"
              placeholderTextColor="#D1D5DB"
            />
            <Text className="text-2xl text-gray-500 ml-4">anos</Text>
          </View>

          {/* Info */}
          <View className="bg-sage-50 rounded-2xl p-4 flex-row items-center">
            <Text className="text-2xl mr-3">💡</Text>
            <Text className="text-sage-700 flex-1">
              Seu metabolismo muda com a idade. Com essa info, calculamos suas
              calorias de forma mais precisa.
            </Text>
          </View>

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

