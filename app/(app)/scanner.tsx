import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { MimooImage } from '../../components/MimooImage'
import { analyzeMealPhoto, MealAnalysis } from '../../lib/openai'
import { addMeal } from '../../lib/supabase'

type Step = 'camera' | 'analyzing' | 'result' | 'not_food'

// Feedback gentil do Mimoo baseado nas calorias
function getMimooFeedback(
  calories: number,
  macros: { carbs: number; protein: number; fat: number }
): string {
  if (calories > 1000) {
    return `Uau, essa refeição parece deliciosa e bem servida! Se quiser equilibrar, que tal um jantar mais leve? Mas não se preocupe, um dia mais generoso faz parte!`
  }
  if (calories > 700) {
    return `Parece delicioso! Essa refeição está bem completa. Apenas lembre de manter os lanchinhos mais leves.`
  }
  if (macros.protein > 25) {
    return `Ótima escolha! Seu prato está bem equilibrado com proteínas. Continue assim!`
  }
  if (calories < 300) {
    return `Refeição leve registrada! Lembre-se de comer o suficiente para ter energia.`
  }
  return `Refeição registrada! Continue acompanhando sua alimentação.`
}

// Frases do Mimoo enquanto fareja
const sniffPhrases = [
  "Hmm, que cheiro bom!",
  "Deixa eu farejar isso...",
  "Analisando cada ingrediente!",
  "Parece delicioso daqui!",
]

