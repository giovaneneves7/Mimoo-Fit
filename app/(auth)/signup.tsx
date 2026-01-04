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
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useOnboarding } from '../../contexts/OnboardingContext'
import { MimooImage } from '../../components/MimooImage'

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { updateData } = useOnboarding()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
        'Sucesso!',
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
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header com Mimoo */}
          <View className="items-center mb-10">
            <View className="mb-4">
              <MimooImage variant="main" size="xl" animation="bounce" />
            </View>
            <Text className="text-3xl font-bold text-gray-800 text-center">
              Vamos começar!
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-gray-500">Crie sua conta e conheça o Mimoo </Text>
              <Ionicons name="heart" size={16} color="#8FBC8F" />
            </View>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <View className="flex-row items-center h-14 bg-white rounded-2xl border border-gray-200 px-4">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Senha
              </Text>
              <View className="flex-row items-center h-14 bg-white rounded-2xl border border-gray-200 px-4">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirmar senha
              </Text>
              <View className="flex-row items-center h-14 bg-white rounded-2xl border border-gray-200 px-4">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repita a senha"
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className={`h-14 rounded-2xl items-center justify-center mt-8 shadow-lg flex-row ${
              loading ? 'bg-sage-300' : 'bg-sage-500'
            }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg">Criar conta</Text>
              </>
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
