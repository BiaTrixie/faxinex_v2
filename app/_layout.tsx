import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'

// Componente para gerenciar a navegação baseada na autenticação
function AuthNavigator() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthFlow = segments[0] === '(tabs)' && ['signup', 'login', 'index'].includes(segments[1] as string);
    const inAppFlow = segments[0] === '(tabs)' && !['signup', 'login', 'index'].includes(segments[1] as string);

    console.log('AuthNavigator - isSignedIn:', isSignedIn, 'segments:', segments, 'inAuthFlow:', inAuthFlow, 'inAppFlow:', inAppFlow);

    if (isSignedIn && inAuthFlow) {
      // Usuário está logado mas ainda na tela de auth, redirecionar para home
      console.log('Redirecionando usuário logado para /home');
      router.replace('/home');
    } else if (!isSignedIn && inAppFlow) {
      // Usuário não está logado mas está tentando acessar área protegida
      console.log('Redirecionando usuário não logado para /');
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env')
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ThemeProvider>
        <>
          <AuthNavigator />
          <StatusBar style="auto" />
          <Toast />
        </>
      </ThemeProvider>
    </ClerkProvider>
  );
}