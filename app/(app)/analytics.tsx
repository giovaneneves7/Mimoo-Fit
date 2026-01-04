import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { MimooImage } from '../../components/MimooImage'
import {
  getCurrentUser,
  getWeekProgress,
  getWeightHistory,
  User as UserType,
  DailyProgress,
  WeightLog,
} from '../../lib/supabase'

export default function Analytics() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([])
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [userData, weekData, weightData] = await Promise.all([
        getCurrentUser(),
        getWeekProgress(),
        getWeightHistory(),
      ])
      setUser(userData)
      setWeekProgress(weekData)
      setWeightHistory(weightData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  if (loading || !user) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <MimooImage variant="salad" size="lg" />
        <Text className="text-gray-500 mt-4">Carregando...</Text>
      </SafeAreaView>
    )
  }

  // Calcular estatísticas da semana
  const totalCalories = weekProgress.reduce((sum, day) => sum + (day.calorias_consumidas || 0), 0)
  const avgCalories = weekProgress.length > 0 ? Math.round(totalCalories / weekProgress.length) : 0
  const daysOnTrack = weekProgress.filter(day => day.meta_cumprida).length

  // Calcular variação de peso
  const latestWeight = weightHistory[0]?.peso || user.peso
  const oldestWeight = weightHistory[weightHistory.length - 1]?.peso || user.peso
  const weightChange = latestWeight - oldestWeight

  // Dias da semana para gráfico
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const today = new Date()
  const weekDaysChart = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - i))
    const dayProgress = weekProgress.find(p => {
      const progressDate = new Date(p.data)
      return progressDate.toDateString() === date.toDateString()
    })
    const caloriesGoal = user.calorias_diarias || 2000
    const percentage = dayProgress ? Math.min((dayProgress.calorias_consumidas / caloriesGoal) * 100, 100) : 0
    
    return {
      day: dayNames[date.getDay()],
      percentage,
      calories: dayProgress?.calorias_consumidas || 0,
      completed: dayProgress?.meta_cumprida || false,
    }
  })

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7F6B']} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-800">📊 Seu Progresso</Text>
          <Text className="text-gray-500 mt-1">Acompanhe sua evolução</Text>
        </View>

        <View className="px-6">
          {/* Resumo da Semana */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Esta semana</Text>
              <MimooImage variant="exercise" size="sm" />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-coral-50 rounded-2xl p-4 items-center">
                <Text className="text-2xl font-bold text-coral-600">{avgCalories}</Text>
                <Text className="text-xs text-gray-600 mt-1">média kcal/dia</Text>
              </View>
              <View className="flex-1 bg-sage-50 rounded-2xl p-4 items-center">
                <Text className="text-2xl font-bold text-sage-600">{daysOnTrack}/7</Text>
                <Text className="text-xs text-gray-600 mt-1">dias na meta</Text>
              </View>
            </View>
          </View>

          {/* Gráfico de Calorias da Semana */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Calorias diárias</Text>
            
            <View className="flex-row items-end justify-between h-40">
              {weekDaysChart.map((day, index) => (
                <View key={index} className="items-center flex-1">
                  <View className="w-full px-1 h-32 justify-end">
                    <View 
                      className={`w-full rounded-t-lg ${
                        day.completed ? 'bg-sage-400' : 'bg-coral-400'
                      }`}
                      style={{ height: `${Math.max(day.percentage, 5)}%` }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 mt-2">{day.day}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-sage-400 rounded-full mr-2" />
                <Text className="text-sm text-gray-600">Na meta</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-coral-400 rounded-full mr-2" />
                <Text className="text-sm text-gray-600">Fora da meta</Text>
              </View>
            </View>
          </View>

          {/* Evolução de Peso */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Evolução de peso</Text>
            
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
                <Text className="text-sm text-gray-500">Peso atual</Text>
                <Text className="text-2xl font-bold text-gray-800">{user.peso}kg</Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
                <Text className="text-sm text-gray-500">Meta</Text>
                <Text className="text-2xl font-bold text-sage-600">{user.peso_meta}kg</Text>
              </View>
            </View>

            <View className={`flex-row items-center justify-center p-4 rounded-2xl ${
              weightChange < 0 ? 'bg-sage-50' : weightChange > 0 ? 'bg-coral-50' : 'bg-gray-50'
            }`}>
              <Text className="text-2xl mr-2">
                {weightChange < 0 ? '📉' : weightChange > 0 ? '📈' : '⚖️'}
              </Text>
              <Text className={`text-lg font-bold ${
                weightChange < 0 ? 'text-sage-600' : weightChange > 0 ? 'text-coral-600' : 'text-gray-600'
              }`}>
                {weightChange === 0 ? 'Mantendo peso' : 
                 weightChange < 0 ? `${Math.abs(weightChange).toFixed(1)}kg perdidos` :
                 `${weightChange.toFixed(1)}kg ganhos`}
              </Text>
            </View>
          </View>

          {/* Dica do Mimoo */}
          <View className="bg-sage-50 rounded-3xl p-5 mb-8 flex-row">
            <MimooImage variant="salad" size="sm" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                💡 Dica do Mimoo
              </Text>
              <Text className="text-sm text-gray-700">
                {daysOnTrack >= 5 
                  ? 'Incrível! Você está arrasando esta semana. Continue assim! 🎉'
                  : daysOnTrack >= 3
                  ? 'Bom progresso! Foque nos próximos dias para manter a consistência. 💪'
                  : 'Cada dia é uma nova chance! Vamos focar em pequenas melhorias. 🌱'}
              </Text>
            </View>
          </View>

          {/* Espaço para bottom nav */}
          <View className="h-24" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

