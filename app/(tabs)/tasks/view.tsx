import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calendar, ListFilter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';

type ViewMode = 'daily' | 'weekly' | 'monthly';
type TaskDifficulty = 'easy' | 'medium' | 'hard';

interface Task {
  id: string;
  title: string;
  difficulty: TaskDifficulty;
}

const difficultyColors = {
  easy: ['#73BFAA', '#73B2D9'],
  medium: ['#FFB75E', '#ED8F03'],
  hard: ['#FF512F', '#DD2476'],
};

export default function TasksScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const tasks: Task[] = [
    { id: '1', title: 'LIMPAR BANHEIRO', difficulty: 'hard' },
    { id: '2', title: 'LIMPAR SALA', difficulty: 'medium' },
    { id: '3', title: 'ORGANIZAR ARMÁRIO', difficulty: 'easy' },
    { id: '4', title: 'ORGANIZAR COZINHA', difficulty: 'medium' },
    { id: '5', title: 'LAVAR ESTEIRA', difficulty: 'hard' },
  ];

  const ViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
          onPress={() => setViewMode(mode)}
        >
          <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
            {mode.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const DateNavigator = () => (
    <View style={styles.dateNavigator}>
      <TouchableOpacity onPress={() => {}}>
        <Calendar color={Colors.light.primary} size={24} />
      </TouchableOpacity>
      <Text style={styles.currentDate}>
        {selectedDate.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Text>
      <TouchableOpacity onPress={() => {}}>
        <ListFilter color={Colors.light.primary} size={24} />
      </TouchableOpacity>
    </View>
  );

  const TaskItem = ({ task }: { task: Task }) => (
    <TouchableOpacity 
      onPress={() => router.push('/tasks/viewDetail')}
      style={styles.taskItemContainer}
    >
      <LinearGradient
        colors={difficultyColors[task.difficulty]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.taskItem}
      >
        <Text style={styles.taskTitle}>{task.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>TAREFAS</Text>
        <ViewModeSelector />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <DateNavigator />
        <View style={styles.taskList}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </View>
      </ScrollView>
      <BottomBar/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  viewModeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  viewModeButtonActive: {
    backgroundColor: '#FFF',
  },
  viewModeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: Colors.light.primary,
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#F8F9FA',
    marginBottom: 20,
  },
  currentDate: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  taskList: {
    paddingHorizontal: 20,
  },
  taskItemContainer: {
    marginBottom: 10,
  },
  taskItem: {
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});