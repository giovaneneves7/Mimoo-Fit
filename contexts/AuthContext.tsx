import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, User, getCurrentUser } from '../lib/supabase'
import { Session, AuthError } from '@supabase/supabase-js'

export interface UserProfile extends Omit<User, 'created_at' | 'updated_at'> {
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  session: Session | null
  user: Session['user'] | null
  profile: UserProfile | null
  loading: boolean
  hasCompletedOnboarding: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; hasProfile: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  // Busca o perfil do usuário
  const fetchProfile = async (authId?: string) => {
    try {
      let userId = authId
      
      if (!userId) {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        userId = currentSession?.user?.id
      }
      
      if (!userId) {
        setProfile(null)
        setHasCompletedOnboarding(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .single()

      if (error || !data) {
        console.log('Perfil não encontrado')
        setProfile(null)
        setHasCompletedOnboarding(false)
        return
      }

      setProfile(data as UserProfile)
      setHasCompletedOnboarding(true)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      setProfile(null)
      setHasCompletedOnboarding(false)
    }
  }

  // Inicialização
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (initialSession) {
          setSession(initialSession)
          await fetchProfile(initialSession.user.id)
        }
      } catch (error) {
        console.error('Erro na inicialização:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('🔐 Auth event:', event)
      
      if (!mounted) return

      setSession(newSession)

      if (event === 'SIGNED_IN' && newSession) {
        await fetchProfile(newSession.user.id)
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setHasCompletedOnboarding(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign Up
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  // Sign In
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      return { error, hasProfile: false }
    }

    if (data.user) {
      const { data: profileData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', data.user.id)
        .single()

      const hasProfile = !!profileData
      
      if (hasProfile) {
        await fetchProfile(data.user.id)
      }

      return { error: null, hasProfile }
    }

    return { error: null, hasProfile: false }
  }

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    setHasCompletedOnboarding(false)
  }

  // Refresh Profile
  const refreshProfile = async () => {
    await fetchProfile()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        profile,
        loading,
        hasCompletedOnboarding,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

