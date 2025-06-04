import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn, useAuth, useOAuth } from '@clerk/clerk-expo';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';

import Logo from '@/components/Logo';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import SocialButton from '@/components/SocialButton';
import Colors from '@/constants/Colors';
import { auth, firestore } from '@/FirebaseConfig';

if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

const useWarmUpBrowser = () => {
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      };
    }
  }, []);
};

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const { signIn, setActive } = useSignIn();
  const { getToken, signOut, isSignedIn } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isSignedIn) {
      console.log('Usuário já está logado, redirecionando para /home');
      router.replace('/home');
    }
  }, [isSignedIn]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    if (!password.trim()) newErrors.password = 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const syncUserDataToFirestore = async (userId: string, userData: any) => {
    try {
      const userDocRef = doc(firestore, 'Users', userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Criar documento do usuário se não existir
        await setDoc(userDocRef, {
          id: userId,
          name: userData.name || userData.firstName || 'Usuário',
          email: userData.email || userData.primaryEmailAddress?.emailAddress || '',
          group_id: '',
          image: userData.imageUrl || 'https://i.postimg.cc/TPwPZK8R/renderizacao-3d-de-retrato-de-cao-de-desenho-animado.jpg',
          isAdmin: false,
          createdAt: new Date(),
          points: 0,
        });
        console.log('Documento do usuário criado no Firestore');
      } else {
        console.log('Documento do usuário já existe no Firestore');
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados do usuário:', error);
    }
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      // Limpar sessão anterior
      await signOut();

      console.log('Tentando fazer login com email e senha...');
      const signInAttempt = await signIn?.create({
        identifier: email,
        password,
      });

      if (signInAttempt?.status === 'complete') {
        if (setActive) {
          await setActive({ session: signInAttempt.createdSessionId });
        }

        const token = await getToken({ template: 'integration_firebase' });
        if (!token) throw new Error('Não foi possível obter o token de autenticação.');

        await signInWithCustomToken(auth, token);

        // Sincronizar dados do usuário com Firestore
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await syncUserDataToFirestore(firebaseUser.uid, {
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            imageUrl: firebaseUser.photoURL,
          });
        }

        console.log('Login realizado com sucesso, redirecionando para /home');
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Login realizado com sucesso!',
        });

        // Aguardar um pouco antes de redirecionar para garantir que o estado seja atualizado
        setTimeout(() => {
          router.replace('/home');
        }, 500);
      } else {
        throw new Error('Login incompleto. Verifique seu e-mail ou tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: err.errors?.[0]?.message || err.message || 'Erro ao fazer login.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Limpar sessão anterior
      await signOut();

      console.log('Tentando fazer login com Google...');
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });
        }

        const token = await getToken({ template: 'integration_firebase' });
        if (!token) throw new Error('Não foi possível obter o token de autenticação.');

        await signInWithCustomToken(auth, token);

        // Sincronizar dados do usuário com Firestore
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await syncUserDataToFirestore(firebaseUser.uid, {
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            imageUrl: firebaseUser.photoURL,
          });
        }

        console.log('Login com Google realizado com sucesso, redirecionando para /home');
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Login realizado com sucesso!',
        });

        // Aguardar um pouco antes de redirecionar para garantir que o estado seja atualizado
        setTimeout(() => {
          router.replace('/home');
        }, 500);
      } else {
        throw new Error('Falha ao completar o processo de autenticação.');
      }
    } catch (err: any) {
      console.error('Erro no login com Google:', err);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: err.errors?.[0]?.message || err.message || 'Erro ao fazer login com Google.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToSignUp = () => {
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Logo size="medium" withText={false} />
            <Text style={styles.title}>BEM VINDO DE VOLTA!</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              error={errors.email}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              secureTextEntry
              error={errors.password}
            />
            <Button title="ENTRAR" onPress={handleLogin} loading={isLoading} style={styles.loginButton} />
            <Text style={styles.orText}>OU ENTRE COM</Text>
            <View style={styles.socialButtonsContainer}>
              <SocialButton provider="google" onPress={handleGoogleLogin} />
            </View>
            <TouchableOpacity onPress={goToSignUp} style={styles.signupLink}>
              <Text style={styles.signupText}>
                NÃO TEM UMA CONTA? <Text style={styles.signupLinkText}>REGISTRE-SE</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#888',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#888',
  },
  signupLinkText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
});