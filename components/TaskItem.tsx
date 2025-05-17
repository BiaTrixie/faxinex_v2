import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type TaskDifficulty = 'easy' | 'medium' | 'hard';

interface TaskItemProps {
  title: string;
  difficulty: TaskDifficulty;
  onPress: () => void;
}

const difficultyColors = {
  easy: ['#73BFAA', '#73B2D9'],
  medium: ['#FFB75E', '#ED8F03'],
  hard: ['#FF512F', '#DD2476'],
};

export default function TaskItem({ title, difficulty, onPress }: TaskItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <LinearGradient
        colors={difficultyColors[difficulty]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.title}>{title}</Text>
        <ChevronRight color="#FFF" size={20} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});