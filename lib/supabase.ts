import 'react-native-url-polyfill/dist/setup'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

// Adapter para SecureStore (armazenamento seguro no dispositivo)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key)
  },
}

// IMPORTANTE: Substitua essas variáveis pelas suas credenciais do Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
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

  const today = new Date().toISOString().split('T')[0]

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

  const today = new Date().toISOString().split('T')[0]

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

  return data
}

// Hidratação
export async function getTodayHydration(): Promise<{ total: number; logs: HydrationLog[] }> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { total: 0, logs: [] }

  const today = new Date().toISOString().split('T')[0]

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

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const horario = now.toTimeString().substring(0, 8)

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

