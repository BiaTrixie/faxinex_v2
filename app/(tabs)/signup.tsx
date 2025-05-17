import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import  app  from '@/FirebaseConfig'
import Logo from '@/components/Logo';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import SocialButton from '@/components/SocialButton';
import Colors from '@/constants/Colors';
import * as Google from 'expo-auth-session/providers/google';
import Toast from 'react-native-toast-message';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '508822075025-1470e41opqpq53bdlrotid69fvnmeh02.apps.googleusercontent.com',
    androidClientId: '508822075025-0ho5nq8vqbbb83is28lfk93ff8badtv3.apps.googleusercontent.com',
    webClientId: '508822075025-0ho5nq8vqbbb83is28lfk93ff8badtv3.apps.googleusercontent.com'
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignUp(id_token);
    }
  }, [response]);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (validate()) {
      setIsLoading(true);
      try {
        const auth = getAuth(app);
        const db = getFirestore(app);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, { displayName: name });

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          isAdmin: false,
          createdAt: new Date(),
        });

        setIsLoading(false);
        Toast.show({
        type: 'success',
        text1: 'Cadastro criado com sucesso!',
      });
        router.push('/login');
      } catch (error: any) {
        setIsLoading(false);
        let message = 'Erro ao criar conta.';
        if (error.code === 'auth/email-already-in-use') {
          message = 'Este email já está em uso.';
        } else if (error.code === 'auth/invalid-email') {
          message = 'Email inválido.';
        } else if (error.code === 'auth/weak-password') {
          message = 'Senha muito fraca.';
        }
       Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: message,
      });
      }
    }
  };

  const handleGoogleSignUp = async (idToken?: string) => {
    if (!idToken) {
      Alert.alert('Erro', 'Não foi possível autenticar com o Google.');
      return;
    }
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      const db = getFirestore(app);
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

      // Salva no Firestore se for novo usuário
      const userDoc = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDoc, {
        name: userCredential.user.displayName,
        email: userCredential.user.email,
        isAdmin: false,
        createdAt: new Date(),
      }, { merge: true });

      setIsLoading(false);
      Alert.alert('Sucesso', 'Cadastro/login com Google realizado!');
      router.push('/login');
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível autenticar com o Google.');
    }
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size="medium" withText={false} />
            <Text style={styles.title}>SEJA BEM VINDO</Text>
            <Text style={styles.subtitle}>VAMOS COMEÇAR!</Text>
          </View>
          
          <View style={styles.form}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome"
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
            
            <Button
              title="CRIAR CONTA"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.signUpButton}
            />
            
            <Text style={styles.orText}>OU REGISTRE-SE COM</Text>
            
            <View style={styles.socialButtonsContainer}>
              <SocialButton provider="google" onPress={() => promptAsync()} />
            </View>
            
            <TouchableOpacity onPress={goToLogin} style={styles.loginLink}>
              <Text style={styles.loginText}>
                JÁ TEM UMA CONTA? <Text style={styles.loginLinkText}>ENTRE</Text>
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