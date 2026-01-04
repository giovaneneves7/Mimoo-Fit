import React, { createContext, useContext, useState } from 'react'

export interface OnboardingData {
  // Dados básicos
  nome?: string
  email?: string
  genero?: 'feminino' | 'masculino'
  idade?: number
  altura?: number
  peso?: number
  peso_meta?: number
  
  // Objetivos e preferências
  objetivo?: 'perder_peso' | 'manter_peso' | 'ganhar_massa'
  nivel_atividade?: 'sedentario' | 'leve' | 'moderado' | 'muito'
  velocidade?: 'lento' | 'normal' | 'rapido'
  
  // Histórico
  historico_anos?: string
  tentativas_anteriores?: string
  barreiras?: string[]
  gatilho_emocional?: string
  proximo_nivel?: string
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (newData: Partial<OnboardingData>) => void
  clearData: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>({})

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }))
  }

  const clearData = () => {
    setData({})
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData, clearData }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}


