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
import { useAuth } from '../../contexts/AuthContext'
import { getTodayMeals, getTodayHydration, Meal, addHydration } from '../../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const { profile } = useAuth()
  const [meals, setMeals] = useState<Meal[]>([])
  const [hydration, setHydration] = useState({ total: 0, logs: [] })
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    const [mealsData, hydrationData] = await Promise.all([
      getTodayMeals(),
      getTodayHydration(),
    ])
    setMeals(mealsData)
    setHydration(hydrationData)
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

  const handleAddWater = async () => {
    await addHydration(250)
    loadData()
  }

  // Cálculos
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calorias, 0)
  const targetCalories = profile?.calorias_diarias || 2000
  const caloriesProgress = Math.min((totalCalories / targetCalories) * 100, 100)
  const waterGoal = profile?.meta_agua_ml || 2000
  const waterProgress = Math.min((hydration.total / waterGoal) * 100, 100)

  // Saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-6 pb-32">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-gray-500">{getGreeting()} 👋</Text>
              <Text className="font-heading text-2xl font-bold text-gray-800">
                {profile?.nome || 'Amiga'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(app)/profile')}
              className="w-12 h-12 bg-coral-100 rounded-full items-center justify-center"
            >
              {profile?.foto_url ? (
                <Image
                  source={{ uri: profile.foto_url }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Text className="text-2xl">🐰</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Mimoo Card */}
          <View className="bg-gradient-to-r from-coral-400 to-coral-500 rounded-3xl p-6 mb-6">
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mr-4">
                <Text className="text-4xl">🐰</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white/80 text-sm">Dica do Mimoo</Text>
                <Text className="text-white font-semibold text-lg">
                  {totalCalories < targetCalories * 0.5
                    ? 'Não esquece de comer, viu? 💚'
                    : totalCalories < targetCalories
                    ? 'Está indo bem! Continue assim!'
                    : 'Meta batida! Parabéns! 🎉'}
                </Text>
              </View>
            </View>
          </View>

          {/* Calories Progress */}
          <View className="bg-white rounded-3xl p-6 mb-4 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-semibold text-gray-800">Calorias hoje</Text>
              <Text className="text-gray-500">
                {totalCalories} / {targetCalories} kcal
              </Text>
            </View>

            {/* Progress bar */}
            <View className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <View
                style={{ width: `${caloriesProgress}%` }}
                className={`h-full rounded-full ${
                  caloriesProgress >= 100 ? 'bg-sage-500' : 'bg-coral-500'
                }`}
              />
            </View>

            {/* Macros */}
            <View className="flex-row justify-between mt-4">
              <View className="items-center">
                <Text className="text-xl">🍞</Text>
                <Text className="font-bold text-gray-800">
                  {meals.reduce((sum, m) => sum + m.carboidratos, 0)}g
                </Text>
                <Text className="text-gray-500 text-xs">Carbs</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl">🥩</Text>
                <Text className="font-bold text-gray-800">
                  {meals.reduce((sum, m) => sum + m.proteinas, 0)}g
                </Text>
                <Text className="text-gray-500 text-xs">Proteínas</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl">🥑</Text>
                <Text className="font-bold text-gray-800">
                  {meals.reduce((sum, m) => sum + m.gorduras, 0)}g
                </Text>
                <Text className="text-gray-500 text-xs">Gorduras</Text>
              </View>
            </View>
          </View>

          {/* Hydration */}
          <View className="bg-blue-50 rounded-3xl p-6 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">💧</Text>
                <Text className="font-semibold text-gray-800">Hidratação</Text>
              </View>
              <Text className="text-gray-500">
                {hydration.total}ml / {waterGoal}ml
              </Text>
            </View>

            {/* Progress */}
            <View className="h-4 bg-blue-100 rounded-full overflow-hidden mb-4">
              <View
                style={{ width: `${waterProgress}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </View>

            {/* Quick add buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleAddWater}
                className="flex-1 bg-blue-500 py-3 rounded-2xl items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">+ 250ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await addHydration(500)
                  loadData()
                }}
                className="flex-1 bg-blue-400 py-3 rounded-2xl items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">+ 500ml</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's meals */}
          <View className="mb-4">
            <Text className="font-semibold text-gray-800 mb-4">
              Refeições de hoje
            </Text>

            {meals.length === 0 ? (
              <TouchableOpacity
                onPress={() => router.push('/(app)/scanner')}
                className="bg-white rounded-3xl p-8 items-center shadow-lg"
                activeOpacity={0.8}
              >
                <View className="w-20 h-20 bg-coral-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-4xl">📷</Text>
                </View>
                <Text className="font-semibold text-gray-800 mb-1">
                  Nenhuma refeição ainda
                </Text>
                <Text className="text-gray-500 text-center">
                  Tire uma foto do seu prato para começar!
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="space-y-3">
                {meals.map((meal) => (
                  <View
                    key={meal.id}
                    className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm"
                  >
                    <View className="w-14 h-14 bg-coral-100 rounded-xl items-center justify-center mr-4">
                      {meal.foto_url ? (
                        <Image
                          source={{ uri: meal.foto_url }}
                          className="w-14 h-14 rounded-xl"
                        />
                      ) : (
                        <Text className="text-2xl">🍽️</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800">
                        {meal.nome}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {meal.horario.substring(0, 5)}
                      </Text>
                    </View>
                    <Text className="font-bold text-coral-500">
                      {meal.calorias} kcal
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

