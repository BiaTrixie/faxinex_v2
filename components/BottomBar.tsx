import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Trophy, Check  } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function BottomBar() {
const router = useRouter();

  const handleHome = () => {
    router.push('/home');
  };
  const handleRanking = () => {
    router.push('/ranking');
  };
  const handletasks = () => {
    router.push('/tasks/view');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.lightBlue1]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity style={styles.tab}>
          <Home color="#FFF" size={24} onPress={handleHome}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Check color="#FFF" size={24} onPress={handletasks}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Trophy color="#FFF" size={24} onPress={handleRanking}/>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});