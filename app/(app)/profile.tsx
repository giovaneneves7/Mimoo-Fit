import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, updateUserProfile } from '../../lib/supabase'

export default function Profile() {
  const router = useRouter()
  const { profile, signOut, refreshProfile } = useAuth()
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState(profile?.nome || '')
  const [saving, setSaving] = useState(false)

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri)
    }
  }

  const uploadPhoto = async (uri: string) => {
    if (!profile?.id) return

    setUploadingPhoto(true)

    try {
      // Converte URI para Blob
      const response = await fetch(uri)
      const blob = await response.blob()

      const fileName = `${profile.id}-${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await updateUserProfile({ foto_url: publicUrl })
      await refreshProfile()

      Alert.alert('Sucesso!', 'Foto atualizada! 📸')
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      Alert.alert('Erro', 'Não foi possível atualizar a foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSaveName = async () => {
    if (!editName.trim()) return

    setSaving(true)
    try {
      await updateUserProfile({ nome: editName.trim() })
      await refreshProfile()
      setShowEditModal(false)
      Alert.alert('Sucesso!', 'Nome atualizado!')
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  const menuItems = [
    {
      icon: '👤',
      title: 'Dados pessoais',
      subtitle: 'Nome, idade, altura',
      onPress: () => {
        setEditName(profile?.nome || '')
        setShowEditModal(true)
      },
    },
    {
      icon: '🎯',
      title: 'Metas e objetivos',
      subtitle: `Meta: ${profile?.peso_meta || 0}kg`,
      onPress: () => Alert.alert('Em breve', 'Edição de metas em desenvolvimento!'),
    },
    {
      icon: '💧',
      title: 'Meta de água',
      subtitle: `${profile?.meta_agua_ml || 2000}ml por dia`,
      onPress: () => Alert.alert('Em breve', 'Edição em desenvolvimento!'),
    },
    {
      icon: '🔔',
      title: 'Notificações',
      subtitle: 'Lembretes e alertas',
      onPress: () => router.push('/notifications-settings' as any),
    },
    {
      icon: '❓',
      title: 'Ajuda e suporte',
      subtitle: 'Perguntas frequentes',
      onPress: () => Alert.alert('Ajuda', 'Entre em contato: suporte@mimoo.app'),
    },
  ]

  // Estatísticas
  const stats = [
    { label: 'Peso atual', value: `${profile?.peso || 0}kg`, icon: '⚖️' },
    { label: 'Meta', value: `${profile?.peso_meta || 0}kg`, icon: '🎯' },
    { label: 'IMC', value: profile?.imc?.toFixed(1) || '0', icon: '📊' },
  ]

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-32">
          {/* Header */}
          <View className="items-center mb-8">
            {/* Avatar */}
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={uploadingPhoto}
              className="relative mb-4"
            >
              <View className="w-28 h-28 bg-coral-100 rounded-full items-center justify-center overflow-hidden">
                {uploadingPhoto ? (
                  <ActivityIndicator color="#FF7F6B" size="large" />
                ) : profile?.foto_url ? (
                  <Image
                    source={{ uri: profile.foto_url }}
                    className="w-28 h-28"
                  />
                ) : (
                  <Text className="text-5xl">🐰</Text>
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-coral-500 rounded-full items-center justify-center">
                <Text>📷</Text>
              </View>
            </TouchableOpacity>

            <Text className="font-heading text-2xl font-bold text-gray-800">
              {profile?.nome || 'Usuário'}
            </Text>
            <Text className="text-gray-500">{profile?.email}</Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3 mb-6">
            {stats.map((stat, index) => (
              <View
                key={index}
                className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm"
              >
                <Text className="text-2xl mb-1">{stat.icon}</Text>
                <Text className="font-bold text-gray-800">{stat.value}</Text>
                <Text className="text-gray-500 text-xs">{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Calories target */}
          <View className="bg-coral-500 rounded-3xl p-6 mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-coral-100 text-sm">Meta calórica diária</Text>
                <Text className="text-white text-3xl font-bold">
                  {profile?.calorias_diarias || 0} kcal
                </Text>
              </View>
              <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
                <Text className="text-3xl">🔥</Text>
              </View>
            </View>
          </View>

          {/* Menu items */}
          <View className="bg-white rounded-3xl overflow-hidden shadow-lg mb-6">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className={`flex-row items-center p-4 ${
                  index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-4">
                  <Text className="text-2xl">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{item.title}</Text>
                  <Text className="text-gray-500 text-sm">{item.subtitle}</Text>
                </View>
                <Text className="text-gray-400 text-xl">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 rounded-2xl p-4 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-red-500 font-semibold">Sair da conta</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text className="text-gray-400 text-center mt-6 text-sm">
            Mimoo v1.0.0 • Feito com 💚
          </Text>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="font-heading text-xl font-bold text-gray-800 mb-4">
              Editar nome
            </Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Seu nome"
              className="h-14 px-4 bg-gray-100 rounded-2xl text-gray-800 mb-4"
              placeholderTextColor="#9CA3AF"
            />

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 py-4 rounded-2xl items-center"
              >
                <Text className="font-semibold text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveName}
                disabled={saving}
                className={`flex-1 py-4 rounded-2xl items-center ${
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
    </SafeAreaView>
  )
}

