import { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { MimooImage } from '../../components/MimooImage'

const { width } = Dimensions.get('window')
const REVIEW_WIDTH = width - 80

interface Review {
  id: string
  name: string
  age: number
  location: string
  text: string
  stars: number
  weightLost: string
  avatar: string
  color: string
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Ana Carolina',
    age: 28,
    location: 'São Paulo, SP',
    text: 'O Premium mudou minha vida! Consigo acompanhar tudo muito melhor. Em 3 meses perdi 8kg só com o acompanhamento do Mimoo.',
    stars: 5,
    weightLost: '-8kg',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    color: '#FF7F6B'
  },
  {
    id: '2',
    name: 'Beatriz Lima',
    age: 32,
    location: 'Rio de Janeiro, RJ',
    text: 'Os relatórios são incríveis! Finalmente entendo meus hábitos alimentares. A IA do Mimoo é muito precisa!',
    stars: 5,
    weightLost: '-5kg',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    color: '#8FBC8F'
  },
  {
    id: '3',
    name: 'Carlos Eduardo',
    age: 35,
    location: 'Belo Horizonte, MG',
    text: 'Nunca tinha conseguido manter uma dieta. Com o Mimoo Premium, perdi 12kg em 4 meses e mantive!',
    stars: 5,
    weightLost: '-12kg',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    color: '#FFB347'
  },
  {
    id: '4',
    name: 'Mariana Santos',
    age: 24,
    location: 'Curitiba, PR',
    text: 'Amo o coelhinho! 🐰 A experiência sem anúncios e os temas exclusivos deixam o app muito mais gostoso de usar.',
    stars: 5,
    weightLost: '-6kg',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    color: '#DDA0DD'
  },
  {
    id: '5',
    name: 'Ricardo Oliveira',
    age: 41,
    location: 'Porto Alegre, RS',
    text: 'Como médico, recomendo o Mimoo para meus pacientes. A análise nutricional é precisa e os relatórios ajudam muito no acompanhamento.',
    stars: 5,
    weightLost: '-10kg',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    color: '#87CEEB'
  },
  {
    id: '6',
    name: 'Fernanda Costa',
    age: 29,
    location: 'Salvador, BA',
    text: 'Depois de ter meu bebê, precisava perder peso de forma saudável. O Mimoo me ajudou a fazer isso sem loucuras!',
    stars: 5,
    weightLost: '-15kg',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    color: '#F0E68C'
  },
]

