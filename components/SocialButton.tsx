import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import Colors from '@/constants/Colors';

type SocialButtonProps = {
  provider: 'google' | 'apple';
  onPress: () => void;
};

export default function SocialButton({ provider, onPress }: SocialButtonProps) {
  const icon = provider === 'google' ? 
    'https://developers.google.com/identity/images/g-logo.png' : 
    'https://www.apple.com/v/apple-pay/i/images/overview/apple_pay_logo__cxllw07i8yc2_large_2x.png';
  
  const label = provider === 'google' ? 'GOOGLE' : 'APPLE';

  return (
    <TouchableOpacity 
      style={[styles.button, provider === 'apple' ? styles.appleButton : styles.googleButton]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        <Image 
          source={{ uri: icon }} 
          style={[styles.icon, provider === 'apple' ? styles.appleIcon : styles.googleIcon]} 
          resizeMode="contain"
        />
        <Text style={[styles.text, provider === 'apple' ? styles.appleText : styles.googleText]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    maxWidth: '45%',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  appleIcon: {
    width: 22,
    height: 22,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  googleText: {
    color: '#5F6368',
  },
  appleText: {
    color: '#000000',
  },
});