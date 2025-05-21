import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

type LogoProps = {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
};

export default function Logo({ size = 'medium', withText = true }: LogoProps) {
  const logoSize = size === 'small' ? 60 : size === 'medium' ? 80 : 100;

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo-faxinex.png')}
        style={{ width: logoSize, height: logoSize }}
        resizeMode="contain"
      />
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