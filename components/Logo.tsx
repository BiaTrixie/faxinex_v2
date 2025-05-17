import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

type LogoProps = {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
};

export default function Logo({ size = 'medium', withText = true }: LogoProps) {
  const logoSize = size === 'small' ? 60 : size === 'medium' ? 80 : 100;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.lightBlue2, Colors.light.lightGreen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
        <View style={styles.house}>
          <View style={styles.roof} />
          <View style={styles.body} />
        </View>
      </LinearGradient>
      {withText && (
        <Text style={styles.logoText}>FAXINEX</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  house: {
    alignItems: 'center',
  },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  body: {
    width: 30,
    height: 24,
    backgroundColor: 'white',
    borderRadius: 4,
    marginTop: -2,
  },
  logoText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5E75F2',
  },
});