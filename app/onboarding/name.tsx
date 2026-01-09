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

export default function Name() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const [name, setName] = useState(data.nome || '')

  const handleContinue = () => {
    if (!name.trim()) return
    updateData({ nome: name.trim() })
    router.push('/onboarding/gender')
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
            <View className="flex-1 h-2 bg-gray-200 rounded-full" />
            <View className="flex-1 h-2 bg-gray-200 rounded-full" />
            <View className="flex-1 h-2 bg-gray-200 rounded-full" />
          </View>

          {/* Header */}
          <View className="mb-8">
            <View className="w-20 h-20 bg-coral-100 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">👋</Text>
            </View>
            <Text className="font-heading text-3xl font-bold text-gray-800 mb-2">
              Como posso te chamar?
            </Text>
            <Text className="text-gray-500 text-lg">
              O Mimoo adora conhecer você!
            </Text>
          </View>

          {/* Input */}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            autoFocus
            autoCapitalize="words"
            className="h-16 px-6 bg-white rounded-2xl border-2 border-gray-100 text-gray-800 text-xl font-medium"
            placeholderTextColor="#9CA3AF"
          />

          {/* Spacer */}
          <View className="flex-1" />

          {/* Button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!name.trim()}
            className={`h-16 rounded-2xl items-center justify-center ${
              name.trim() ? 'bg-coral-500' : 'bg-gray-200'
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`font-bold text-lg ${
                name.trim() ? 'text-white' : 'text-gray-400'
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







