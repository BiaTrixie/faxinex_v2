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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validate()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        router.push('/home');
      }, 1500);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login
    console.log('Google login');
  };

  const handleAppleLogin = () => {
    // Implement Apple login
    console.log('Apple login');
  };

  const goToSignUp = () => {
    router.push('/signup');
  };

  const forgotPassword = () => {
    // Implement forgot password
    console.log('Forgot password');
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
            
            <TouchableOpacity 
              onPress={forgotPassword} 
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>ESQUECI A SENHA</Text>
            </TouchableOpacity>
            
            <Button
              title="ENTRAR"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />
            
            <Text style={styles.orText}>OU ENTRE COM</Text>
            
            <View style={styles.socialButtonsContainer}>
              <SocialButton provider="google" onPress={handleGoogleLogin} />
              <SocialButton provider="apple" onPress={handleAppleLogin} />
            </View>
            
            <TouchableOpacity onPress={goToSignUp} style={styles.signupLink}>
              <Text style={styles.signupText}>
                NÃO TEM UMA CONTA? <Text style={styles.signupLinkText}>REGISTE-SE</Text>
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
    justifyContent: 'space-between',
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