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

export default function Login() {
  const router = useRouter()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ops!', 'Preencha todos os campos')
      return
    }

    setLoading(true)

    try {
      const { error, hasProfile } = await signIn(email, password)

      if (error) {
        Alert.alert('Erro', error.message)
        return
      }

      if (hasProfile) {
        router.replace('/(app)/dashboard')
      } else {
        router.replace('/onboarding/welcome')
      }
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
            <View className="w-24 h-24 bg-coral-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">🐰</Text>
            </View>
            <Text className="font-heading text-3xl font-bold text-gray-800">
              Bem-vinda de volta!
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              O Mimoo sentiu sua falta 💚
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
                placeholder="••••••••"
                secureTextEntry
                className="h-14 px-4 bg-white rounded-2xl border border-gray-200 text-gray-800"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity>
              <Text className="text-coral-500 text-sm text-right font-medium">
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`h-14 rounded-2xl items-center justify-center mt-8 ${
              loading ? 'bg-coral-300' : 'bg-coral-500'
            }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-gray-500">Não tem uma conta? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-coral-500 font-bold">Criar conta</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}


