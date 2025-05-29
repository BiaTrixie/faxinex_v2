import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Plus } from 'lucide-react-native';

interface ProjectCardProps {
  groupId?: string | null;
  groupName?: string | null;
  completedTasks?: number;
  totalTasks?: number;
  progress?: number;
  empty?: boolean;
  groupId?: string | null;
  onShowGroupOptions?: () => void; // Mudança: agora chama o modal de opções
}

export default function ProjectCard({ 
  groupId,
  onShowGroupOptions, // Mudança: novo nome da prop
}: ProjectCardProps) {
  if (!groupId) {
    return (
      <TouchableOpacity onPress={onShowGroupOptions} activeOpacity={0.8}>
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

  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={[Colors.light.lightBlue1, Colors.light.lightBlue2]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{groupName || 'Meu Grupo'}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.stats}>
              Tarefas: {completedTasks}/{totalTasks}
            </Text>
            <Text style={styles.progress}>
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </Text>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    color: '#FFF',
    fontSize: 16,
  },
  progress: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 10,
  },
});