import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { getTodayDateString, formatDateString, getCurrentTimeString } from './date-utils'

// Adapter para AsyncStorage (funciona em todas as plataformas)
const ExpoStorageAdapter = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch {
      // ignore
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}

// IMPORTANTE: Substitua essas variáveis pelas suas credenciais do Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tipos do banco de dados
export interface User {
  id: string
  auth_id?: string
  email?: string
  created_at: string
  updated_at: string
  nome: string
  foto_url?: string
  objetivo: 'perder_peso' | 'manter_peso' | 'ganhar_massa'
  genero: 'feminino' | 'masculino'
  altura: number
  peso: number
  idade: number
  peso_meta: number
  nivel_atividade: 'sedentario' | 'leve' | 'moderado' | 'muito'
  velocidade: 'lento' | 'normal' | 'rapido'
  historico_anos?: string
  tentativas_anteriores?: string
  barreiras?: string[]
  gatilho_emocional?: string
  proximo_nivel?: string
  imc?: number
  tmb?: number
  calorias_diarias?: number
  data_meta_estimada?: string
  is_premium: boolean
  premium_expires_at?: string
  meta_agua_ml?: number
  notificacoes_ativas?: boolean
}

export interface Meal {
  id: string
  user_id: string
  created_at: string
  nome: string
  tipo_refeicao: 'cafe' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia'
  foto_url?: string
  calorias: number
  carboidratos: number
  proteinas: number
  gorduras: number
  horario: string
  data: string
  confianca_ia?: number
  observacoes?: string
}

export interface DailyProgress {
  id: string
  user_id: string
  data: string
  created_at: string
  updated_at: string
  calorias_consumidas: number
  carboidratos_consumidos: number
  proteinas_consumidas: number
  gorduras_consumidas: number
  peso_atual?: number
  meta_cumprida: boolean
}

export interface HydrationLog {
  id: string
  user_id: string
  data: string
  created_at: string
  updated_at: string
  quantidade_ml: number
  horario: string
  tipo: 'agua' | 'cha' | 'cafe' | 'suco' | 'outro'
}

// Busca o ID do usuário atual
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) return null

    const { data: userData, error } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (error || !userData) return null

    return userData.id
  } catch (error) {
    console.error('Erro ao buscar ID do usuário:', error)
    return null
  }
}

// Funções de helper
export async function getCurrentUser(): Promise<User | null> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Erro ao buscar usuário:', error)
    return null
  }

  return data
}

export async function getTodayProgress(): Promise<DailyProgress | null> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return null

  const today = getTodayDateString()

  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('data', today)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar progresso:', error)
    return null
  }

  return data
}

export async function getTodayMeals(): Promise<Meal[]> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return []

  const today = getTodayDateString()

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('data', today)
    .order('horario', { ascending: true })

  if (error) {
    console.error('Erro ao buscar refeições:', error)
    return []
  }

  return data || []
}

export async function addMeal(meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>): Promise<Meal | null> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('meals')
    .insert({ ...meal, user_id: userId })
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar refeição:', error)
    return null
  }

  // Atualiza o progresso diário automaticamente
  if (data) {
    await updateDailyProgress(userId, meal.data)
  }

  return data
}