export default function Scanner() {
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const [step, setStep] = useState<Step>('camera')
  const [photo, setPhoto] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null)
  const [saving, setSaving] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState(0)

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission()
    }
  }, [])

  // Alterna frases durante análise
  useEffect(() => {
    if (step === 'analyzing') {
      const interval = setInterval(() => {
        setCurrentPhrase((prev) => (prev + 1) % sniffPhrases.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [step])

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      })

      if (photo?.base64) {
        setPhoto(photo.uri)
        setStep('analyzing')
        analyzePhoto(photo.base64)
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error)
      Alert.alert('Erro', 'Não foi possível tirar a foto')
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    })

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(result.assets[0].uri)
      setStep('analyzing')
      analyzePhoto(result.assets[0].base64)
    }
  }

  const analyzePhoto = async (base64: string) => {
    console.log('Enviando foto para análise...')
    const result = await analyzeMealPhoto(base64)
    console.log('Resultado da análise:', result)
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
    console.log('Salvando refeição...')

    try {
      const now = new Date()
      const horario = now.toTimeString().substring(0, 8)
      const data = now.toISOString().split('T')[0]

      const hour = now.getHours()
      let tipo_refeicao: 'cafe' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia'

      if (hour < 10) tipo_refeicao = 'cafe'
      else if (hour < 12) tipo_refeicao = 'lanche_manha'
      else if (hour < 15) tipo_refeicao = 'almoco'
      else if (hour < 18) tipo_refeicao = 'lanche_tarde'
      else if (hour < 21) tipo_refeicao = 'jantar'
      else tipo_refeicao = 'ceia'

      const saved = await addMeal({
        nome: analysis.nome,
        tipo_refeicao,
        calorias: analysis.calorias,
        carboidratos: analysis.carboidratos,
        proteinas: analysis.proteinas,
        gorduras: analysis.gorduras,
        horario,
        data,
        confianca_ia: Math.round(analysis.confianca * 100)
      })

      if (saved) {
        console.log('Refeição salva com sucesso!')
        Alert.alert(
          'Refeição salva!',
          'Sua refeição foi registrada com sucesso.',
          [{ text: 'OK', onPress: () => router.push('/(app)/dashboard') }]
        )
      } else {
        throw new Error('Falha ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar refeição:', error)
      Alert.alert('Erro', 'Não foi possível salvar a refeição. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setPhoto(null)
    setAnalysis(null)
    setStep('camera')
    setCurrentPhrase(0)
  }

  const goBack = () => {
    try {
      router.back()
    } catch {
      router.push('/(app)/dashboard')
    }
  }

  // Tela de permissão
  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-6">
        <MimooImage variant="camera" size="xl" animation="bounce" />
        <Text className="text-2xl font-bold text-gray-800 text-center mt-6 mb-2">
          Permissão da câmera
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          O Mimoo precisa da câmera para analisar suas refeições
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-coral-500 px-8 py-4 rounded-2xl flex-row items-center"
        >
          <Ionicons name="camera" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-bold text-lg">Permitir câmera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // Tela de análise (Mimoo farejando)
  if (step === 'analyzing') {
    return (
      <SafeAreaView className="flex-1 bg-coral-50 items-center justify-center px-6">
        <MimooImage variant="camera" size="xl" animation="sniff" />
        
        <View className="flex-row gap-2 mt-4">
          <Ionicons name="sparkles" size={24} color="#FF7F6B" />
          <Ionicons name="star" size={24} color="#FFD700" />
          <Ionicons name="sparkles" size={24} color="#FF7F6B" />
        </View>

        <Text className="text-3xl font-bold text-gray-800 text-center mt-6 mb-2">
          O Mimoo está farejando...
        </Text>
        <Text className="text-lg text-coral-600 font-medium text-center">
          {sniffPhrases[currentPhrase]}
        </Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          Identificando alimentos e nutrientes com IA
        </Text>

        <ActivityIndicator size="large" color="#FF7F6B" className="mt-8" />

        <View className="flex-row gap-4 mt-8">
          <Ionicons name="leaf" size={28} color="#8FBC8F" />
          <Ionicons name="nutrition" size={28} color="#FF6B6B" />
          <Ionicons name="water" size={28} color="#3B82F6" />
          <Ionicons name="restaurant" size={28} color="#FF7F6B" />
        </View>
      </SafeAreaView>
    )
  }

  // Tela de "não é comida"
  if (step === 'not_food') {
    return (
      <SafeAreaView className="flex-1 bg-coral-50 items-center justify-center px-6">
        <View className="items-center relative">
          <MimooImage variant="camera" size="xl" animation="bounce" />
          <View className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
            <Ionicons name="help-circle" size={24} color="#F59E0B" />
          </View>
        </View>

        <View className="mt-6 items-center relative">
          <View className="w-20 h-20 bg-coral-100 rounded-full items-center justify-center">
            <Ionicons name="restaurant" size={40} color="#FF7F6B" />
          </View>
        </View>

        <Text className="text-2xl font-bold text-gray-800 text-center mt-6 mb-2">
          Hmm, isso não parece comida!
        </Text>
        <Text className="text-gray-600 text-center px-4 mb-4">
          O Mimoo só consegue analisar fotos de refeições e alimentos. Tente tirar uma foto do seu prato!
        </Text>

        <View className="bg-white rounded-3xl p-5 w-full mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="bulb" size={18} color="#F59E0B" />
            <Text className="text-sm font-semibold text-gray-700 ml-2">Dicas para uma boa foto:</Text>
          </View>
          <View className="gap-2">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#8FBC8F" />
              <Text className="text-sm text-gray-600 ml-2">Centralize a comida na foto</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#8FBC8F" />
              <Text className="text-sm text-gray-600 ml-2">Boa iluminação ajuda muito</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#8FBC8F" />
              <Text className="text-sm text-gray-600 ml-2">Foto de cima funciona melhor</Text>
            </View>
          </View>
        </View>

        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={reset}
            className="w-full h-14 bg-coral-500 rounded-3xl items-center justify-center flex-row"
          >
            <Ionicons name="camera" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-lg">Tirar outra foto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              reset()
              setTimeout(pickImage, 100)
            }}
            className="w-full h-14 border-2 border-gray-200 rounded-3xl items-center justify-center flex-row"
          >
            <Ionicons name="images" size={20} color="#374151" style={{ marginRight: 8 }} />
            <Text className="font-bold text-gray-700">Escolher da galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(app)/dashboard')}
            className="w-full h-12 items-center justify-center"
          >
            <Text className="text-gray-500 font-medium">Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Tela de resultado
  if (step === 'result' && analysis) {
    const isHighCalorie = analysis.calorias > 800

    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
          <TouchableOpacity 
            onPress={reset} 
            disabled={saving}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Análise da refeição</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <View className="items-center mb-6">
              <MimooImage variant="salad" size="lg" animation="bounce" />
              <View className="flex-row items-center mt-4">
                <Ionicons name="checkmark-circle" size={24} color="#8FBC8F" />
                <Text className="text-xl font-bold text-gray-800 text-center ml-2">
                  {analysis.calorias > 800 
                    ? 'Refeição caprichada!'
                    : analysis.calorias > 500 
                    ? 'Parece delicioso!'
                    : 'Boa escolha!'}
                </Text>
              </View>
              <Text className="text-gray-600 mt-1">
                Analisei com {analysis.confianca < 1 ? Math.round(analysis.confianca * 100) : Math.round(analysis.confianca)}% de confiança
              </Text>
            </View>

            <View className="bg-white rounded-3xl p-6 shadow-lg mb-4">
              <View className="items-center">
                <Ionicons name="restaurant" size={48} color="#FF7F6B" />
                <Text className="font-semibold text-lg text-gray-800 text-center mt-3">
                  {analysis.nome}
                </Text>
              </View>
            </View>

            <View className="bg-coral-500 rounded-3xl p-6 mb-4">
              <Text className="text-coral-100 text-sm text-center mb-2">Calorias totais</Text>
              <Text className="text-5xl font-bold text-white text-center">{analysis.calorias}</Text>
              <Text className="text-coral-100 text-sm text-center mt-1">kcal</Text>
            </View>

            <Text className="text-lg font-bold text-gray-800 mb-3">Macronutrientes</Text>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
                <View className="w-12 h-12 bg-coral-100 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="cube" size={24} color="#FF7F6B" />
                </View>
                <Text className="text-2xl font-bold text-coral-600">{Math.round(analysis.carboidratos)}g</Text>
                <Text className="text-xs text-gray-600 mt-1">Carbos</Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
                <View className="w-12 h-12 bg-sage-100 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="barbell" size={24} color="#8FBC8F" />
                </View>
                <Text className="text-2xl font-bold text-sage-600">{Math.round(analysis.proteinas)}g</Text>
                <Text className="text-xs text-gray-600 mt-1">Proteína</Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
                <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center mb-2">
                  <Ionicons name="water" size={24} color="#F59E0B" />
                </View>
                <Text className="text-2xl font-bold text-amber-600">{Math.round(analysis.gorduras)}g</Text>
                <Text className="text-xs text-gray-600 mt-1">Gordura</Text>
              </View>
            </View>

            <View className={`rounded-3xl p-5 mb-6 ${isHighCalorie ? 'bg-amber-50' : 'bg-sage-50'}`}>
              <View className="flex-row">
                <MimooImage variant="salad" size="sm" />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center mb-1">
                    <Ionicons 
                      name={isHighCalorie ? 'heart' : 'sparkles'} 
                      size={16} 
                      color={isHighCalorie ? '#8FBC8F' : '#FFD700'} 
                    />
                    <Text className="text-sm font-semibold text-gray-800 ml-1">
                      {isHighCalorie ? 'Dica carinhosa do Mimoo' : 'Dica do Mimoo'}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-700">
                    {getMimooFeedback(analysis.calorias, {
                      carbs: analysis.carboidratos,
                      protein: analysis.proteinas,
                      fat: analysis.gorduras
                    })}
                  </Text>
                </View>
              </View>
            </View>

            <View className="gap-3 pb-6">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className={`h-14 rounded-3xl items-center justify-center shadow-lg flex-row ${
                  saving ? 'bg-coral-300' : 'bg-coral-500'
                }`}
              >
                {saving ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-lg ml-2">Salvando...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-lg">Salvar refeição</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={reset}
                disabled={saving}
                className="h-14 border-2 border-gray-200 rounded-3xl items-center justify-center flex-row"
              >
                <Ionicons name="camera" size={20} color="#374151" style={{ marginRight: 8 }} />
                <Text className="font-bold text-gray-700">Tirar outra foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
        onCameraReady={() => setCameraReady(true)}
      />
      
      {/* Overlay da câmera */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4">
            <TouchableOpacity
              onPress={goBack}
              className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Capturar refeição</Text>
            <TouchableOpacity
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            >
              <Ionicons name="camera-reverse" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Guia de enquadramento */}
          <View className="flex-1 items-center justify-center">
            <View className="w-72 h-72 border-4 border-coral-500/60 rounded-3xl items-center justify-center">
              {!cameraReady && (
                <View className="items-center">
                  <MimooImage variant="camera" size="lg" animation="bounce" />
                  <Text className="text-white/70 text-sm mt-4">Iniciando câmera...</Text>
                </View>
              )}
            </View>
            {cameraReady && (
              <View className="mt-4 bg-black/50 px-4 py-2 rounded-full flex-row items-center">
                <Ionicons name="restaurant" size={16} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white text-center">Centralize seu prato no quadro</Text>
              </View>
            )}
          </View>

          {/* Controles */}
          <View className="px-6 pb-12">
            <View className="flex-row items-center justify-center gap-8">
              <TouchableOpacity
                onPress={pickImage}
                className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
              >
                <Ionicons name="images" size={26} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={cameraReady ? takePicture : undefined}
                disabled={!cameraReady}
                className={`w-20 h-20 rounded-full items-center justify-center ${
                  cameraReady ? 'bg-coral-500' : 'bg-gray-500'
                }`}
              >
                <View className="w-16 h-16 border-4 border-white rounded-full items-center justify-center">
                  <Ionicons name="camera" size={32} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
              >
                <Ionicons name="camera-reverse" size={26} color="white" />
              </TouchableOpacity>
            </View>

            <View className="items-center mt-6">
              <View className="bg-sage-500/90 px-4 py-2 rounded-full flex-row items-center">
                <Ionicons name="sparkles" size={16} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white text-sm">IA identifica automaticamente sua refeição</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  )
}
