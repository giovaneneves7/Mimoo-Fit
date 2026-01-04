import React, { useEffect, useState, useRef } from 'react'
import { View, Text, Animated, Easing, Dimensions, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Cores do Mimoo
const defaultColors = [
  '#ff7a5c', // coral-500
  '#ffb4a2', // coral-300
  '#81a88d', // sage-500
  '#afc9b7', // sage-300
  '#f59e0b', // amber-500
  '#fcd34d', // amber-300
  '#fb923c', // orange
  '#86efac', // verde claro
]

interface Particle {
  id: number
  x: number
  delay: number
  duration: number
  color: string
  type: 'confetti' | 'leaf' | 'star' | 'heart'
  anim: Animated.Value
}

interface ConfettiProps {
  active: boolean
  duration?: number
  colors?: string[]
  particleCount?: number
}

function ConfettiParticle({ particle }: { particle: Particle }) {
  const translateY = particle.anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, SCREEN_HEIGHT * 0.25, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.75, SCREEN_HEIGHT],
  })

  const translateX = particle.anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 20, -10, 15, -5],
  })

  const rotate = particle.anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '90deg', '180deg', '270deg', '360deg'],
  })

  const opacity = particle.anim.interpolate({
    inputRange: [0, 0.5, 0.75, 1],
    outputRange: [1, 0.9, 0.7, 0],
  })

  const iconName = particle.type === 'leaf' ? 'leaf' : 
                   particle.type === 'star' ? 'star' : 
                   particle.type === 'heart' ? 'heart' : null

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${particle.x}%`,
        top: -20,
        transform: [{ translateY }, { translateX }, { rotate }],
        opacity,
      }}
    >
      {particle.type === 'confetti' ? (
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 2,
            backgroundColor: particle.color,
          }}
        />
      ) : (
        <Ionicons 
          name={iconName as any} 
          size={particle.type === 'star' ? 16 : 18} 
          color={particle.color} 
        />
      )}
    </Animated.View>
  )
}

export function Confetti({
  active,
  duration = 4000,
  colors = defaultColors,
  particleCount = 40
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (active) {
      const types: Particle['type'][] = ['confetti', 'leaf', 'star', 'heart']
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 800,
        duration: 2000 + Math.random() * 2000,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)],
        anim: new Animated.Value(0),
      }))

      setParticles(newParticles)
      setShow(true)

      // Inicia animações
      newParticles.forEach((particle) => {
        setTimeout(() => {
          Animated.timing(particle.anim, {
            toValue: 1,
            duration: particle.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start()
        }, particle.delay)
      })

      const timeout = setTimeout(() => {
        setShow(false)
        setParticles([])
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [active])

  if (!show) return null

  return (
    <View 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 100,
        pointerEvents: 'none'
      }}
    >
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} />
      ))}
    </View>
  )
}

// Componente de celebração completo com mensagem
interface CelebrationProps {
  active: boolean
  message?: string
  subMessage?: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export function Celebration({
  active,
  message = 'Parabéns!',
  subMessage = 'Você atingiu sua meta!',
  onClose,
  autoClose = true,
  duration = 4000
}: CelebrationProps) {
  const [show, setShow] = useState(false)
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const bounceAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (active) {
      setShow(true)

      // Animação de entrada
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Animação de bounce do ícone
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start()

      if (autoClose) {
        const timeout = setTimeout(() => {
          // Animação de saída
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShow(false)
            onClose?.()
          })
        }, duration - 200)

        return () => clearTimeout(timeout)
      }
    }
  }, [active])

  if (!show) return null

  return (
    <Modal visible={show} transparent animationType="none">
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
      }}>
        <Confetti active={active} duration={duration} />
        
        <Animated.View
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            padding: 32,
            marginHorizontal: 16,
            maxWidth: 320,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          <Animated.View 
            style={{ 
              marginBottom: 16,
              transform: [{ translateY: bounceAnim }],
            }}
          >
            <Ionicons name="trophy" size={60} color="#FFD700" />
          </Animated.View>
          
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            {message}
          </Text>
          
          <Text style={{ 
            fontSize: 16, 
            color: '#6b7280',
            textAlign: 'center',
          }}>
            {subMessage}
          </Text>

          <View style={{ 
            flexDirection: 'row', 
            gap: 8, 
            marginTop: 16 
          }}>
            <PulsingDot color="#ff7a5c" delay={0} />
            <PulsingDot color="#8db094" delay={200} />
            <PulsingDot color="#f59e0b" delay={400} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Dot pulsante
function PulsingDot({ color, delay }: { color: string; delay: number }) {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }, delay)
  }, [])

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        transform: [{ scale: pulseAnim }],
      }}
    />
  )
}