export default function Premium() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const features = [
    {
      icon: 'infinite',
      title: 'Refeições ilimitadas',
      description: 'Analise quantas refeições quiser por dia'
    },
    {
      icon: 'bar-chart',
      title: 'Relatórios avançados',
      description: 'Gráficos detalhados de progresso semanal e mensal'
    },
    {
      icon: 'flag',
      title: 'Metas personalizadas',
      description: 'Defina metas para cada macronutriente'
    },
    {
      icon: 'sparkles',
      title: 'IA aprimorada',
      description: 'Análises mais precisas com feedback personalizado'
    },
    {
      icon: 'eye-off',
      title: 'Sem anúncios',
      description: 'Experiência limpa e sem interrupções'
    },
    {
      icon: 'color-palette',
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

  const goToReview = (index: number) => {
    if (index >= 0 && index < reviews.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true })
      setCurrentReviewIndex(index)
    }
  }

  const nextReview = () => {
    const next = currentReviewIndex < reviews.length - 1 ? currentReviewIndex + 1 : 0
    goToReview(next)
  }

  const prevReview = () => {
    const prev = currentReviewIndex > 0 ? currentReviewIndex - 1 : reviews.length - 1
    goToReview(prev)
  }

  const renderReview = ({ item }: { item: Review }) => (
    <View 
      style={{ width: REVIEW_WIDTH }} 
      className="bg-white rounded-3xl p-5 shadow-lg mx-2"
    >
      {/* Header com foto e info */}
      <View className="flex-row items-center mb-4">
        <Image
          source={{ uri: item.avatar }}
          className="w-16 h-16 rounded-full"
          style={{ borderWidth: 3, borderColor: item.color }}
        />
        <View className="ml-4 flex-1">
          <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
          <Text className="text-gray-500 text-sm">{item.age} anos • {item.location}</Text>
          <View className="flex-row mt-1">
            {[...Array(item.stars)].map((_, i) => (
              <Ionicons key={i} name="star" size={14} color="#FFD700" />
            ))}
          </View>
        </View>
        {/* Badge de resultado */}
        <View 
          className="px-3 py-2 rounded-xl"
          style={{ backgroundColor: item.color + '20' }}
        >
          <Text className="font-bold text-lg" style={{ color: item.color }}>
            {item.weightLost}
          </Text>
        </View>
      </View>

      {/* Texto do review */}
      <Text className="text-gray-700 text-base leading-6 italic">
        "{item.text}"
      </Text>

      {/* Verificado */}
      <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
        <Ionicons name="checkmark-circle" size={18} color="#8FBC8F" />
        <Text className="text-sage-600 text-sm ml-2 font-medium">Usuário Premium verificado</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header com gradiente */}
        <View className="bg-amber-500 px-6 pt-6 pb-16 rounded-b-[3rem]">
          <View className="items-center">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="diamond" size={32} color="white" />
              <Text className="text-3xl font-bold text-white">Mimoo Premium</Text>
            </View>
            <Text className="text-amber-100 text-center text-base">
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

          {/* Estatísticas de sucesso */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
              <Text className="text-3xl font-bold text-coral-500">98%</Text>
              <Text className="text-xs text-gray-500 text-center mt-1">Satisfação</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
              <Text className="text-3xl font-bold text-sage-600">50k+</Text>
              <Text className="text-xs text-gray-500 text-center mt-1">Usuários</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
              <Text className="text-3xl font-bold text-amber-500">4.9</Text>
              <View className="flex-row mt-1">
                <Ionicons name="star" size={12} color="#FFD700" />
              </View>
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
              <View className="absolute -top-3 left-1/2 -ml-8 bg-sage-500 px-3 py-1 rounded-full">
                <Text className="text-xs text-white font-bold">ECONOMIA 40%</Text>
              </View>
              <Text className="text-sm text-gray-500 text-center mt-2">Anual</Text>
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
                  <Ionicons name={feature.icon as any} size={24} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{feature.title}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{feature.description}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#8FBC8F" />
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            onPress={handleSubscribe}
            className="bg-amber-500 h-16 rounded-3xl items-center justify-center shadow-lg mb-4 flex-row"
          >
            <Ionicons name="diamond" size={22} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              {selectedPlan === 'yearly' ? 'Começar 7 dias grátis' : 'Assinar agora'}
            </Text>
          </TouchableOpacity>

          {selectedPlan === 'yearly' && (
            <Text className="text-center text-gray-500 text-sm mb-4">
              7 dias grátis, depois R$ 142,80/ano (R$ 11,90/mês)
            </Text>
          )}

          {/* Garantia */}
          <View className="flex-row items-center justify-center gap-2 mb-8 bg-sage-50 py-3 px-4 rounded-2xl">
            <Ionicons name="shield-checkmark" size={20} color="#8FBC8F" />
            <Text className="text-sage-700 text-sm font-medium">
              Cancele quando quiser, sem burocracia
            </Text>
          </View>

          {/* Depoimentos */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Histórias de sucesso</Text>
              <Text className="text-gray-500 text-sm">
                {currentReviewIndex + 1}/{reviews.length}
              </Text>
            </View>

            {/* Carrossel de reviews */}
            <View className="mb-4">
              <FlatList
                ref={flatListRef}
                data={reviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={REVIEW_WIDTH + 16}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 8 }}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / (REVIEW_WIDTH + 16))
                  setCurrentReviewIndex(index)
                }}
                getItemLayout={(data, index) => ({
                  length: REVIEW_WIDTH + 16,
                  offset: (REVIEW_WIDTH + 16) * index,
                  index,
                })}
              />
            </View>

            {/* Controles de navegação */}
            <View className="flex-row items-center justify-center gap-4">
              <TouchableOpacity
                onPress={prevReview}
                className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-md border border-gray-100"
              >
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </TouchableOpacity>

              {/* Indicadores */}
              <View className="flex-row gap-2">
                {reviews.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => goToReview(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentReviewIndex 
                        ? 'w-6 bg-amber-500' 
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={nextReview}
                className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-md border border-gray-100"
              >
                <Ionicons name="chevron-forward" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA Final */}
          <View 
            className="rounded-3xl p-6 mb-8 items-center"
            style={{ backgroundColor: '#FF7F6B' }}
          >
            <MimooImage variant="salad" size="md" />
            <Text className="text-white font-bold text-xl text-center mt-4">
              Junte-se a mais de 50.000 pessoas
            </Text>
            <Text className="text-white/90 text-center mt-2 mb-4">
              que já transformaram sua alimentação com o Mimoo
            </Text>
            <TouchableOpacity
              onPress={handleSubscribe}
              className="bg-white h-14 px-8 rounded-2xl items-center justify-center flex-row"
            >
              <Text className="text-coral-600 font-bold text-lg">Começar agora</Text>
              <Ionicons name="arrow-forward" size={20} color="#FF7F6B" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          {/* Espaço para bottom nav */}
          <View className="h-24" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
