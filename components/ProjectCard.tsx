import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface ProjectCardProps {
  title?: string;
  completedTasks?: number;
  totalTasks?: number;
  progress?: number;
  empty?: boolean;
}

export default function ProjectCard({ 
  title, 
  completedTasks, 
  totalTasks, 
  progress, 
  empty = false 
}: ProjectCardProps) {
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
    marginBottom: 5,
  },
  emptySubtitle: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
});