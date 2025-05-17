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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Logo from '@/components/Logo';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import SocialButton from '@/components/SocialButton';
import Colors from '@/constants/Colors';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSignUp = () => {
    if (validate()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        router.push('/');
      }, 1500);
    }
  };

  const handleGoogleSignUp = () => {
    // Implement Google sign up
    console.log('Google sign up');
  };

  const handleAppleSignUp = () => {
    // Implement Apple sign up
    console.log('Apple sign up');
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
              <SocialButton provider="google" onPress={handleGoogleSignUp} />
              <SocialButton provider="apple" onPress={handleAppleSignUp} />
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
    justifyContent: 'space-between',
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