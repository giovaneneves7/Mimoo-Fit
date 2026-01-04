import React, { useEffect, useRef } from 'react'
import { Image, View, Animated, Easing } from 'react-native'

// Imagens do Mimoo
const mimooImages = {
  default: require('../assets/images/mimoo-icon.png'),
  camera: require('../assets/images/mimoo-camera.png'),
  salad: require('../assets/images/mimoo-salad.png'),
  exercise: require('../assets/images/mimoo-exercise.png'),
  icon: require('../assets/images/mimoo-icon.png'),
}

type MimooVariant = keyof typeof mimooImages
type AnimationType = 'none' | 'bounce' | 'float' | 'sniff' | 'wiggle' | 'pulse'

interface MimooImageProps {
  variant?: MimooVariant
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  animation?: AnimationType
  className?: string
}

const sizeMap = {
  xs: 32,
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
}

export function MimooImage({ 
  variant = 'default', 
  size = 'md',
  animation = 'none'
}: MimooImageProps) {
  const dimensions = sizeMap[size]
  const source = mimooImages[variant] || mimooImages.default

  // Animated values
  const bounceAnim = useRef(new Animated.Value(0)).current
  const floatAnim = useRef(new Animated.Value(0)).current
  const sniffAnim = useRef(new Animated.Value(0)).current
  const wiggleAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (animation === 'bounce') {
      // Animação de bounce suave (como animate-bounce-soft)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start()
    }

    if (animation === 'float') {
      // Animação de float (flutuando)
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -8,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start()
    }

    if (animation === 'sniff') {
      // Animação de "farejando" - igual ao web
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(sniffAnim, {
              toValue: -5,
              duration: 375,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 375,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(sniffAnim, {
              toValue: 0,
              duration: 375,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 375,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(sniffAnim, {
              toValue: -3,
              duration: 375,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.02,
              duration: 375,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(sniffAnim, {
              toValue: 0,
              duration: 375,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 375,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start()
    }

    if (animation === 'wiggle') {
      // Animação de wiggle (balançando)
      Animated.loop(
        Animated.sequence([
          Animated.timing(wiggleAnim, {
            toValue: 1,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: -1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wiggleAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start()
    }

    if (animation === 'pulse') {
      // Animação de pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start()
    }
  }, [animation])

  // Determina o transform baseado na animação
  const getTransformStyle = () => {
    switch (animation) {
      case 'bounce':
        return { transform: [{ translateY: bounceAnim }] }
      case 'float':
        return { transform: [{ translateY: floatAnim }] }
      case 'sniff':
        return { 
          transform: [
            { translateY: sniffAnim },
            { scale: scaleAnim }
          ] 
        }
      case 'wiggle':
        return { 
          transform: [{ 
            rotate: wiggleAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ['-3deg', '0deg', '3deg']
            }) 
          }] 
        }
      case 'pulse':
        return { transform: [{ scale: pulseAnim }] }
      default:
        return {}
    }
  }

  return (
    <Animated.View style={[{ width: dimensions, height: dimensions }, getTransformStyle()]}>
      <Image
        source={source}
        style={{ 
          width: dimensions, 
          height: dimensions,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
        resizeMode="contain"
      />
    </Animated.View>
  )
}
