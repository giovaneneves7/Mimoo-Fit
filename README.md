# Mimoo Native 🐰

Versão nativa do Mimoo usando React Native + Expo.

## Funcionalidades

- 📸 **Scanner de Refeições** - Tire uma foto e o Mimoo analisa as calorias
- 💧 **Hidratação** - Rastreamento de água com lembretes
- 🎯 **Metas** - Acompanhe seu progresso
- 🔔 **Notificações** - Lembretes carinhosos do Mimoo
- 👤 **Perfil** - Personalize sua experiência

## Instalação

```bash
# Instalar dependências
npm install

# Rodar no iOS
npm run ios

# Rodar no Android
npm run android

# Rodar na web
npm run web
```

## Configuração

1. Crie um arquivo `.env` na raiz:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
EXPO_PUBLIC_OPENAI_API_KEY=sua_chave_openai
```

2. Configure o Supabase:
   - Crie as tabelas: `users`, `meals`, `daily_progress`, `hydration_logs`
   - Configure o bucket de storage `avatars`
   - Ative autenticação por email

## Estrutura

```
app/
├── (auth)/          # Telas de login/cadastro
├── (app)/           # Telas principais (Dashboard, Scanner, Perfil)
├── onboarding/      # Fluxo de onboarding
├── _layout.tsx      # Layout raiz
└── index.tsx        # Splash/redirecionamento

lib/
├── supabase.ts      # Cliente e funções do Supabase
├── openai.ts        # Integração com OpenAI Vision
└── notifications.ts # Sistema de notificações

contexts/
├── AuthContext.tsx      # Autenticação
└── OnboardingContext.tsx # Estado do onboarding
```

## Build para produção

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## Tecnologias

- React Native + Expo SDK 52
- NativeWind (Tailwind para RN)
- Expo Router (navegação)
- Supabase (backend)
- OpenAI Vision API (análise de imagens)
- expo-camera, expo-notifications, expo-image-picker

---

Feito com 💚 pelo Mimoo Team

