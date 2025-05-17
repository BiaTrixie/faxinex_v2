import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Plus } from 'lucide-react-native';

interface ProjectCardProps {
  title?: string;
  completedTasks?: number;
  totalTasks?: number;
  progress?: number;
  empty?: boolean;
  groupId?: string | null;
  onAddGroup?: () => void;
}

export default function ProjectCard({ 
  title, 
  completedTasks, 
  totalTasks, 
  progress, 
  empty = false,
  groupId,
  onAddGroup,
}: ProjectCardProps) {
  // Se groupId for vazio ou nulo, mostra mensagem e botão de adicionar grupo
  if (!groupId) {
    return (
      <LinearGradient
        colors={[Colors.light.lightBlue1, Colors.light.lightBlue2]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>Você ainda não participa de um grupo</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddGroup}>
            <Plus color="#FFF" size={24} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.light.lightBlue1, Colors.light.lightBlue2]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {empty ? (
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>Você ainda não tem projetos</Text>
          <Text style={styles.emptySubtitle}>Clique aqui para adicionar</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.stats}>
              {completedTasks}/{totalTasks}
            </Text>
            <Text style={styles.progress}>{progress}%</Text>
          </View>
        </View>
      )}
    </LinearGradient>
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
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 10,
  },
});