/**
 * Utilitários de data para o Mimoo
 * Todas as funções usam o fuso horário de Brasília (UTC-3)
 */

/**
 * Retorna a data/hora atual no fuso de Brasília (UTC-3)
 * Usa Intl.DateTimeFormat para garantir precisão em qualquer dispositivo
 */
export function getBrasiliaDate(): Date {
  const now = new Date()
  
  // Usa Intl.DateTimeFormat para obter os componentes no fuso de Brasília
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  
  const parts = formatter.formatToParts(now)
  
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026')
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1 // JavaScript months are 0-indexed
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1')
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0')
  
  // Cria uma nova data com os componentes de Brasília
  // Isso "engana" o JavaScript para usar esses valores como se fossem locais
  const brasiliaDate = new Date(year, month, day, hour, minute, second)
  
  console.log(`🕐 Hora Brasília: ${day}/${month + 1}/${year} ${hour}:${minute}:${second}`)
  
  return brasiliaDate
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
 * Calcula cada dia individualmente para evitar problemas de timezone
 */
export function getLastNDays(n: number): { date: Date; dateString: string; dayName: string; dayNumber: number; isToday: boolean }[] {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const todayString = getTodayDateString()
  
  return Array.from({ length: n }, (_, i) => {
    // Calcula quantos dias atrás (i=0 é n-1 dias atrás, i=n-1 é hoje)
    const daysAgo = n - 1 - i
    
    // Pega a data de hoje em Brasília e subtrai os dias
    const brasiliaNow = getBrasiliaDate()
    const targetDate = new Date(brasiliaNow.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    const dateString = formatDateString(targetDate)
    
    // O dia da semana deve ser calculado baseado na data string para evitar problemas de timezone
    const dayOfWeek = targetDate.getDay()
    
    console.log(`📅 Dia ${i}: ${dateString} (${dayNames[dayOfWeek]}) - daysAgo: ${daysAgo} - isToday: ${dateString === todayString}`)
    
    return {
      date: targetDate,
      dateString,
      dayName: dayNames[dayOfWeek],
      dayNumber: targetDate.getDate(),
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