// Atualiza ou cria o progresso diário
async function updateDailyProgress(userId: string, data: string): Promise<void> {
  try {
    // Busca todas as refeições do dia
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('calorias, carboidratos, proteinas, gorduras')
      .eq('user_id', userId)
      .eq('data', data)

    if (mealsError) {
      console.error('Erro ao buscar refeições do dia:', mealsError)
      return
    }

    // Calcula totais
    const totals = (mealsData || []).reduce(
      (acc, meal) => ({
        calorias: acc.calorias + (meal.calorias || 0),
        carboidratos: acc.carboidratos + (meal.carboidratos || 0),
        proteinas: acc.proteinas + (meal.proteinas || 0),
        gorduras: acc.gorduras + (meal.gorduras || 0),
      }),
      { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 }
    )

    // Busca a meta de calorias do usuário
    const { data: userData } = await supabase
      .from('users')
      .select('calorias_diarias')
      .eq('id', userId)
      .single()

    const caloriesGoal = userData?.calorias_diarias || 2000
    
    // Meta cumprida se atingiu pelo menos 80% da meta calórica
    // Não penalizamos por passar da meta (comer mais não invalida o dia)
    const minCalories = caloriesGoal * 0.8  // 80% da meta
    const metaCumprida = totals.calorias >= minCalories
    
    console.log('📊 Verificação de meta:', {
      calorias_consumidas: totals.calorias,
      meta_diaria: caloriesGoal,
      minimo_para_meta: minCalories,
      meta_cumprida: metaCumprida
    })

    // Verifica se já existe progresso para o dia
    const { data: existingProgress } = await supabase
      .from('daily_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('data', data)
      .single()

    if (existingProgress) {
      // Atualiza
      await supabase
        .from('daily_progress')
        .update({
          calorias_consumidas: totals.calorias,
          carboidratos_consumidos: totals.carboidratos,
          proteinas_consumidas: totals.proteinas,
          gorduras_consumidas: totals.gorduras,
          meta_cumprida: metaCumprida,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
    } else {
      // Cria novo
      await supabase
        .from('daily_progress')
        .insert({
          user_id: userId,
          data,
          calorias_consumidas: totals.calorias,
          carboidratos_consumidos: totals.carboidratos,
          proteinas_consumidas: totals.proteinas,
          gorduras_consumidas: totals.gorduras,
          meta_cumprida: metaCumprida,
        })
    }

    console.log('✅ Progresso diário atualizado:', { data, totals, metaCumprida })
  } catch (error) {
    console.error('Erro ao atualizar progresso diário:', error)
  }
}

// Hidratação
export async function getTodayHydration(): Promise<{ total: number; logs: HydrationLog[] }> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { total: 0, logs: [] }

  const today = getTodayDateString()

  const { data, error } = await supabase
    .from('hydration_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('data', today)
    .order('horario', { ascending: false })

  if (error) {
    console.error('Erro ao buscar hidratação:', error)
    return { total: 0, logs: [] }
  }

  const logs = data || []
  const total = logs.reduce((sum, log) => sum + log.quantidade_ml, 0)

  return { total, logs }
}

export async function addHydration(
  quantidade_ml: number = 250,
  tipo: HydrationLog['tipo'] = 'agua'
): Promise<HydrationLog | null> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return null

  const today = getTodayDateString()
  const horario = getCurrentTimeString()

  const { data, error } = await supabase
    .from('hydration_logs')
    .insert({ user_id: userId, data: today, quantidade_ml, horario, tipo })
    .select()
    .single()

  if (error) {
    console.error('Erro ao adicionar água:', error)
    return null
  }

  return data
}

// Criação de perfil
export async function createUserProfile(
  profileData: {
    nome: string
    email: string
    objetivo: 'perder_peso' | 'manter_peso' | 'ganhar_massa'
    genero: 'feminino' | 'masculino'
    altura: number
    peso: number
    idade: number
    peso_meta: number
    nivel_atividade: 'sedentario' | 'leve' | 'moderado' | 'muito'
    velocidade: 'lento' | 'normal' | 'rapido'
    historico_anos?: string
    tentativas_anteriores?: string
    barreiras?: string[]
    gatilho_emocional?: string
    proximo_nivel?: string
  },
  authId?: string
): Promise<User | null> {
  try {
    let userId = authId
    
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id
    }
    
    if (!userId) {
      console.error('Usuário não autenticado')
      return null
    }

    // Verifica se já existe perfil
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, nome, peso')
      .eq('auth_id', userId)
      .single()

    if (existingUser && existingUser.nome && existingUser.peso) {
      const { data: fullProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingUser.id)
        .single()
      return fullProfile as User
    }

    // Calcula valores derivados
    const imc = calculateIMC(profileData.peso, profileData.altura)
    const tmb = calculateTMB(profileData.peso, profileData.altura, profileData.idade, profileData.genero)
    const calorias_diarias = calculateDailyCalorias(tmb, profileData.nivel_atividade, profileData.objetivo, profileData.velocidade)
    const data_meta_estimada = calculateTargetDate(profileData.peso, profileData.peso_meta, profileData.velocidade).toISOString().split('T')[0]

    const userData = {
      auth_id: userId,
      ...profileData,
      imc,
      tmb,
      calorias_diarias,
      data_meta_estimada,
      is_premium: false
    }

    let data = null
    let error = null

    if (existingUser) {
      const result = await supabase.from('users').update(userData).eq('id', existingUser.id).select().single()
      data = result.data
      error = result.error
    } else {
      const result = await supabase.from('users').insert(userData).select().single()
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Erro ao salvar perfil:', error.message)
      return null
    }

    return data
  } catch (error) {
    console.error('Exceção ao criar perfil:', error)
    return null
  }
}

export async function updateUserProfile(updates: Partial<User>): Promise<User | null> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar perfil:', error)
    return null
  }

  return data
}

