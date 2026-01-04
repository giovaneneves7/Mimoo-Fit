import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../../contexts/AuthContext'
import { MimooImage } from '../../components/MimooImage'
import { supabase, updateUserProfile } from '../../lib/supabase'

export default function Profile() {
  const router = useRouter()
  const { profile, signOut, user, refreshProfile } = useAuth()

  const [loggingOut, setLoggingOut] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)

  // Modais
  const [showPersonalData, setShowPersonalData] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Dados de edição
  const [editName, setEditName] = useState(profile?.nome || '')
  const [editAltura, setEditAltura] = useState(profile?.altura?.toString() || '')
  const [editIdade, setEditIdade] = useState(profile?.idade?.toString() || '')
  const [editGenero, setEditGenero] = useState(profile?.genero || 'feminino')

  const [editPeso, setEditPeso] = useState(profile?.peso?.toString() || '')
  const [editPesoMeta, setEditPesoMeta] = useState(profile?.peso_meta?.toString() || '')
  const [editObjetivo, setEditObjetivo] = useState(profile?.objetivo || 'perder_peso')
  const [editMetaAgua, setEditMetaAgua] = useState(profile?.meta_agua_ml?.toString() || '2000')

  const name = profile?.nome || 'Usuário'
  const email = user?.email || profile?.email || 'usuario@exemplo.com'
  const currentWeight = profile?.peso?.toString() || '—'
  const goalWeight = profile?.peso_meta?.toString() || '—'
  const photoUrl = profile?.foto_url

  const handlePhotoUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })

    if (!result.canceled && profile?.id) {
      setUploadingPhoto(true)
      try {
        const file = result.assets[0]
        const fileExt = file.uri.split('.').pop()
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`

        // Para simplificar, vamos apenas atualizar o perfil com a URI local
        // Em produção, você faria upload para o Supabase Storage
        await updateUserProfile({ foto_url: file.uri })
        await refreshProfile()
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível atualizar a foto')
      } finally {
        setUploadingPhoto(false)
      }
    }
  }

  const handleSavePersonalData = async () => {
    setSaving(true)
    try {
      await updateUserProfile({
        nome: editName,
        altura: parseFloat(editAltura),
        idade: parseInt(editIdade),
        genero: editGenero as 'feminino' | 'masculino'
      })
      await refreshProfile()
      setShowPersonalData(false)
      Alert.alert('Sucesso', 'Dados atualizados!')
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveGoals = async () => {
    setSaving(true)
    try {
      await updateUserProfile({
        peso: parseFloat(editPeso),
        peso_meta: parseFloat(editPesoMeta),
        objetivo: editObjetivo as 'perder_peso' | 'manter_peso' | 'ganhar_massa',
        meta_agua_ml: parseInt(editMetaAgua)
      })
      await refreshProfile()
      setShowGoals(false)
      Alert.alert('Sucesso', 'Metas atualizadas!')
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true)
            await signOut()
            router.replace('/(auth)/login')
          }
        }
      ]
    )
  }

  const menuItems = [
    {
      icon: '👤',
      label: 'Dados pessoais',
      color: 'coral',
      onPress: () => {
        setEditName(profile?.nome || '')
        setEditAltura(profile?.altura?.toString() || '')
        setEditIdade(profile?.idade?.toString() || '')
        setEditGenero(profile?.genero || 'feminino')
        setShowPersonalData(true)
      }
    },
    {
      icon: '🎯',
      label: 'Metas e objetivos',
      color: 'sage',
      onPress: () => {
        setEditPeso(profile?.peso?.toString() || '')
        setEditPesoMeta(profile?.peso_meta?.toString() || '')
        setEditObjetivo(profile?.objetivo || 'perder_peso')
        setEditMetaAgua(profile?.meta_agua_ml?.toString() || '2000')
        setShowGoals(true)
      }
    },
    {
      icon: '🔔',
      label: 'Notificações',
      color: 'amber',
      onPress: () => Alert.alert('Em breve', 'Configurações de notificação estarão disponíveis em breve!')
    },
    {
      icon: '🛡️',
      label: 'Privacidade',
      color: 'coral',
      onPress: () => Alert.alert('Privacidade', 'Seus dados estão seguros e nunca são compartilhados com terceiros.')
    },
    {
      icon: '❓',
      label: 'Ajuda e suporte',
      color: 'sage',
      onPress: () => setShowHelp(true)
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-coral-500 px-6 pt-6 pb-20 rounded-b-[3rem]">
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Perfil</Text>
            <View className="w-10" />
          </View>

          {/* Avatar */}
          <View className="items-center">
            <TouchableOpacity onPress={handlePhotoUpload} className="relative">
              <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-lg overflow-hidden">
                {uploadingPhoto ? (
                  <ActivityIndicator color="#FF7F6B" />
                ) : photoUrl ? (
                  <Image source={{ uri: photoUrl }} className="w-full h-full" />
                ) : (
                  <MimooImage variant="camera" size="md" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-coral-600 rounded-full items-center justify-center">
                <Text className="text-white">📷</Text>
              </View>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white mt-4">{name}</Text>
            <Text className="text-coral-100 text-sm">{email}</Text>
          </View>
        </View>

        <View className="px-6 -mt-12">
          {/* Stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg">
              <View className="w-12 h-12 bg-coral-100 rounded-xl items-center justify-center mb-3">
                <Text className="text-2xl">⚖️</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-800">{currentWeight}kg</Text>
              <Text className="text-xs text-gray-600 mt-1">Peso atual</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-lg">
              <View className="w-12 h-12 bg-sage-100 rounded-xl items-center justify-center mb-3">
                <Text className="text-2xl">🎯</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-800">{goalWeight}kg</Text>
              <Text className="text-xs text-gray-600 mt-1">Meta</Text>
            </View>
          </View>

          {/* Menu */}
          <View className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className={`flex-row items-center p-4 ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View className={`w-11 h-11 rounded-xl items-center justify-center mr-4 ${
                  item.color === 'coral' ? 'bg-coral-100' :
                  item.color === 'sage' ? 'bg-sage-100' : 'bg-amber-100'
                }`}>
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <Text className="flex-1 font-medium text-gray-800">{item.label}</Text>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Premium CTA */}
          <View className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl p-6 mb-6">
            <Text className="text-xl font-bold text-white mb-2">
              Upgrade para Premium ✨
            </Text>
            <Text className="text-white/90 text-sm mb-4">
              Desbloqueie recursos exclusivos e tenha uma experiência ainda melhor!
            </Text>
            <TouchableOpacity className="bg-white py-3 px-6 rounded-2xl self-start">
              <Text className="font-semibold text-amber-600">Ver benefícios</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            className="w-full h-14 border-2 border-red-200 rounded-3xl items-center justify-center flex-row mb-6"
          >
            {loggingOut ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <>
                <Text className="text-2xl mr-2">🚪</Text>
                <Text className="font-semibold text-red-600">Sair da conta</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Version */}
          <Text className="text-center text-gray-500 text-sm mb-8">
            Mimoo v1.0.0 • Feito com 💚
          </Text>
        </View>
      </ScrollView>

      {/* Modal: Dados Pessoais */}
      <Modal visible={showPersonalData} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">Dados Pessoais</Text>
            
            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-1">Nome</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                className="h-12 bg-gray-100 rounded-2xl px-4"
                placeholder="Seu nome"
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Altura (cm)</Text>
                <TextInput
                  value={editAltura}
                  onChangeText={setEditAltura}
                  keyboardType="numeric"
                  className="h-12 bg-gray-100 rounded-2xl px-4"
                  placeholder="170"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 mb-1">Idade</Text>
                <TextInput
                  value={editIdade}
                  onChangeText={setEditIdade}
                  keyboardType="numeric"
                  className="h-12 bg-gray-100 rounded-2xl px-4"
                  placeholder="25"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm text-gray-600 mb-2">Gênero</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setEditGenero('feminino')}
                  className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                    editGenero === 'feminino' ? 'bg-coral-500' : 'bg-gray-100'
                  }`}
                >
                  <Text className={editGenero === 'feminino' ? 'text-white font-semibold' : 'text-gray-700'}>
                    Feminino
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditGenero('masculino')}
                  className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                    editGenero === 'masculino' ? 'bg-coral-500' : 'bg-gray-100'
                  }`}
                >
                  <Text className={editGenero === 'masculino' ? 'text-white font-semibold' : 'text-gray-700'}>
                    Masculino
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowPersonalData(false)}
                className="flex-1 h-12 border-2 border-gray-200 rounded-2xl items-center justify-center"
              >
                <Text className="font-semibold text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSavePersonalData}
                disabled={saving}
                className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                  saving ? 'bg-coral-300' : 'bg-coral-500'
                }`}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white">Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Metas */}
      <Modal visible={showGoals} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">Metas e Objetivos</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Peso atual (kg)</Text>
                  <TextInput
                    value={editPeso}
                    onChangeText={setEditPeso}
                    keyboardType="numeric"
                    className="h-12 bg-gray-100 rounded-2xl px-4"
                    placeholder="70"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600 mb-1">Meta (kg)</Text>
                  <TextInput
                    value={editPesoMeta}
                    onChangeText={setEditPesoMeta}
                    keyboardType="numeric"
                    className="h-12 bg-gray-100 rounded-2xl px-4"
                    placeholder="65"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Objetivo</Text>
                <View className="gap-2">
                  {[
                    { value: 'perder_peso', label: '📉 Perder peso' },
                    { value: 'manter_peso', label: '⚖️ Manter peso' },
                    { value: 'ganhar_massa', label: '💪 Ganhar massa' },
                  ].map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setEditObjetivo(opt.value)}
                      className={`h-12 rounded-2xl items-center justify-center ${
                        editObjetivo === opt.value ? 'bg-sage-500' : 'bg-gray-100'
                      }`}
                    >
                      <Text className={editObjetivo === opt.value ? 'text-white font-semibold' : 'text-gray-700'}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-2">Meta de água diária</Text>
                <View className="flex-row gap-2">
                  {['1500', '2000', '2500', '3000'].map((ml) => (
                    <TouchableOpacity
                      key={ml}
                      onPress={() => setEditMetaAgua(ml)}
                      className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                        editMetaAgua === ml ? 'bg-blue-500' : 'bg-gray-100'
                      }`}
                    >
                      <Text className={editMetaAgua === ml ? 'text-white font-semibold' : 'text-gray-700'}>
                        {(parseInt(ml) / 1000).toFixed(1)}L
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className="flex-row gap-3 pt-4">
              <TouchableOpacity
                onPress={() => setShowGoals(false)}
                className="flex-1 h-12 border-2 border-gray-200 rounded-2xl items-center justify-center"
              >
                <Text className="font-semibold text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveGoals}
                disabled={saving}
                className={`flex-1 h-12 rounded-2xl items-center justify-center ${
                  saving ? 'bg-sage-300' : 'bg-sage-500'
                }`}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white">Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Ajuda */}
      <Modal visible={showHelp} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-center">Ajuda e Suporte</Text>
            
            <View className="items-center py-4 mb-6">
              <MimooImage variant="camera" size="lg" />
              <Text className="text-gray-600 mt-4 text-center">
                O Mimoo está aqui para te ajudar! 💚
              </Text>
            </View>

            <View className="gap-2 mb-6">
              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <Text className="text-gray-800">📧 Enviar email</Text>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <Text className="text-gray-800">❓ Perguntas frequentes</Text>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <Text className="text-gray-800">📱 Tutorial do app</Text>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowHelp(false)}
              className="h-12 bg-sage-500 rounded-2xl items-center justify-center"
            >
              <Text className="font-semibold text-white">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
