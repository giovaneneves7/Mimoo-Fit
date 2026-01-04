import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MimooImage } from '../../components/MimooImage'

export default function Premium() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')

  const features = [
    {
      icon: '🔓',
      title: 'Refeições ilimitadas',
      description: 'Analise quantas refeições quiser por dia'
    },
    {
      icon: '📊',
      title: 'Relatórios avançados',
      description: 'Gráficos detalhados de progresso semanal e mensal'
    },
    {
      icon: '🎯',
      title: 'Metas personalizadas',
      description: 'Defina metas para cada macronutriente'
    },
    {
      icon: '🤖',
      title: 'IA aprimorada',
      description: 'Análises mais precisas com feedback personalizado'
    },
    {
      icon: '📱',
      title: 'Sem anúncios',
      description: 'Experiência limpa e sem interrupções'
    },
    {
      icon: '🎨',
      title: 'Temas exclusivos',
      description: 'Personalize o visual do seu app'
    },
  ]

  const handleSubscribe = () => {
    Alert.alert(
      'Em breve! 🚀',
      'O Mimoo Premium estará disponível muito em breve. Fique ligado!',
      [{ text: 'OK' }]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-gradient-to-b from-amber-400 to-amber-500 px-6 pt-6 pb-16 rounded-b-[3rem]">
          <View className="items-center">
            <View className="flex-row items-center gap-2 mb-4">
              <Text className="text-4xl">✨</Text>
              <Text className="text-3xl font-bold text-white">Mimoo Premium</Text>
            </View>
            <Text className="text-amber-100 text-center">
              Desbloqueie todo o potencial do Mimoo
            </Text>
          </View>
        </View>

        <View className="px-6 -mt-10">
          {/* Mimoo feliz */}
          <View className="items-center mb-6">
            <View className="bg-white rounded-full p-4 shadow-lg">
              <MimooImage variant="salad" size="lg" />
            </View>
          </View>

          {/* Planos */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setSelectedPlan('monthly')}
              className={`flex-1 p-4 rounded-2xl border-2 ${
                selectedPlan === 'monthly' 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className="text-sm text-gray-500 text-center">Mensal</Text>
              <Text className="text-2xl font-bold text-gray-800 text-center">R$ 19,90</Text>
              <Text className="text-xs text-gray-500 text-center">/mês</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPlan('yearly')}
              className={`flex-1 p-4 rounded-2xl border-2 relative ${
                selectedPlan === 'yearly' 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <View className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-500 px-3 py-1 rounded-full">
                <Text className="text-xs text-white font-bold">-40%</Text>
              </View>
              <Text className="text-sm text-gray-500 text-center">Anual</Text>
              <Text className="text-2xl font-bold text-gray-800 text-center">R$ 11,90</Text>
              <Text className="text-xs text-gray-500 text-center">/mês</Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <Text className="text-lg font-bold text-gray-800 mb-4">O que você ganha:</Text>
          <View className="bg-white rounded-3xl p-4 shadow-lg mb-6">
            {features.map((feature, index) => (
              <View 
                key={index} 
                className={`flex-row items-start py-4 ${
                  index !== features.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className="w-12 h-12 bg-amber-100 rounded-2xl items-center justify-center mr-4">
                  <Text className="text-2xl">{feature.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{feature.title}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{feature.description}</Text>
                </View>
                <Text className="text-sage-500 text-xl">✓</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleSubscribe}
            className="bg-amber-500 h-16 rounded-3xl items-center justify-center shadow-lg mb-4"
          >
            <Text className="text-white font-bold text-lg">
              Começar {selectedPlan === 'yearly' ? '7 dias grátis' : 'agora'}
            </Text>
          </TouchableOpacity>

          {selectedPlan === 'yearly' && (
            <Text className="text-center text-gray-500 text-sm mb-4">
              7 dias grátis, depois R$ 142,80/ano
            </Text>
          )}

          {/* Garantia */}
          <View className="flex-row items-center justify-center gap-2 mb-8">
            <Text className="text-xl">🛡️</Text>
            <Text className="text-gray-600 text-sm">
              Cancele quando quiser, sem burocracia
            </Text>
          </View>

          {/* Depoimentos */}
          <Text className="text-lg font-bold text-gray-800 mb-4">O que nossos usuários dizem:</Text>
          <View className="space-y-3 mb-8">
            {[
              {
                name: 'Ana Carolina',
                text: 'O Premium mudou minha vida! Consigo acompanhar tudo muito melhor.',
                stars: 5
              },
              {
                name: 'Beatriz',
                text: 'Os relatórios são incríveis! Finalmente entendo meus hábitos.',
                stars: 5
              },
            ].map((review, index) => (
              <View key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <View className="flex-row items-center mb-2">
                  <Text className="font-semibold text-gray-800">{review.name}</Text>
                  <Text className="ml-2">{'⭐'.repeat(review.stars)}</Text>
                </View>
                <Text className="text-gray-600 text-sm">{review.text}</Text>
              </View>
            ))}
          </View>

          {/* Espaço para bottom nav */}
          <View className="h-24" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

