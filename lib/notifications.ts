import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Configura como as notificações aparecem quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Mensagens carinhosas do Mimoo para água
const waterMessages = [
  '💧 Ei, que tal um copinho de água? O Mimoo está com sede também!',
  '💧 Hidratação é amor próprio! Bora beber água? 🐰',
  '💧 Psiu! Hora de hidratar esse corpinho lindo! 💚',
  '💧 O Mimoo lembra: água é vida! Já bebeu hoje?',
  '💧 Glub glub! 🐰 Hora de beber água, amiga!',
]

// Mensagens para refeições
const mealMessages = {
  lunch: [
    '🍽️ Ei, já almoçou? O Mimoo quer ver o que você vai comer! 📸',
    '🥗 Hora do almoço! Não esquece de registrar, hein? 🐰',
    '🌿 Meio-dia! O Mimoo está curioso pra ver seu almoço!',
  ],
  snack: [
    '🍽️ Boa tarde! Já lançou o lanchinho da tarde? 🐰',
    '☕ 17h! Que tal um lanchinho? O Mimoo quer saber! 💚',
    '🍎 Pausa pro lanche? Registra aqui no Mimoo!',
  ],
}

// Pega mensagem aleatória
function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)]
}

// Registra para notificações push
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Notificações push não funcionam em emuladores')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Permissão de notificação não concedida')
    return null
  }

  // Configura canal de notificação para Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Mimoo',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7F6B',
    })

    await Notifications.setNotificationChannelAsync('water', {
      name: 'Lembretes de Água',
      importance: Notifications.AndroidImportance.DEFAULT,
    })

    await Notifications.setNotificationChannelAsync('meals', {
      name: 'Lembretes de Refeição',
      importance: Notifications.AndroidImportance.HIGH,
    })
  }

  return 'granted'
}

// Agenda lembrete de água (a cada 30 minutos)
export async function scheduleWaterReminders(): Promise<void> {
  // Cancela lembretes anteriores de água
  await cancelWaterReminders()

  // Agenda para cada 30 minutos
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mimoo 🐰💧',
      body: getRandomMessage(waterMessages),
      sound: true,
    },
    trigger: {
      seconds: 30 * 60, // 30 minutos
      repeats: true,
      channelId: 'water',
    },
  })

  await AsyncStorage.setItem('mimoo_water_reminders', 'true')
  console.log('💧 Lembretes de água agendados!')
}

// Cancela lembretes de água
export async function cancelWaterReminders(): Promise<void> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync()
  
  for (const notification of notifications) {
    if (notification.content.title?.includes('💧')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier)
    }
  }

  await AsyncStorage.setItem('mimoo_water_reminders', 'false')
}

// Agenda lembretes de refeição (12h e 17h)
export async function scheduleMealReminders(): Promise<void> {
  // Cancela anteriores
  await cancelMealReminders()

  // Lembrete do almoço (12h)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mimoo 🐰🍽️',
      body: getRandomMessage(mealMessages.lunch),
      sound: true,
    },
    trigger: {
      hour: 12,
      minute: 0,
      repeats: true,
      channelId: 'meals',
    },
  })

  // Lembrete do lanche (17h)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mimoo 🐰☕',
      body: getRandomMessage(mealMessages.snack),
      sound: true,
    },
    trigger: {
      hour: 17,
      minute: 0,
      repeats: true,
      channelId: 'meals',
    },
  })

  await AsyncStorage.setItem('mimoo_meal_reminders', 'true')
  console.log('🍽️ Lembretes de refeição agendados!')
}

// Cancela lembretes de refeição
export async function cancelMealReminders(): Promise<void> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync()
  
  for (const notification of notifications) {
    if (notification.content.title?.includes('🍽️') || notification.content.title?.includes('☕')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier)
    }
  }

  await AsyncStorage.setItem('mimoo_meal_reminders', 'false')
}

// Inicia todos os lembretes
export async function startAllReminders(): Promise<boolean> {
  const permission = await registerForPushNotificationsAsync()
  
  if (!permission) {
    return false
  }

  await scheduleWaterReminders()
  await scheduleMealReminders()
  await AsyncStorage.setItem('mimoo_notifications_enabled', 'true')

  return true
}

// Para todos os lembretes
export async function stopAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
  await AsyncStorage.setItem('mimoo_notifications_enabled', 'false')
  await AsyncStorage.setItem('mimoo_water_reminders', 'false')
  await AsyncStorage.setItem('mimoo_meal_reminders', 'false')
}

// Verifica se lembretes estão ativos
export async function areRemindersActive(): Promise<{
  water: boolean
  meals: boolean
}> {
  const water = await AsyncStorage.getItem('mimoo_water_reminders')
  const meals = await AsyncStorage.getItem('mimoo_meal_reminders')

  return {
    water: water === 'true',
    meals: meals === 'true',
  }
}

// Envia notificação instantânea (para testes)
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mimoo 🐰💚',
      body: 'Notificações estão funcionando! Yay!',
      sound: true,
    },
    trigger: null, // Envia imediatamente
  })
}