// Funções de cálculo
export function calculateIMC(peso: number, altura: number): number {
  return peso / Math.pow(altura / 100, 2)
}

export function calculateTMB(peso: number, altura: number, idade: number, genero: 'feminino' | 'masculino'): number {
  if (genero === 'masculino') {
    return Math.round(10 * peso + 6.25 * altura - 5 * idade + 5)
  } else {
    return Math.round(10 * peso + 6.25 * altura - 5 * idade - 161)
  }
}

export function calculateDailyCalorias(
  tmb: number,
  nivelAtividade: 'sedentario' | 'leve' | 'moderado' | 'muito',
  objetivo: 'perder_peso' | 'manter_peso' | 'ganhar_massa',
  velocidade: 'lento' | 'normal' | 'rapido'
): number {
  const atividadeMultiplier = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    muito: 1.725
  }

  const deficitMap = {
    perder_peso: { lento: -250, normal: -500, rapido: -750 },
    manter_peso: { lento: 0, normal: 0, rapido: 0 },
    ganhar_massa: { lento: 250, normal: 500, rapido: 750 }
  }

  const tdee = tmb * atividadeMultiplier[nivelAtividade]
  const deficit = deficitMap[objetivo][velocidade]

  return Math.round(tdee + deficit)
}

export function calculateTargetDate(pesoAtual: number, pesoMeta: number, velocidade: 'lento' | 'normal' | 'rapido'): Date {
  const perdaSemanal = { lento: 0.25, normal: 0.5, rapido: 0.75 }
  const diferencaPeso = Math.abs(pesoAtual - pesoMeta)
  const semanasNecessarias = diferencaPeso / perdaSemanal[velocidade]
  const diasNecessarios = Math.ceil(semanasNecessarias * 7)

  const dataAtual = new Date()
  dataAtual.setDate(dataAtual.getDate() + diasNecessarios)

  return dataAtual
}

// Remover última hidratação
export async function removeLastHydration(): Promise<boolean> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return false

  const today = getTodayDateString()

  // Busca o último registro
  const { data: lastLog, error: fetchError } = await supabase
    .from('hydration_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('data', today)
    .order('horario', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !lastLog) return false

  // Remove
  const { error } = await supabase
    .from('hydration_logs')
    .delete()
    .eq('id', lastLog.id)

  return !error
}

// Progresso da semana
export async function getWeekProgress(): Promise<DailyProgress[]> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return []

  // Usa data local de Brasília
  const todayString = getTodayDateString()
  const today = new Date(todayString + 'T12:00:00') // Meio dia para evitar problemas de timezone
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 6)
  const weekAgoString = formatDateString(weekAgo)

  console.log('📅 Buscando progresso da semana:', { de: weekAgoString, ate: todayString })

  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('data', weekAgoString)
    .lte('data', todayString)
    .order('data', { ascending: true })

  if (error) {
    console.error('Erro ao buscar progresso da semana:', error)
    return []
  }

  return data || []
}

// Tipo para histórico de peso
export interface WeightLog {
  id: string
  user_id: string
  data: string
  peso: number
  created_at: string
}

// Histórico de peso
export async function getWeightHistory(): Promise<WeightLog[]> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .limit(30)

  if (error) {
    console.error('Erro ao buscar histórico de peso:', error)
    return []
  }

  return data || []
}
