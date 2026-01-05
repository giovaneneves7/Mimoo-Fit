import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { MimooImage } from '../../components/MimooImage'
import { HydrationTracker } from '../../components/HydrationTracker'
import { Celebration } from '../../components/Confetti'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  getCurrentUser,
  getTodayProgress,
  getTodayMeals,
  getWeekProgress,
  User as UserType,
  DailyProgress,
  Meal
} from '../../lib/supabase'
import { getGreeting as getGreetingUtil, getWeekDays, getTodayDateString } from '../../lib/date-utils'

// Função para obter saudação com ícone
function getGreeting(): { greeting: string; icon: keyof typeof Ionicons.glyphMap } {
  const { greeting, period } = getGreetingUtil()
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    morning: 'sunny',
    afternoon: 'partly-sunny',
    evening: 'moon',
  }
  return { greeting, icon: iconMap[period] }
}

// Mensagens carinhosas do Mimoo baseadas no contexto
function getMimooMessage(
  caloriesConsumed: number,
  caloriesGoal: number,
  mealsCount: number,
  userName: string
): string {
  const percentage = (caloriesConsumed / caloriesGoal) * 100
  const firstName = userName.split(' ')[0]

  if (mealsCount === 0) {
    const messages = [
      `O Mimoo sentiu sua falta! Que tal registrar sua primeira refeição?`,
      `Ei ${firstName}, estou aqui te esperando! Vamos começar o dia juntas?`,
      `${firstName}, o Mimoo está pronto pra te ajudar hoje!`,
      `Bora registrar algo gostoso? O Mimoo tá curioso!`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (percentage < 30) {
    const messages = [
      `Você está começando bem, ${firstName}! Continue assim`,
      `O Mimoo está torcendo por você! Cada passo conta`,
      `Que bom te ver por aqui! Estamos juntas nessa`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  } else if (percentage < 60) {
    const messages = [
      `Olha só, ${firstName}! Você está no caminho certo`,
      `Continue assim! O Mimoo está orgulhoso de você`,
      `Metade do dia e você está arrasando!`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  } else if (percentage < 85) {
    const messages = [
      `Quase lá, ${firstName}! Você está incrível hoje`,
      `Wow! Que progresso! O Mimoo está feliz`,
      `Você está quase atingindo sua meta! Continue assim`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  } else if (percentage < 100) {
    const messages = [
      `Uau ${firstName}! Falta pouquinho pra bater a meta!`,
      `Você está quase lá! O Mimoo acredita em você`,
      `Incrível! Só mais um pouquinho e você chega lá!`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  } else {
    const messages = [
      `Meta batida, ${firstName}! Você é demais!`,
      `Parabéns! Você conseguiu! O Mimoo está celebrando`,
      `Missão cumprida! Você arrasou hoje, ${firstName}!`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }
}

// Mapa de ícones por tipo de refeição
const mealIconMap: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  cafe: { icon: 'cafe', color: '#8B4513' },
  lanche_manha: { icon: 'nutrition', color: '#FF6B6B' },
  almoco: { icon: 'restaurant', color: '#FF7F6B' },
  lanche_tarde: { icon: 'fast-food', color: '#FFB347' },
  jantar: { icon: 'pizza', color: '#8FBC8F' },
  ceia: { icon: 'moon', color: '#6B7280' }
}

export default function Dashboard() {
  const router = useRouter()
  const { profile } = useAuth()
  const [user, setUser] = useState<UserType | null>(null)
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationShown, setCelebrationShown] = useState(false)

  const greeting = getGreeting()

  const loadData = async () => {
    try {
      const [userData, progressData, mealsData, weekData] = await Promise.all([
        getCurrentUser(),
        getTodayProgress(),
        getTodayMeals(),
        getWeekProgress()
      ])

      setUser(userData)
      setTodayProgress(progressData)
      setMeals(mealsData)
      setWeekProgress(weekData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkCelebration = async () => {
      if (!loading && user && todayProgress && !celebrationShown) {
        const caloriesGoal = user.calorias_diarias || 2000
        const caloriesConsumed = todayProgress.calorias_consumidas || 0
        const percentage = (caloriesConsumed / caloriesGoal) * 100

        if (percentage >= 95 && percentage <= 105) {
          const todayStr = getTodayDateString()
          const celebrationKey = `mimoo_celebration_${todayStr}`
          const alreadyShown = await AsyncStorage.getItem(celebrationKey)
          
          if (!alreadyShown) {
            setShowCelebration(true)
            setCelebrationShown(true)
            await AsyncStorage.setItem(celebrationKey, 'true')
          }
        }
      }
    }
    checkCelebration()
  }, [loading, user, todayProgress, celebrationShown])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  // Verifica a cada 60 segundos se o dia mudou e atualiza automaticamente
  useEffect(() => {
    let currentDay = getTodayDateString()
    
    const checkDayChange = setInterval(() => {
      const newDay = getTodayDateString()
      if (newDay !== currentDay) {
        console.log(`🌅 Novo dia detectado! ${currentDay} → ${newDay}`)
        currentDay = newDay
        setCelebrationShown(false) // Reset para poder mostrar celebração do novo dia
        loadData()
      }
    }, 60000) // Verifica a cada 1 minuto

    return () => clearInterval(checkDayChange)
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  if (loading || !user) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <MimooImage variant="camera" size="lg" animation="bounce" />
        <Text className="text-gray-500 mt-4">Carregando...</Text>
      </SafeAreaView>
    )
  }

  const caloriesGoal = user.calorias_diarias || 2000
  const caloriesConsumed = todayProgress?.calorias_consumidas || 0
  const caloriesRemaining = Math.max(caloriesGoal - caloriesConsumed, 0)
  const percentage = Math.min((caloriesConsumed / caloriesGoal) * 100, 100)

  const macrosGoals = {
    carbs: Math.round((caloriesGoal * 0.5) / 4),
    protein: Math.round((caloriesGoal * 0.25) / 4),
    fat: Math.round((caloriesGoal * 0.25) / 9)
  }

  const macros = {
    carbs: todayProgress?.carboidratos_consumidos || 0,
    protein: todayProgress?.proteinas_consumidas || 0,
    fat: todayProgress?.gorduras_consumidas || 0
  }

  // Usa funções centralizadas de data (horário de Brasília)
  const weekDaysData = getWeekDays()
  const weekDays = weekDaysData.map(day => {
    const dayProgress = weekProgress.find(p => p.data === day.dateString)
    
    // Abreviações curtas dos dias
    const shortDayNames: Record<string, string> = {
      'Dom': 'D', 'Seg': 'S', 'Ter': 'T', 'Qua': 'Q', 'Qui': 'Q', 'Sex': 'S', 'Sáb': 'S'
    }

    return {
      day: shortDayNames[day.dayName] || day.dayName[0],
      date: day.dayNumber,
      active: day.isToday,
      completed: dayProgress?.meta_cumprida || false
    }
  })

  const tipoRefeicaoMap: Record<string, string> = {
    cafe: 'Café da manhã',
    lanche_manha: 'Lanche da manhã',
    almoco: 'Almoço',
    lanche_tarde: 'Lanche da tarde',
    jantar: 'Jantar',
    ceia: 'Ceia'
  }

  const mimooMessage = getMimooMessage(caloriesConsumed, caloriesGoal, meals.length, user.nome)

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <Celebration
        active={showCelebration}
        message="Meta atingida!"
        subMessage={`Parabéns ${user.nome.split(' ')[0]}! Você arrasou hoje!`}
        onClose={() => setShowCelebration(false)}
        duration={5000}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7F6B']} />
        }
      >
        {/* Header Coral */}
        <View className="bg-coral-500 px-6 pt-6 pb-8 rounded-b-[3rem]">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <View className="flex-row items-center mb-1">
                <Text className="text-coral-100 text-sm mr-2">{greeting.greeting}</Text>
                <Ionicons name={greeting.icon} size={16} color="#fed7d7" />
              </View>
              <Text className="text-white text-3xl font-bold">{user.nome.split(' ')[0]}!</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(app)/profile')}
              className="w-12 h-12 rounded-full bg-white/20 overflow-hidden border-2 border-white/30 items-center justify-center"
            >
              {user.foto_url ? (
                <Image source={{ uri: user.foto_url }} className="w-full h-full" />
              ) : (
                <Ionicons name="person" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Mensagem do Mimoo */}
          <View className="bg-white/20 rounded-2xl p-4 mb-6 flex-row items-center">
            <MimooImage variant="camera" size="sm" animation="bounce" />
            <Text className="text-white text-sm font-medium ml-3 flex-1">
              {mimooMessage}
            </Text>
          </View>

          {/* Calendário da semana */}
          <View className="flex-row justify-between gap-2">
            {weekDays.map((day, index) => (
              <View
                key={index}
                className={`flex-1 items-center py-3 rounded-2xl ${
                  day.active ? 'bg-white' : 'bg-white/20'
                }`}
              >
                <Text className={`text-xs font-medium ${day.active ? 'text-coral-600' : 'text-white'}`}>
                  {day.day}
                </Text>
                <Text className={`text-lg font-bold ${day.active ? 'text-coral-600' : 'text-white'}`}>
                  {day.date}
                </Text>
                {day.completed && (
                  <Ionicons name="checkmark-circle" size={14} color="#8FBC8F" style={{ marginTop: 2 }} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View className="px-6 -mt-6">
          {/* Card de Calorias */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <View className="flex-row items-start justify-between mb-6">
              <View>
                <Text className="text-sm text-gray-500 mb-1">Calorias de hoje</Text>
                <Text className="text-3xl font-bold text-gray-800">
                  {caloriesConsumed}
                  <Text className="text-lg text-gray-500 font-normal"> / {caloriesGoal}</Text>
                </Text>
              </View>
              <MimooImage variant="salad" size="sm" animation="float" />
            </View>

            {/* Círculo de progresso */}
            <View className="items-center mb-6">
              <View className="w-48 h-48 items-center justify-center">
                <View className="absolute w-40 h-40 rounded-full border-[16px] border-gray-100" />
                <View 
                  className="absolute w-40 h-40 rounded-full border-[16px]"
                  style={{
                    borderTopColor: percentage >= 25 ? '#FF7F6B' : '#f5f2ed',
                    borderRightColor: percentage >= 50 ? '#FF7F6B' : '#f5f2ed',
                    borderBottomColor: percentage >= 75 ? '#FF7F6B' : '#f5f2ed',
                    borderLeftColor: percentage >= 100 ? '#FF7F6B' : '#f5f2ed',
                    transform: [{ rotate: '-45deg' }],
                  }}
                />
                <View className="items-center">
                  <Text className="text-4xl font-bold text-coral-600">{caloriesRemaining}</Text>
                  <Text className="text-sm text-gray-600">restantes</Text>
                </View>
              </View>
            </View>

            <View className="bg-sage-50 py-3 px-4 rounded-2xl flex-row items-center justify-center">
              <Ionicons name="sparkles" size={16} color="#8FBC8F" style={{ marginRight: 8 }} />
              <Text className="text-sage-600 text-sm font-medium">
                {percentage < 80 ? 'Você está indo muito bem!' : percentage < 100 ? 'Quase lá!' : 'Meta atingida!'}
              </Text>
            </View>
          </View>

          {/* Macronutrientes */}
          <Text className="text-xl font-bold text-gray-800 mb-4">Macronutrientes</Text>
          
          <View className="gap-3 mb-6">
            {/* Carboidratos */}
            <View className="bg-white rounded-2xl p-4 shadow-md">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-coral-100 rounded-lg items-center justify-center mr-2">
                    <Ionicons name="cube" size={18} color="#FF7F6B" />
                  </View>
                  <Text className="text-sm font-semibold text-gray-700">Carboidratos</Text>
                </View>
                <Text className="text-sm font-bold text-coral-600">
                  {macros.carbs.toFixed(0)}g / {macrosGoals.carbs}g
                </Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  style={{ width: `${Math.min((macros.carbs / macrosGoals.carbs) * 100, 100)}%` }}
                  className="h-full bg-coral-500 rounded-full"
                />
              </View>
            </View>

            {/* Proteínas */}
            <View className="bg-white rounded-2xl p-4 shadow-md">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-sage-100 rounded-lg items-center justify-center mr-2">
                    <Ionicons name="barbell" size={18} color="#8FBC8F" />
                  </View>
                  <Text className="text-sm font-semibold text-gray-700">Proteínas</Text>
                </View>
                <Text className="text-sm font-bold text-sage-600">
                  {macros.protein.toFixed(0)}g / {macrosGoals.protein}g
                </Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  style={{ width: `${Math.min((macros.protein / macrosGoals.protein) * 100, 100)}%` }}
                  className="h-full bg-sage-500 rounded-full"
                />
              </View>
            </View>

            {/* Gorduras */}
            <View className="bg-white rounded-2xl p-4 shadow-md">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-amber-100 rounded-lg items-center justify-center mr-2">
                    <Ionicons name="water" size={18} color="#F59E0B" />
                  </View>
                  <Text className="text-sm font-semibold text-gray-700">Gorduras</Text>
                </View>
                <Text className="text-sm font-bold text-amber-600">
                  {macros.fat.toFixed(0)}g / {macrosGoals.fat}g
                </Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  style={{ width: `${Math.min((macros.fat / macrosGoals.fat) * 100, 100)}%` }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </View>
            </View>
          </View>

          {/* Hidratação */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Água do dia</Text>
          </View>
          <HydrationTracker compact onUpdate={loadData} />

          {/* Refeições */}
          <Text className="text-xl font-bold text-gray-800 mt-6 mb-4">Refeições de hoje</Text>
          
          {meals.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/(app)/scanner')}
              className="bg-white rounded-2xl p-8 items-center shadow-md mb-8"
              activeOpacity={0.8}
            >
              <MimooImage variant="camera" size="md" animation="bounce" />
              <Text className="font-semibold text-gray-800 mt-4">Nenhuma refeição registrada ainda</Text>
              <Text className="text-gray-500 text-center mt-1">Tire uma foto do seu prato para começar!</Text>
              <View className="bg-coral-500 mt-4 px-6 py-3 rounded-2xl flex-row items-center">
                <Ionicons name="camera" size={18} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-semibold">Registrar primeira refeição</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="gap-3 mb-8">
              {meals.map((meal) => {
                const mealIcon = mealIconMap[meal.tipo_refeicao] || { icon: 'restaurant', color: '#FF7F6B' }
                return (
                  <View key={meal.id} className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm">
                    <View 
                      className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: mealIcon.color + '20' }}
                    >
                      <Ionicons name={mealIcon.icon} size={28} color={mealIcon.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800">
                        {tipoRefeicaoMap[meal.tipo_refeicao] || meal.nome}
                      </Text>
                      <Text className="text-sm text-gray-500">{meal.horario.substring(0, 5)}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-coral-600">{meal.calorias}</Text>
                      <Text className="text-xs text-gray-500">kcal</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          <View className="h-24" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
