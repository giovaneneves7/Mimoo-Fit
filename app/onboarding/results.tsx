import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useOnboarding } from '../../contexts/OnboardingContext'
import { useAuth } from '../../contexts/AuthContext'
import {
  createUserProfile,
  calculateIMC,
  calculateTMB,
  calculateDailyCalorias,
} from '../../lib/supabase'

export default function Results() {
  const router = useRouter()
  const { data, clearData } = useOnboarding()
  const { user, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)

  // Cálculos
  const imc = data.peso && data.altura ? calculateIMC(data.peso, data.altura) : 0
  const tmb =
    data.peso && data.altura && data.idade && data.genero
      ? calculateTMB(data.peso, data.altura, data.idade, data.genero)
      : 0
  const calorias =
    tmb && data.nivel_atividade && data.objetivo && data.velocidade
      ? calculateDailyCalorias(tmb, data.nivel_atividade, data.objetivo, data.velocidade)
      : 0

  // Status do IMC
  const getIMCStatus = () => {
    if (imc < 18.5) return { text: 'Abaixo do peso', color: 'text-amber-600' }
    if (imc < 25) return { text: 'Peso normal', color: 'text-sage-600' }
    if (imc < 30) return { text: 'Sobrepeso', color: 'text-amber-600' }
    return { text: 'Obesidade', color: 'text-coral-600' }
  }

  const imcStatus = getIMCStatus()

  const handleSave = async () => {
    if (!data.nome || !data.genero || !data.peso || !data.altura) {
      Alert.alert('Ops!', 'Dados incompletos. Volte e preencha tudo.')
      return
    }

    setSaving(true)

    try {
      const profileData = {
        nome: data.nome,
        email: data.email || user?.email || '',
        objetivo: data.objetivo || 'perder_peso',
        genero: data.genero,
        altura: data.altura,
        peso: data.peso,
        idade: data.idade || 25,
        peso_meta: data.peso_meta || data.peso,
        nivel_atividade: data.nivel_atividade || 'moderado',
        velocidade: data.velocidade || 'normal',
        historico_anos: data.historico_anos,
        tentativas_anteriores: data.tentativas_anteriores,
        barreiras: data.barreiras,
        gatilho_emocional: data.gatilho_emocional,
        proximo_nivel: data.proximo_nivel,
      }

      const result = await createUserProfile(profileData as any, user?.id)

      if (!result) {
        throw new Error('Erro ao salvar perfil')
      }

      await refreshProfile()
      clearData()
      router.replace('/(app)/dashboard')
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao salvar dados')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-sage-500 rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-5xl">🎉</Text>
            </View>
            <Text className="font-heading text-3xl font-bold text-gray-800 text-center">
              Tudo pronto, {data.nome}!
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              Aqui está seu plano personalizado
            </Text>
          </View>

          {/* IMC Card */}
          <View className="bg-white rounded-3xl p-6 mb-4 shadow-lg">
            <Text className="text-gray-500 text-sm mb-2">Seu IMC</Text>
            <View className="flex-row items-end">
              <Text className="text-5xl font-bold text-gray-800">
                {imc.toFixed(1)}
              </Text>
              <Text className={`ml-3 font-medium ${imcStatus.color}`}>
                {imcStatus.text}
              </Text>
            </View>
          </View>

          {/* Calories Card */}
          <View className="bg-coral-500 rounded-3xl p-6 mb-4 shadow-lg">
            <Text className="text-coral-100 text-sm mb-2">
              Meta calórica diária
            </Text>
            <View className="flex-row items-end">
              <Text className="text-5xl font-bold text-white">{calorias}</Text>
              <Text className="text-coral-100 ml-2 mb-2">kcal</Text>
            </View>
            <Text className="text-coral-100 mt-2">
              Baseado no seu objetivo de{' '}
              {data.objetivo === 'perder_peso'
                ? 'perder peso'
                : data.objetivo === 'manter_peso'
                ? 'manter peso'
                : 'ganhar massa'}
            </Text>
          </View>

          {/* Macros */}
          <View className="bg-white rounded-3xl p-6 mb-4 shadow-lg">
            <Text className="text-gray-500 text-sm mb-4">
              Distribuição sugerida
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <View className="w-16 h-16 bg-amber-100 rounded-2xl items-center justify-center mb-2">
                  <Text className="text-2xl">🍞</Text>
                </View>
                <Text className="font-bold text-gray-800">
                  {Math.round(calorias * 0.45 / 4)}g
                </Text>
                <Text className="text-gray-500 text-xs">Carboidratos</Text>
              </View>
              <View className="items-center">
                <View className="w-16 h-16 bg-coral-100 rounded-2xl items-center justify-center mb-2">
                  <Text className="text-2xl">🥩</Text>
                </View>
                <Text className="font-bold text-gray-800">
                  {Math.round(calorias * 0.30 / 4)}g
                </Text>
                <Text className="text-gray-500 text-xs">Proteínas</Text>
              </View>
              <View className="items-center">
                <View className="w-16 h-16 bg-sage-100 rounded-2xl items-center justify-center mb-2">
                  <Text className="text-2xl">🥑</Text>
                </View>
                <Text className="font-bold text-gray-800">
                  {Math.round(calorias * 0.25 / 9)}g
                </Text>
                <Text className="text-gray-500 text-xs">Gorduras</Text>
              </View>
            </View>
          </View>

          {/* Mimoo message */}
          <View className="bg-sage-50 rounded-3xl p-6 mb-8">
            <View className="flex-row items-start">
              <View className="w-12 h-12 bg-coral-500 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">🐰</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800 mb-1">
                  Dica do Mimoo:
                </Text>
                <Text className="text-gray-600">
                  Não se preocupe em ser perfeita! O mais importante é a
                  consistência. Vamos juntas nessa jornada! 💚
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Button */}
      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`h-16 rounded-2xl items-center justify-center ${
            saving ? 'bg-sage-300' : 'bg-sage-500'
          }`}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Começar minha jornada! 🌱
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}


