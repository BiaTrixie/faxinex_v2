import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calendar, ListFilter } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';
import { Task } from '../home'; 

type ViewMode = 'daily' | 'weekly' | 'monthly';

const difficultyColors: Record<number, string[]> = {
  1: ['#73BFAA', '#73B2D9'],   // Fácil
  2: ['#FFB75E', '#ED8F03'],   // Média
  3: ['#FF512F', '#DD2476'],   // Difícil
};

const parseDifficulty = (value: string | number): number => {
  if (typeof value === 'number') return value;
  switch (value.toLowerCase()) {
    case 'facil': return 1;
    case 'media': return 2;
    case 'dificil': return 3;
    default: return 1;
  }
};

export default function TasksScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('https://backend-faxinex.vercel.app/tasks');
        const data = await response.json();
        const parsedTasks: Task[] = data.map((task: any) => ({
          ...task,
          difficulty: parseDifficulty(task.difficulty),
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Erro ao buscar tasks:', error);
        setTasks([]);
      }
    };

    fetchTasks();
  }, []);

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
      <TouchableOpacity onPress={() => { }}>
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
      <TouchableOpacity onPress={() => { }}>
        <ListFilter color={Colors.light.primary} size={24} />
      </TouchableOpacity>
    </View>
  );

  const TaskItem = ({ task }: { task: Task }) => {
    const getBackgroundColor = (difficulty: number) => {
      if (difficulty === 1) return 'green';
      if (difficulty === 2) return '#eead2d';
      return 'red';
    };

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/tasks/[id]', params: { id: task.idGroup } })}
        style={styles.taskItemContainer}
      >
        <View style={[styles.taskItem, { backgroundColor: getBackgroundColor(task.difficulty) }]}>
          <Text style={styles.taskTitle}>{task.taskName}</Text>
        </View>
      </TouchableOpacity>
    );
  };


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
            <TaskItem key={task.idGroup} task={task} />
          ))}

        </View>
      </ScrollView>
      <BottomBar />
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
