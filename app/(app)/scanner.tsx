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
  Animated,
  Easing,
} from 'react-native'
import { useRouter } from 'expo-router'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { MimooImage } from '../../components/MimooImage'
import { analyzeMealPhoto, MealAnalysis } from '../../lib/openai'
import { addMeal } from '../../lib/supabase'

type Step = 'camera' | 'preview' | 'analyzing' | 'result' | 'not_food'

// Feedback gentil do Mimoo baseado nas calorias (igual ao web)
function getMimooFeedback(
  calories: number,
  macros: { carbs: number; protein: number; fat: number }
): string {
  // Refeição muito calórica - mas sem julgamento!
  if (calories > 1000) {
    const messages = [
      `Uau, essa refeição parece deliciosa e bem servida! 🍽️ Se quiser equilibrar, que tal um jantar mais leve com bastante salada? Mas não se preocupe, um dia mais generoso faz parte da vida!`,
      `Hmm, esse prato está caprichado! 💚 Lembre-se: não é sobre perfeição, é sobre progresso. Nas próximas refeições, você pode optar por algo mais leve se quiser.`,
      `Parece que você está se alimentando bem! 🌟 Se sentir que exagerou, não se cobre - apenas tente equilibrar nas próximas refeições. Estou aqui com você!`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Refeição moderadamente calórica
  if (calories > 700) {
    const messages = [
      `Parece delicioso! 😋 Essa refeição está bem completa. Se for sua principal do dia, está ótimo! Apenas lembre de manter os lanchinhos mais leves.`,
      `Boa escolha! 🌿 Uma refeição assim sustenta bem. Nas próximas, foque em vegetais para manter o equilíbrio perfeito.`,
      `Que refeição bonita! 💚 Está bem servida. Lembre-se de beber bastante água ao longo do dia!`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Refeição equilibrada com proteína
  if (macros.protein > 25) {
    const messages = [
      `Ótima escolha! Seu prato está bem equilibrado com proteínas. Continue assim! 💪`,
      `Perfeito! Uma refeição rica em proteínas ajuda a manter a saciedade. Você está arrasando! ✨`,
      `Adorei ver proteína no prato! Isso vai te dar energia para o dia todo. 🌟`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Refeição leve
  if (calories < 300) {
    const messages = [
      `Refeição leve registrada! 🥗 Lembre-se de comer o suficiente para ter energia ao longo do dia.`,
      `Lanchinho anotado! 🍎 Está se alimentando regularmente? Isso ajuda muito no metabolismo!`,
      `Boa! Uma refeição leve é perfeita para manter a energia. Não esqueça de fazer um lanchinho depois se sentir fome! 💚`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Feedback padrão
  const messages = [
    `Refeição registrada! Continue acompanhando sua alimentação. Cada registro conta! 📝`,
    `Anotado! Você está fazendo um ótimo trabalho registrando suas refeições. 💚`,
    `Mais uma refeição no diário! A consistência é a chave para o sucesso. 🌱`
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

// Frases do Mimoo enquanto fareja
const sniffPhrases = [
  "Hmm, que cheiro bom! 👃",
  "Deixa eu farejar isso... 🐰",
  "Analisando cada ingrediente! 🔍",
  "Parece delicioso daqui! 😋",
  "Calculando os nutrientes... 📊",
  "O Mimoo está curioso! 🌟"
]

export default function Scanner() {
  const router = useRouter()
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const [step, setStep] = useState<Step>('camera')
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null)
  const [saving, setSaving] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState(0)

  // Animações para a tela de análise
  const bounceAnim1 = useRef(new Animated.Value(0)).current
  const bounceAnim2 = useRef(new Animated.Value(0)).current
  const bounceAnim3 = useRef(new Animated.Value(0)).current
  const shimmerAnim = useRef(new Animated.Value(0)).current

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

  // Animações durante análise
  useEffect(() => {
    if (step === 'analyzing') {
      // Bounce dos emojis
      const createBounce = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: -10,
              duration: 400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      }

      createBounce(bounceAnim1, 0).start()
      createBounce(bounceAnim2, 300).start()
      createBounce(bounceAnim3, 600).start()

      // Shimmer da barra
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start()
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
        setPhotoBase64(photo.base64)
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    })

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(result.assets[0].uri)
      setPhotoBase64(result.assets[0].base64)
      setStep('analyzing')
      analyzePhoto(result.assets[0].base64)
    }
  }

  const analyzePhoto = async (base64: string) => {
    console.log('📸 Enviando foto para análise...')
    const result = await analyzeMealPhoto(base64)
    console.log('📊 Resultado da análise:', result)
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
    console.log('💾 Salvando refeição...')

    try {
      const now = new Date()
      const horario = now.toTimeString().substring(0, 8)
      const data = now.toISOString().split('T')[0]

      // Determina o tipo de refeição baseado no horário (igual ao web)
      const hour = now.getHours()
      let tipo_refeicao: 'cafe' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia'

      if (hour < 10) {
        tipo_refeicao = 'cafe'
      } else if (hour < 12) {
        tipo_refeicao = 'lanche_manha'
      } else if (hour < 15) {
        tipo_refeicao = 'almoco'
      } else if (hour < 18) {
        tipo_refeicao = 'lanche_tarde'
      } else if (hour < 21) {
        tipo_refeicao = 'jantar'
      } else {
        tipo_refeicao = 'ceia'
      }

      const saved = await addMeal({
        nome: analysis.nome,
        tipo_refeicao,
        calorias: analysis.calorias,
        carboidratos: analysis.carboidratos,
        proteinas: analysis.proteinas,
        gorduras: analysis.gorduras,
        horario,
        data,
        confianca_ia: analysis.confianca
      })

      if (saved) {
        console.log('✅ Refeição salva com sucesso!')
        Alert.alert(
          'Refeição salva! 🎉',
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
    setPhotoBase64(null)
    setAnalysis(null)
    setStep('camera')
    setCurrentPhrase(0)
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
          className="bg-coral-500 px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold text-lg">Permitir câmera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // Tela de análise (Mimoo farejando) - igual ao web
  if (step === 'analyzing') {
    return (
      <SafeAreaView className="flex-1 bg-coral-50 items-center justify-center px-6">
        {/* Mimoo farejando com animação sniff */}
        <View className="items-center">
          <MimooImage variant="camera" size="xl" animation="sniff" />
          
          {/* Partículas de "cheiro" */}
          <View className="flex-row gap-2 mt-4">
            <Animated.Text 
              style={{ fontSize: 24, transform: [{ translateY: bounceAnim1 }] }}
            >
              ✨
            </Animated.Text>
            <Animated.Text 
              style={{ fontSize: 24, transform: [{ translateY: bounceAnim2 }] }}
            >
              💫
            </Animated.Text>
            <Animated.Text 
              style={{ fontSize: 24, transform: [{ translateY: bounceAnim3 }] }}
            >
              ✨
            </Animated.Text>
          </View>

          {/* Nariz farejando - bolinhas pulsando */}
          <View className="flex-row gap-1 mt-2">
            <View className="w-2 h-2 bg-coral-400 rounded-full opacity-75" />
            <View className="w-2 h-2 bg-sage-400 rounded-full opacity-75" />
            <View className="w-2 h-2 bg-coral-400 rounded-full opacity-75" />
          </View>
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

        {/* Barra de progresso animada */}
        <View className="w-64 mt-8">
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <Animated.View 
              className="h-full bg-coral-500 rounded-full"
              style={{
                transform: [{
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-256, 256]
                  })
                }]
              }}
            />
          </View>
        </View>

        {/* Ícones de comida */}
        <View className="flex-row gap-4 mt-8">
          <Text className="text-2xl">🥗</Text>
          <Text className="text-2xl">🍎</Text>
          <Text className="text-2xl">🥑</Text>
          <Text className="text-2xl">🍽️</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Tela de "não é comida" - igual ao web
  if (step === 'not_food') {
    return (
      <SafeAreaView className="flex-1 bg-coral-50 items-center justify-center px-6">
        {/* Mimoo confuso */}
        <View className="items-center">
          <MimooImage variant="camera" size="xl" animation="bounce" />
          {/* Balão de pensamento */}
          <View className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg">
            <Text className="text-2xl">🤔</Text>
          </View>
        </View>

        {/* Ícone de comida com X */}
        <View className="mt-6 items-center">
          <View className="w-20 h-20 bg-coral-100 rounded-full items-center justify-center">
            <Text className="text-4xl">🍴</Text>
          </View>
          <View className="absolute bottom-0 right-0 w-8 h-8 bg-coral-500 rounded-full items-center justify-center">
            <Text className="text-white text-lg">❌</Text>
          </View>
        </View>

        <Text className="text-2xl font-bold text-gray-800 text-center mt-6 mb-2">
          Hmm, isso não parece comida! 🧐
        </Text>
        <Text className="text-gray-600 text-center px-8 mb-2">
          O Mimoo só consegue analisar fotos de <Text className="font-semibold text-coral-600">refeições e alimentos</Text>. Tente tirar uma foto do seu prato, lanche ou bebida!
        </Text>
        {analysis?.observacoes && (
          <Text className="text-sm text-gray-500 italic bg-white/60 rounded-2xl p-3 text-center">
            "{analysis.observacoes}"
          </Text>
        )}

        {/* Dicas */}
        <View className="bg-white rounded-3xl p-5 w-full mt-6 mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">💡 Dicas para uma boa foto:</Text>
          <View className="gap-2">
            <Text className="text-sm text-gray-600">
              <Text className="text-sage-500">✓</Text> Centralize a comida na foto
            </Text>
            <Text className="text-sm text-gray-600">
              <Text className="text-sage-500">✓</Text> Boa iluminação ajuda muito
            </Text>
            <Text className="text-sm text-gray-600">
              <Text className="text-sage-500">✓</Text> Foto de cima funciona melhor
            </Text>
          </View>
        </View>

        {/* Botões */}
        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={reset}
            className="w-full h-14 bg-coral-500 rounded-3xl items-center justify-center flex-row"
          >
            <Text className="text-white mr-2">📷</Text>
            <Text className="text-white font-bold text-lg">Tirar outra foto</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              reset()
              setTimeout(pickImage, 100)
            }}
            className="w-full h-14 border-2 border-gray-200 rounded-3xl items-center justify-center flex-row"
          >
            <Text className="mr-2">🖼️</Text>
            <Text className="font-bold text-gray-700">Escolher da galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(app)/dashboard')}
            className="w-full h-12"
          >
            <Text className="text-gray-500 text-center font-medium">Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Tela de resultado - igual ao web
  if (step === 'result' && analysis) {
    const isHighCalorie = analysis.calorias > 800

    return (
      <SafeAreaView className="flex-1 bg-cream">
        {/* Header */}
        <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
          <TouchableOpacity 
            onPress={reset} 
            disabled={saving}
            className="w-10 h-10 items-center justify-center rounded-full"
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Análise da refeição</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Mimoo com animação */}
            <View className="items-center mb-6">
              <MimooImage variant="salad" size="lg" animation="bounce" />
              <View className="flex-row items-center mt-4">
                <Text className="text-sage-600 text-xl mr-2">✓</Text>
                <Text className="text-2xl font-bold text-gray-800 text-center">
                  {analysis.calorias > 800 
                    ? 'Hmm, que refeição caprichada! 🍽️'
                    : analysis.calorias > 500 
                    ? 'Uau, parece delicioso! 😋'
                    : 'Boa escolha! 🌿'}
                </Text>
              </View>
              <Text className="text-gray-600 mt-1">
                Analisei com {Math.round(analysis.confianca * 100)}% de confiança
              </Text>
            </View>

            {/* Nome da comida */}
            <View className="bg-white rounded-3xl p-6 shadow-lg mb-4">
              <View className="items-center">
                <Text className="text-5xl mb-3">🍽️</Text>
                <Text className="font-semibold text-lg text-gray-800 text-center">
                  {analysis.nome}
                </Text>
              </View>
            </View>

            {/* Calorias */}
            <View className="bg-coral-500 rounded-3xl p-6 mb-4">
              <Text className="text-coral-100 text-sm text-center mb-2">Calorias totais</Text>
              <Text className="text-5xl font-bold text-white text-center">{analysis.calorias}</Text>
              <Text className="text-coral-100 text-sm text-center mt-1">kcal</Text>
            </View>

            {/* Macros */}
            <Text className="text-lg font-bold text-gray-800 mb-3">Macronutrientes</Text>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
                <View className="w-12 h-12 bg-coral-100 rounded-xl items-center justify-center mb-2">
                  <Text className="text-2xl">🍞</Text>
                </View>
                <Text className="text-2xl font-bold text-coral-600">{Math.round(analysis.carboidratos)}g</Text>
                <Text className="text-xs text-gray-600 mt-1">Carbos</Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
                <View className="w-12 h-12 bg-sage-100 rounded-xl items-center justify-center mb-2">
                  <Text className="text-2xl">🥩</Text>
                </View>
                <Text className="text-2xl font-bold text-sage-600">{Math.round(analysis.proteinas)}g</Text>
                <Text className="text-xs text-gray-600 mt-1">Proteína</Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-md">
                <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center mb-2">
                  <Text className="text-2xl">🥑</Text>
                </View>
                <Text className="text-2xl font-bold text-amber-600">{Math.round(analysis.gorduras)}g</Text>
                <Text className="text-xs text-gray-600 mt-1">Gordura</Text>
              </View>
            </View>

            {/* Dica do Mimoo */}
            <View className={`rounded-3xl p-5 mb-6 ${isHighCalorie ? 'bg-amber-50' : 'bg-sage-50'}`}>
              <View className="flex-row">
                <MimooImage variant="salad" size="sm" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold text-gray-800 mb-1">
                    {isHighCalorie ? '💚 Dica carinhosa do Mimoo' : '✨ Dica do Mimoo'}
                  </Text>
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

            {/* Botões - igual ao web */}
            <View className="gap-3 pb-6">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className={`h-14 rounded-3xl items-center justify-center shadow-lg ${
                  saving ? 'bg-coral-300' : 'bg-coral-500'
                }`}
              >
                {saving ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-lg ml-2">Salvando...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-lg">Salvar refeição</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={reset}
                disabled={saving}
                className="h-14 border-2 border-gray-200 rounded-3xl items-center justify-center"
              >
                <Text className="font-bold text-gray-700">Tirar outra foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Tela de câmera - igual ao web
  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        onCameraReady={() => setCameraReady(true)}
      >
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            >
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Capturar refeição</Text>
            <TouchableOpacity
              onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            >
              <Text className="text-white text-xl">🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Guia de enquadramento */}
          <View className="flex-1 items-center justify-center">
            <View className="w-72 h-72 border-4 border-coral-500/60 rounded-3xl items-center justify-center">
              {/* Cantos decorativos */}
              <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-coral-500 rounded-tl-xl" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-coral-500 rounded-tr-xl" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-coral-500 rounded-bl-xl" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-coral-500 rounded-br-xl" />
              
              {!cameraReady && (
                <View className="items-center">
                  <MimooImage variant="camera" size="lg" animation="bounce" />
                  <Text className="text-white/70 text-sm mt-4">Iniciando câmera...</Text>
                  <View className="flex-row gap-2 mt-2">
                    <View className="w-2 h-2 bg-coral-500 rounded-full" />
                    <View className="w-2 h-2 bg-coral-500 rounded-full" />
                    <View className="w-2 h-2 bg-coral-500 rounded-full" />
                  </View>
                </View>
              )}
            </View>
            {cameraReady && (
              <View className="mt-4 bg-black/50 px-4 py-2 rounded-full">
                <Text className="text-white text-center">
                  Centralize seu prato no quadro 🍽️
                </Text>
              </View>
            )}
          </View>

          {/* Controles */}
          <View className="px-6 pb-12">
            <View className="flex-row items-center justify-center gap-8">
              {/* Galeria */}
              <TouchableOpacity
                onPress={pickImage}
                className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
              >
                <Text className="text-2xl">🖼️</Text>
              </TouchableOpacity>

              {/* Capturar */}
              <TouchableOpacity
                onPress={cameraReady ? takePicture : undefined}
                disabled={!cameraReady}
                className={`w-20 h-20 rounded-full items-center justify-center ${
                  cameraReady ? 'bg-coral-500' : 'bg-gray-500'
                }`}
              >
                <View className="w-16 h-16 border-4 border-white rounded-full items-center justify-center">
                  <Text className="text-3xl">📷</Text>
                </View>
                {/* Anel de pulsação quando pronto */}
                {cameraReady && (
                  <View className="absolute w-20 h-20 rounded-full border-4 border-coral-400 opacity-50" />
                )}
              </TouchableOpacity>

              {/* Trocar câmera */}
              <TouchableOpacity
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
              >
                <Text className="text-2xl">🔄</Text>
              </TouchableOpacity>
            </View>

            {/* Dica */}
            <View className="items-center mt-6">
              <View className="bg-sage-500/90 px-4 py-2 rounded-full flex-row items-center">
                <Text className="text-white mr-2">✨</Text>
                <Text className="text-white text-sm">IA identifica automaticamente sua refeição</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}
