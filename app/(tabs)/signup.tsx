import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import { signInWithCustomToken, updateProfile } from 'firebase/auth';
import Toast from 'react-native-toast-message';

import Logo from '@/components/Logo';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { auth, firestore } from '@/FirebaseConfig';
import CodePrompt from '@/components/CodePrompt';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, setActive } = useSignUp();
  const { getToken, signOut, isSignedIn } = useAuth(); 

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCodePrompt, setShowCodePrompt] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isSignedIn) {
      console.log('Usuário já está logado, redirecionando para /home');
      router.replace('/home');
    }
  }, [isSignedIn]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';
    if (!password.trim()) newErrors.password = 'Senha é obrigatória';
    else if (password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUserInFirestore = async (userId: string, userData: any) => {
    try {
      await setDoc(doc(firestore, 'Users', userId), {
        id: userId,
        name: userData.name,
        email: userData.email,
        group_id: '',
        image: userData.image || 'https://i.postimg.cc/TPwPZK8R/renderizacao-3d-de-retrato-de-cao-de-desenho-animado.jpg',
        isAdmin: false,
        createdAt: new Date(),
        points: 0,
      });
      console.log('Documento do usuário criado no Firestore');
    } catch (error) {
      console.error('Erro ao criar documento do usuário:', error);
      throw error;
    }
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      // Limpar sessão anterior
      await signOut();

      console.log('Tentando criar conta...');
      await signUp?.create({
        emailAddress: email,
        password,
        username: name, 
      });

      await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });

      setShowCodePrompt(true);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      console.error('Erro no signup:', err);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: err.errors?.[0]?.message || err.message || 'Erro ao criar conta.',
      });
    }
  };

  const handleCodeSubmit = async (code: string) => {
    setIsLoading(true);
    try {
      console.log('Verificando código...');
      const result = await signUp?.attemptEmailAddressVerification({ code });

      if (result?.status === 'complete') {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
        }

        const token = await getToken({ template: 'integration_firebase' });
        if (!token) throw new Error('Não foi possível obter o token de autenticação.');

        const userCredential = await signInWithCustomToken(auth, token);

        await updateProfile(userCredential.user, { displayName: name });

        // Criar documento do usuário no Firestore
        await createUserInFirestore(userCredential.user.uid, {
          name,
          email,
          image: imageUrl.trim() || 'https://i.postimg.cc/TPwPZK8R/renderizacao-3d-de-retrato-de-cao-de-desenho-animado.jpg',
        });

        setShowCodePrompt(false);
        
        console.log('Conta criada com sucesso, redirecionando para /home');
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Conta criada com sucesso!',
        });

        // Aguardar um pouco antes de redirecionar para garantir que o estado seja atualizado
        setTimeout(() => {
          router.replace('/home');
        }, 500);
      } else {
        throw new Error('Verificação incompleta. Código inválido?');
      }
    } catch (err: any) {
      console.error('Erro na verificação:', err);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: err.errors?.[0]?.message || err.message || 'Falha na verificação.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCode = () => {
    setShowCodePrompt(false);
    setIsLoading(false);
  };

  const goToLogin = () => {
    router.push('/login');
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
            <Text style={styles.title}>CRIAR CONTA</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Primeiro Nome"
              error={errors.name}
              autoCapitalize="words"
            />
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
            <Button title="REGISTRAR" onPress={handleSignUp} loading={isLoading} style={styles.signUpButton} />
            <TouchableOpacity onPress={goToLogin} style={styles.loginLink}>
              <Text style={styles.loginText}>
                JÁ TEM UMA CONTA? <Text style={styles.loginLinkText}>ENTRE</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CodePrompt
        visible={showCodePrompt}
        onSubmit={handleCodeSubmit}
        onCancel={handleCancelCode}
      />
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
  subtitle: {
    fontSize: 16,
    color: Colors.light.lightBlue1,
    marginTop: 5,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
  },
  signUpButton: {
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
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#888',
  },
  loginLinkText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
});