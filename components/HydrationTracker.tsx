import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, Animated, Easing, Modal } from 'react-native'
import { MimooImage } from './MimooImage'
import { getTodayHydration, addHydration, removeLastHydration, getCurrentUser, HydrationLog } from '../lib/supabase'

interface HydrationTrackerProps {
  compact?: boolean
  onUpdate?: () => void
}

// Mensagens carinhosas do Mimoo baseadas na hidratação (igual ao web)
function getMimooHydrationMessage(current: number, goal: number): string {
  const percentage = (current / goal) * 100

  if (current === 0) {
    const messages = [
      'Vamos começar o dia bem hidratadas! 💧',
      'Uma aguinha agora ia bem, né? 🌊',
      'O Mimoo está com sede... e você? 💦'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (percentage < 25) {
    return 'Bom começo! Continue assim 💪'
  } else if (percentage < 50) {
    return 'Você está indo bem! Já é quase metade 🌟'
  } else if (percentage < 75) {
    return 'Mais da metade! O Mimoo está orgulhoso 💚'
  } else if (percentage < 100) {
    return 'Quase lá! Falta pouquinho! 🎯'
  } else {
    const messages = [
      '🎉 Meta batida! Você é incrível!',
      '💧 Hidratação completa! Parabéns!',
      '🏆 Você arrasou hoje!'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }
}

export function HydrationTracker({ compact = false, onUpdate }: HydrationTrackerProps) {
  const [hydrationData, setHydrationData] = useState<{ total: number; logs: HydrationLog[] }>({ total: 0, logs: [] })
  const [waterGoal, setWaterGoal] = useState(2000)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Animações
  const celebrationScale = useRef(new Animated.Value(0)).current
  const celebrationOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadData()
  }, [])

  // Animação de celebração
  useEffect(() => {
    if (showCelebration) {
      Animated.parallel([
        Animated.spring(celebrationScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(celebrationScale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(celebrationOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => setShowCelebration(false))
      }, 3000)
    }
  }, [showCelebration])

  async function loadData() {
    try {
      const [hydration, user] = await Promise.all([
        getTodayHydration(),
        getCurrentUser()
      ])
      setHydrationData(hydration)
      if (user?.meta_agua_ml) {
        setWaterGoal(user.meta_agua_ml)
      }
    } catch (error) {
      console.error('Erro ao carregar hidratação:', error)
    }
  }

  async function handleAddWater(amount: number = 250) {
    if (adding) return
    setAdding(true)

    try {
      const result = await addHydration(amount, 'agua')
      if (result) {
        const newTotal = hydrationData.total + amount
        setHydrationData(prev => ({
          total: newTotal,
          logs: [result, ...prev.logs]
        }))

        // Celebração quando atinge a meta (igual ao web)
        if (hydrationData.total < waterGoal && newTotal >= waterGoal) {
          setShowCelebration(true)
        }

        onUpdate?.()
      }
    } catch (error) {
      console.error('Erro ao adicionar água:', error)
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveWater() {
    if (removing || hydrationData.logs.length === 0) return
    setRemoving(true)

    try {
      const success = await removeLastHydration()
      if (success && hydrationData.logs.length > 0) {
        const lastLog = hydrationData.logs[0]
        setHydrationData(prev => ({
          total: Math.max(0, prev.total - lastLog.quantidade_ml),
          logs: prev.logs.slice(1)
        }))
        onUpdate?.()
      }
    } catch (error) {
      console.error('Erro ao remover água:', error)
    } finally {
      setRemoving(false)
    }
  }

  const percentage = Math.min((hydrationData.total / waterGoal) * 100, 100)
  const glasses = Math.floor(hydrationData.total / 250)
  const mimooMessage = getMimooHydrationMessage(hydrationData.total, waterGoal)

  // Versão compacta para Dashboard (igual ao web)
  if (compact) {
    return (
      <View className="bg-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-3">
              <Text className="text-2xl">💧</Text>
            </View>
            <View>
              <Text className="text-sm text-gray-500">Hidratação</Text>
              <Text className="text-xl font-bold text-gray-800">
                {(hydrationData.total / 1000).toFixed(1)}L
                <Text className="text-sm text-gray-500 font-normal"> / {(waterGoal / 1000).toFixed(1)}L</Text>
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleRemoveWater}
              disabled={removing || hydrationData.logs.length === 0}
              className={`w-10 h-10 rounded-xl border border-gray-200 items-center justify-center ${
                removing || hydrationData.logs.length === 0 ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-xl text-gray-600">−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAddWater(250)}
              disabled={adding}
              className={`w-10 h-10 rounded-xl bg-blue-500 items-center justify-center ${
                adding ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-xl text-white">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de progresso com gotas */}
        <View className="h-4 bg-blue-100 rounded-full overflow-hidden relative">
          <View
            style={{ width: `${percentage}%` }}
            className={`h-full rounded-full ${
              percentage >= 100 ? 'bg-sage-500' : 'bg-blue-500'
            }`}
          />
          {/* Gotas de água decorativas */}
          <View className="absolute inset-0 flex-row items-center justify-around">
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                className={`w-2 h-2 rounded-full ${
                  (i + 1) * 12.5 <= percentage ? 'bg-white/60' : 'bg-blue-200/40'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Mensagem */}
        <Text className="text-xs text-center text-gray-500 mt-3">
          {glasses} {glasses === 1 ? 'copo' : 'copos'} de 250ml • {mimooMessage}
        </Text>

        {/* Celebração overlay */}
        {showCelebration && (
          <Animated.View 
            className="absolute inset-0 bg-blue-500/90 items-center justify-center"
            style={{
              transform: [{ scale: celebrationScale }],
              opacity: celebrationOpacity,
            }}
          >
            <Text className="text-4xl mb-2">🎉💧</Text>
            <Text className="text-white font-bold text-lg">Meta de água batida!</Text>
            <Text className="text-white/90 text-sm">Você é demais!</Text>
          </Animated.View>
        )}
      </View>
    )
  }

  // Versão completa (igual ao web)
  return (
    <View className="bg-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-6">
        <View>
          <View className="flex-row items-center mb-1">
            <Text className="text-xl mr-2">💧</Text>
            <Text className="font-bold text-lg text-gray-800">Hidratação</Text>
          </View>
          <Text className="text-sm text-gray-500">Acompanhe sua água do dia</Text>
        </View>
        <MimooImage variant="salad" size="sm" animation="bounce" />
      </View>

      {/* Círculo de progresso */}
      <View className="items-center mb-6">
        <View className="w-48 h-48 items-center justify-center">
          {/* Background circle */}
          <View className="absolute w-40 h-40 rounded-full border-[16px] border-blue-100" />
          {/* Progress indicator */}
          <View 
            className="absolute w-40 h-40 rounded-full border-[16px]"
            style={{
              borderColor: percentage >= 100 ? '#22c55e' : '#3b82f6',
              borderTopColor: percentage >= 25 ? (percentage >= 100 ? '#22c55e' : '#3b82f6') : '#dbeafe',
              borderRightColor: percentage >= 50 ? (percentage >= 100 ? '#22c55e' : '#3b82f6') : '#dbeafe',
              borderBottomColor: percentage >= 75 ? (percentage >= 100 ? '#22c55e' : '#3b82f6') : '#dbeafe',
              borderLeftColor: percentage >= 100 ? '#22c55e' : '#dbeafe',
              transform: [{ rotate: '-45deg' }],
            }}
          />
          <View className="items-center">
            <Text className="text-4xl mb-1">💧</Text>
            <Text className="text-3xl font-bold text-blue-600">
              {(hydrationData.total / 1000).toFixed(1)}L
            </Text>
            <Text className="text-sm text-gray-600">de {(waterGoal / 1000).toFixed(1)}L</Text>
          </View>
        </View>
      </View>

      {/* Mensagem do Mimoo */}
      <View className="bg-blue-50 rounded-2xl p-4 mb-6 flex-row items-center justify-center">
        <Text className="mr-2">✨</Text>
        <Text className="text-sm font-medium text-blue-700">{mimooMessage}</Text>
      </View>

      {/* Botões de quantidade */}
      <View className="flex-row gap-2 mb-4">
        {[150, 250, 350, 500].map((amount) => (
          <TouchableOpacity
            key={amount}
            onPress={() => handleAddWater(amount)}
            disabled={adding}
            className={`flex-1 h-14 rounded-2xl border-2 border-blue-200 items-center justify-center ${
              adding ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-lg">💧</Text>
            <Text className="text-xs font-medium text-gray-700">{amount}ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botões principais */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={handleRemoveWater}
          disabled={removing || hydrationData.logs.length === 0}
          className={`flex-1 h-12 rounded-2xl border-2 border-gray-200 items-center justify-center flex-row ${
            removing || hydrationData.logs.length === 0 ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-lg mr-2">−</Text>
          <Text className="font-semibold text-gray-700">Desfazer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAddWater(250)}
          disabled={adding}
          className={`flex-1 h-12 rounded-2xl bg-blue-500 items-center justify-center flex-row ${
            adding ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-lg text-white mr-2">+</Text>
          <Text className="font-semibold text-white">1 Copo</Text>
        </TouchableOpacity>
      </View>

      {/* Histórico */}
      {hydrationData.logs.length > 0 && (
        <View className="mt-6 pt-4 border-t border-gray-100">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            Hoje: {glasses} {glasses === 1 ? 'copo' : 'copos'}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {hydrationData.logs.slice(0, 12).map((log, index) => (
              <View
                key={log.id || index}
                className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center"
              >
                <Text>💧</Text>
              </View>
            ))}
            {hydrationData.logs.length > 12 && (
              <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center">
                <Text className="text-xs text-gray-500">+{hydrationData.logs.length - 12}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Celebração overlay */}
      {showCelebration && (
        <Animated.View 
          className="absolute inset-0 bg-blue-500/95 items-center justify-center z-10"
          style={{
            transform: [{ scale: celebrationScale }],
            opacity: celebrationOpacity,
          }}
        >
          <Text className="text-6xl mb-4">🎉💧🎉</Text>
          <Text className="text-white font-bold text-2xl mb-2">Meta de água batida!</Text>
          <Text className="text-white/90 text-lg">O Mimoo está orgulhoso de você!</Text>
          <View className="mt-4">
            <MimooImage variant="salad" size="md" />
          </View>
        </Animated.View>
      )}
    </View>
  )
}
