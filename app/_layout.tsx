import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../contexts/AuthContext'
import { OnboardingProvider } from '../contexts/OnboardingContext'
import '../global.css'

export default function RootLayout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
      </OnboardingProvider>
    </AuthProvider>
  )
}
