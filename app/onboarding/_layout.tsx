import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="name" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="age" />
      <Stack.Screen name="height-weight" />
      <Stack.Screen name="target-weight" />
      <Stack.Screen name="activity" />
      <Stack.Screen name="speed" />
      <Stack.Screen name="barriers" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="results" />
    </Stack>
  )
}

