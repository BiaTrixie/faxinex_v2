// components/ProjectCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { Plus } from 'lucide-react-native';
import { Svg, Circle } from 'react-native-svg';

interface ProjectCardProps {
  groupId?: string | null;
  groupName?: string | null;
  completedTasks?: number;
  totalTasks?: number;
  userCompletedTasks?: number;
  userTotalTasks?: number;
  onShowGroupOptions?: () => void;
}

export default function ProjectCard({
  groupId,
  groupName,
  completedTasks = 0,
  totalTasks = 0,
  userCompletedTasks = 0,
  userTotalTasks = 0,
  onShowGroupOptions,
}: ProjectCardProps) {
  const router = useRouter();
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handlePress = () => {
    if (!groupId || groupId === '') {
      onShowGroupOptions?.();
    } else {
      // Redirecionar para a tela de configurações do grupo
      router.push(`/groups/settings?id=${groupId}`);
    }
  };

  if (!groupId || groupId === '') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={[Colors.light.lightBlue1, Colors.light.lightBlue2]}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.emptyContent}>
            <Text style={styles.emptyTitle}>Você ainda não participa de um grupo</Text>
            <Text style={styles.emptySubtitle}>Clique para criar ou entrar em um grupo</Text>
            <View style={styles.addButton}>
              <Plus color="#FFF" size={24} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const radius = 25;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const progressStroke = circumference - (percentage / 100) * circumference;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <LinearGradient
        colors={[Colors.light.lightBlue1, Colors.light.lightBlue2]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>{groupName || 'Meu Grupo'}</Text>

        <View style={styles.metricsRow}>
          <View>
            <Text style={styles.metricLabel}>Suas tarefas</Text>
            <Text style={styles.metricValue}>
              {userCompletedTasks}/{userTotalTasks}
            </Text>
          </View>

          <View>
            <Text style={styles.metricLabel}>Todas tarefas</Text>
            <Text style={styles.metricValue}>
              {completedTasks}/{totalTasks}
            </Text>
          </View>

          <View style={styles.progressCircle}>
            <Svg width={60} height={60}>
              <Circle
                cx="30"
                cy="30"
                r={radius}
                stroke="#D1D8FF"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx="30"
                cy="30"
                stroke="#5E7CE2"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference}, ${circumference}`}
                strokeDashoffset={progressStroke}
                strokeLinecap="round"
                rotation="-90"
                origin="30,30"
              />
            </Svg>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>{percentage}%</Text>
            </View>
          </View>
        </View>

        <Text style={styles.hint}>Toque para configurar o grupo</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    minHeight: 120,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metricLabel: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  progressCircle: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hint: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 10,
  },
});