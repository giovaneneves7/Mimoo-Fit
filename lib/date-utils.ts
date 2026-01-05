/**
 * Utilitários de data para o Mimoo
 * Todas as funções usam o fuso horário de Brasília (UTC-3)
 */

// Offset de Brasília em minutos (-3 horas = -180 minutos)
const BRASILIA_OFFSET = -180

/**
 * Retorna a data/hora atual no fuso de Brasília
 */
export function getBrasiliaDate(): Date {
  const now = new Date()
  // Calcula a diferença entre UTC e Brasília
  const utcOffset = now.getTimezoneOffset() // minutos do dispositivo para UTC
  const brasiliaOffset = BRASILIA_OFFSET // minutos de Brasília para UTC
  const diff = utcOffset - brasiliaOffset // diferença em minutos
  
  // Se o dispositivo já estiver em Brasília, diff será 0
  // Caso contrário, ajusta para Brasília
  return new Date(now.getTime() + diff * 60 * 1000)
}

/**
 * Retorna a data atual no formato YYYY-MM-DD (Brasília)
 */
export function getTodayDateString(): string {
  const date = getBrasiliaDate()
  return formatDateString(date)
}

/**
 * Formata uma data para YYYY-MM-DD usando data local
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Retorna a hora atual no formato HH:MM:SS (Brasília)
 */
export function getCurrentTimeString(): string {
  const date = getBrasiliaDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

/**
 * Retorna a hora atual (0-23) em Brasília
 */
export function getCurrentHour(): number {
  return getBrasiliaDate().getHours()
}

/**
 * Retorna o dia da semana (0=Dom, 1=Seg, ..., 6=Sáb) em Brasília
 */
export function getCurrentDayOfWeek(): number {
  return getBrasiliaDate().getDay()
}

/**
 * Retorna a saudação baseada no horário de Brasília
 */
export function getGreeting(): { greeting: string; period: 'morning' | 'afternoon' | 'evening' } {
  const hour = getCurrentHour()

  if (hour >= 5 && hour < 12) {
    return { greeting: 'Bom dia', period: 'morning' }
  } else if (hour >= 12 && hour < 18) {
    return { greeting: 'Boa tarde', period: 'afternoon' }
  } else {
    return { greeting: 'Boa noite', period: 'evening' }
  }
}

/**
 * Determina o tipo de refeição baseado no horário de Brasília
 */
export function getMealTypeByTime(): 'cafe' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia' {
  const hour = getCurrentHour()

  if (hour < 10) return 'cafe'
  if (hour < 12) return 'lanche_manha'
  if (hour < 15) return 'almoco'
  if (hour < 18) return 'lanche_tarde'
  if (hour < 21) return 'jantar'
  return 'ceia'
}

/**
 * Retorna os últimos N dias incluindo hoje
 */
export function getLastNDays(n: number): { date: Date; dateString: string; dayName: string; dayNumber: number; isToday: boolean }[] {
  const today = getBrasiliaDate()
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const todayString = formatDateString(today)
  
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (n - 1 - i))
    const dateString = formatDateString(date)
    
    return {
      date,
      dateString,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      isToday: dateString === todayString,
    }
  })
}

/**
 * Retorna os últimos 7 dias (uma semana)
 */
export function getWeekDays() {
  return getLastNDays(7)
}

/**
 * Verifica se uma data é hoje (Brasília)
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString()
}

/**
 * Retorna a diferença em dias entre duas datas
 */
export function daysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formata uma data para exibição amigável
 */
export function formatDisplayDate(dateString: string): string {
  const today = getTodayDateString()
  
  if (dateString === today) {
    return 'Hoje'
  }
  
  const date = new Date(dateString + 'T12:00:00') // Adiciona hora para evitar problemas de timezone
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return date.toLocaleDateString('pt-BR', options)
}

