import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Animated, 
  PanResponder,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import Logo from '@/components/Logo';
import NavigationArrow from '@/components/NavigationArrow';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

export default function WelcomeScreen() {
  const router = useRouter();
  const position = new Animated.ValueXY();
  
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) { // Only allow left swipe
          position.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -width, y: 0 },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            router.push('/signup');
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const goToSignUp = () => {
    Animated.timing(position, {
      toValue: { x: -width, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      router.push('/signup');
    });
  };

  const animatedStyle = {
    transform: position.getTranslateTransform(),
  };

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]} 
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={['#FFF', '#F0F4FF']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Logo size="large" />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>ESTÁ PRONTO PARA COMEÇAR?</Text>
              <Text style={styles.subtitle}>
                ORGANIZE A ROTINA DA CASA E{'\n'}
                TENHA MAIS TEMPO LIVRE!
              </Text>
            </View>
          </View>
          
          <NavigationArrow onPress={goToSignUp} />
        </SafeAreaView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 60,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.lightBlue1,
    textAlign: 'center',
    lineHeight: 24,
  },
});