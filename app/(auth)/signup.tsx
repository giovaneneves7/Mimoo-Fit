import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import { useOnboarding } from '../../contexts/OnboardingContext'

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { updateData } = useOnboarding()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Ops!', 'Preencha todos os campos')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Ops!', 'As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      Alert.alert('Ops!', 'A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password)

      if (error) {
        Alert.alert('Erro', error.message)
        return
      }

      // Salva email no contexto de onboarding
      updateData({ email })

      Alert.alert(
        'Sucesso! 🎉',
        'Conta criada! Verifique seu email para confirmar.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/onboarding/welcome'),
          },
        ]
      )
    } catch (error: any) {
      Alert.alert('Erro', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-cream"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-sage-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">🌱</Text>
            </View>
            <Text className="font-heading text-3xl font-bold text-gray-800">
              Vamos começar!
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Crie sua conta e conheça o Mimoo 💚
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="h-14 px-4 bg-white rounded-2xl border border-gray-200 text-gray-800"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Senha
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                className="h-14 px-4 bg-white rounded-2xl border border-gray-200 text-gray-800"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirmar senha
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repita a senha"
                secureTextEntry
                className="h-14 px-4 bg-white rounded-2xl border border-gray-200 text-gray-800"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className={`h-14 rounded-2xl items-center justify-center mt-8 ${
              loading ? 'bg-sage-300' : 'bg-sage-500'
            }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Criar conta</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-gray-500">Já tem uma conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-sage-600 font-bold">Entrar</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Terms */}
          <Text className="text-xs text-gray-400 text-center mt-4 px-8">
            Ao criar uma conta, você concorda com nossos{' '}
            <Text className="text-coral-500">Termos de Uso</Text> e{' '}
            <Text className="text-coral-500">Política de Privacidade</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}


