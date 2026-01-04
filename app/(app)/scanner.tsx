import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { analyzeMealPhoto, MealAnalysis } from '../../lib/openai'
import { addMeal } from '../../lib/supabase'

type Step = 'camera' | 'preview' | 'analyzing' | 'result' | 'not_food'

export default function Scanner() {
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const [step, setStep] = useState<Step>('camera')
  const [photo, setPhoto] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null)
  const [saving, setSaving] = useState(false)

  // Pede permissão da câmera
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
  }, [])

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      })

      if (photo?.base64) {
        setPhoto(photo.uri)
        setStep('preview')
        analyzePhoto(photo.base64)
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error)
      Alert.alert('Erro', 'Não foi possível tirar a foto')
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    })

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(result.assets[0].uri)
      setStep('preview')
      analyzePhoto(result.assets[0].base64)
    }
  }

  const analyzePhoto = async (base64: string) => {
    setStep('analyzing')

    const result = await analyzeMealPhoto(base64)
    setAnalysis(result)

    if (!result.success || result.error === 'not_food') {
      setStep('not_food')
    } else {
      setStep('result')
    }
  }

  const handleSave = async () => {
    if (!analysis || !analysis.success) return

    setSaving(true)

    try {
      const now = new Date()
      const meal = await addMeal({
        nome: analysis.nome,
        tipo_refeicao: getMealType(),
        foto_url: photo || undefined,
        calorias: analysis.calorias,
        carboidratos: analysis.carboidratos,
        proteinas: analysis.proteinas,
        gorduras: analysis.gorduras,
        horario: now.toTimeString().substring(0, 8),
        data: now.toISOString().split('T')[0],
        confianca_ia: analysis.confianca,
        observacoes: analysis.observacoes,
      })

      if (meal) {
        Alert.alert('Sucesso! 🎉', 'Refeição registrada!', [
          { text: 'OK', onPress: () => router.push('/(app)/dashboard') },
        ])
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a refeição')
    } finally {
      setSaving(false)
    }
  }

  const getMealType = () => {
    const hour = new Date().getHours()
    if (hour < 10) return 'cafe'
    if (hour < 12) return 'lanche_manha'
    if (hour < 14) return 'almoco'
    if (hour < 17) return 'lanche_tarde'
    if (hour < 20) return 'jantar'
    return 'ceia'
  }

  const reset = () => {
    setPhoto(null)
    setAnalysis(null)
    setStep('camera')
  }

  // Tela de permissão
  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <View className="w-24 h-24 bg-coral-100 rounded-full items-center justify-center mb-6">
          <Text className="text-5xl">📸</Text>
        </View>
        <Text className="font-heading text-2xl font-bold text-gray-800 text-center mb-2">
          Permissão da câmera
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          O Mimoo precisa da câmera para analisar suas refeições
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-coral-500 px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold">Permitir câmera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // Tela de análise
  if (step === 'analyzing') {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <View className="w-32 h-32 bg-coral-500 rounded-full items-center justify-center mb-8 animate-pulse">
          <Text className="text-6xl">🐰</Text>
        </View>
        <Text className="font-heading text-2xl font-bold text-gray-800 text-center mb-2">
          Analisando...
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          O Mimoo está farejando sua refeição 👃
        </Text>
        <ActivityIndicator size="large" color="#FF7F6B" />
      </SafeAreaView>
    )
  }

  // Tela de "não é comida"
  if (step === 'not_food') {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <View className="w-32 h-32 bg-amber-100 rounded-full items-center justify-center mb-8">
          <Text className="text-6xl">🤔</Text>
        </View>
        <Text className="font-heading text-2xl font-bold text-gray-800 text-center mb-2">
          Hm, isso é comida?
        </Text>
        <Text className="text-gray-500 text-center mb-8 px-8">
          O Mimoo não conseguiu identificar alimentos nessa foto. Tente tirar
          outra foto do seu prato!
        </Text>
        <TouchableOpacity
          onPress={reset}
          className="bg-coral-500 px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold">Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // Tela de resultado
  if (step === 'result' && analysis) {
    const isHighCalorie = analysis.calorias > 800

    return (
      <SafeAreaView className="flex-1 bg-cream">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-6 pb-32">
            {/* Photo preview */}
            {photo && (
              <View className="rounded-3xl overflow-hidden mb-6 shadow-lg">
                <Image source={{ uri: photo }} className="w-full h-48" />
              </View>
            )}

            {/* Analysis result */}
            <View className="bg-white rounded-3xl p-6 mb-4 shadow-lg">
              <Text className="font-heading text-2xl font-bold text-gray-800 mb-2">
                {analysis.nome}
              </Text>

              {/* Calories */}
              <View
                className={`rounded-2xl p-4 mb-4 ${
                  isHighCalorie ? 'bg-amber-50' : 'bg-sage-50'
                }`}
              >
                <Text
                  className={`text-4xl font-bold ${
                    isHighCalorie ? 'text-amber-600' : 'text-sage-600'
                  }`}
                >
                  {analysis.calorias} kcal
                </Text>
                {isHighCalorie && (
                  <Text className="text-amber-600 text-sm mt-1">
                    💡 Refeição calórica - que tal equilibrar no jantar?
                  </Text>
                )}
              </View>

              {/* Macros */}
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-2xl mb-1">🍞</Text>
                  <Text className="font-bold text-gray-800">
                    {analysis.carboidratos}g
                  </Text>
                  <Text className="text-gray-500 text-xs">Carboidratos</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl mb-1">🥩</Text>
                  <Text className="font-bold text-gray-800">
                    {analysis.proteinas}g
                  </Text>
                  <Text className="text-gray-500 text-xs">Proteínas</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl mb-1">🥑</Text>
                  <Text className="font-bold text-gray-800">
                    {analysis.gorduras}g
                  </Text>
                  <Text className="text-gray-500 text-xs">Gorduras</Text>
                </View>
              </View>
            </View>

            {/* Mimoo tip */}
            {analysis.observacoes && (
              <View className="bg-sage-50 rounded-3xl p-6 mb-4">
                <View className="flex-row items-start">
                  <View className="w-12 h-12 bg-coral-500 rounded-full items-center justify-center mr-4">
                    <Text className="text-2xl">🐰</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800 mb-1">
                      Dica do Mimoo:
                    </Text>
                    <Text className="text-gray-600">{analysis.observacoes}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Confidence */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-4">
              <Text className="text-gray-500 text-center text-sm">
                Confiança da análise:{' '}
                <Text className="font-bold">
                  {Math.round(analysis.confianca * 100)}%
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View className="absolute bottom-8 left-6 right-6 flex-row gap-4">
          <TouchableOpacity
            onPress={reset}
            className="flex-1 bg-gray-200 py-4 rounded-2xl items-center"
          >
            <Text className="font-bold text-gray-700">Refazer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`flex-1 py-4 rounded-2xl items-center ${
              saving ? 'bg-sage-300' : 'bg-sage-500'
            }`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-bold text-white">Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Tela de câmera
  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
      >
        <SafeAreaView className="flex-1">
          {/* Top bar */}
          <View className="flex-row items-center justify-between px-6 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            >
              <Text className="text-white text-xl">✕</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            >
              <Text className="text-white text-xl">🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Guide overlay */}
          <View className="flex-1 items-center justify-center">
            <View className="w-72 h-72 border-4 border-white/50 rounded-3xl" />
            <Text className="text-white mt-4 text-center">
              Posicione o prato dentro do quadro
            </Text>
          </View>

          {/* Bottom controls */}
          <View className="pb-12 px-6">
            <View className="flex-row items-center justify-center gap-8">
              <TouchableOpacity
                onPress={pickImage}
                className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
              >
                <Text className="text-2xl">🖼️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePicture}
                className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-coral-500"
                activeOpacity={0.8}
              >
                <View className="w-16 h-16 bg-coral-500 rounded-full" />
              </TouchableOpacity>

              <View className="w-14 h-14" />
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}

