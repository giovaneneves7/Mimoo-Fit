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
import { Ionicons } from '@expo/vector-icons'
import { MimooImage } from '../../components/MimooImage'
import {
  getCurrentUser,
  getWeekProgress,
  User as UserType,
  DailyProgress,
} from '../../lib/supabase'

export default function Analytics() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [userData, weekData] = await Promise.all([
        getCurrentUser(),
        getWeekProgress(),
      ])
      setUser(userData)
      setWeekProgress(weekData)
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
  const latestWeight = user.peso
  const goalWeight = user.peso_meta
  const weightDiff = latestWeight - goalWeight

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
          <View className="flex-row items-center">
            <Ionicons name="stats-chart" size={28} color="#374151" />
            <Text className="text-3xl font-bold text-gray-800 ml-2">Seu Progresso</Text>
          </View>
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
                <Ionicons name="flame" size={24} color="#FF7F6B" />
                <Text className="text-2xl font-bold text-coral-600 mt-2">{avgCalories}</Text>
                <Text className="text-xs text-gray-600 mt-1">média kcal/dia</Text>
              </View>
              <View className="flex-1 bg-sage-50 rounded-2xl p-4 items-center">
                <Ionicons name="checkmark-circle" size={24} color="#8FBC8F" />
                <Text className="text-2xl font-bold text-sage-600 mt-2">{daysOnTrack}/7</Text>
                <Text className="text-xs text-gray-600 mt-1">dias na meta</Text>
              </View>
            </View>
          </View>

          {/* Gráfico de Calorias da Semana */}
          <View className="bg-white rounded-3xl p-6 shadow-lg mb-4">
            <View className="flex-row items-center mb-4">
              <Ionicons name="bar-chart" size={20} color="#374151" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Calorias diárias</Text>
            </View>
            
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
            <View className="flex-row items-center mb-4">
              <Ionicons name="trending-up" size={20} color="#374151" />
              <Text className="text-lg font-bold text-gray-800 ml-2">Evolução de peso</Text>
            </View>
            
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
                <Ionicons name="scale" size={20} color="#6B7280" />
                <Text className="text-sm text-gray-500 mt-1">Peso atual</Text>
                <Text className="text-2xl font-bold text-gray-800">{user.peso}kg</Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-2xl p-4 items-center">
                <Ionicons name="flag" size={20} color="#8FBC8F" />
                <Text className="text-sm text-gray-500 mt-1">Meta</Text>
                <Text className="text-2xl font-bold text-sage-600">{user.peso_meta}kg</Text>
              </View>
            </View>

            <View className={`flex-row items-center justify-center p-4 rounded-2xl ${
              weightDiff < 0 ? 'bg-sage-50' : weightDiff > 0 ? 'bg-coral-50' : 'bg-gray-50'
            }`}>
              <Ionicons 
                name={weightDiff < 0 ? 'trending-down' : weightDiff > 0 ? 'trending-up' : 'remove'} 
                size={24} 
                color={weightDiff < 0 ? '#8FBC8F' : weightDiff > 0 ? '#FF7F6B' : '#6B7280'} 
              />
              <Text className={`text-lg font-bold ml-2 ${
                weightDiff < 0 ? 'text-sage-600' : weightDiff > 0 ? 'text-coral-600' : 'text-gray-600'
              }`}>
                {weightDiff === 0 ? 'Na meta!' : 
                 weightDiff < 0 ? `${Math.abs(weightDiff).toFixed(1)}kg abaixo da meta` :
                 `${weightDiff.toFixed(1)}kg para a meta`}
              </Text>
            </View>
          </View>

          {/* Dica do Mimoo */}
          <View className="bg-sage-50 rounded-3xl p-5 mb-8 flex-row">
            <MimooImage variant="salad" size="sm" />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center mb-1">
                <Ionicons name="bulb" size={16} color="#8FBC8F" />
                <Text className="text-sm font-semibold text-gray-800 ml-1">Dica do Mimoo</Text>
              </View>
              <Text className="text-sm text-gray-700">
                {daysOnTrack >= 5 
                  ? 'Incrível! Você está arrasando esta semana. Continue assim!'
                  : daysOnTrack >= 3
                  ? 'Bom progresso! Foque nos próximos dias para manter a consistência.'
                  : 'Cada dia é uma nova chance! Vamos focar em pequenas melhorias.'}
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
