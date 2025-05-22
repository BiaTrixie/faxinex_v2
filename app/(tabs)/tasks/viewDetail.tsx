import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Clock, Users, Calendar, ListFilter, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'list';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  progress: number;
  dueDate: string;
  assignees: string[];
}

export default function ViewTaskScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dummyTask: Task = {
    id: '1',
    title: 'LIMPAR SALA',
    description: 'Limpar e organizar a sala, incluindo varrer, tirar o pó e organizar os móveis.',
    priority: 'medium',
    progress: 60,
    dueDate: '2024-03-15',
    assignees: ['RONALDO', 'MARIA', 'JOÃO'],
  };

  const ViewModeSelector = () => (
    <View style={styles.viewModeContainer}>
      {(['daily', 'weekly', 'monthly', 'list'] as ViewMode[]).map((mode) => (
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

  const TaskProgress = ({ progress }: { progress: number }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress}% completo</Text>
    </View>
  );

  const AssigneesList = ({ assignees }: { assignees: string[] }) => (
    <View style={styles.assigneesContainer}>
      {assignees.map((assignee, index) => (
        <View key={index} style={styles.assigneeItem}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
            style={styles.assigneeAvatar}
          />
          <Text style={styles.assigneeName}>{assignee}</Text>
        </View>
      ))}
    </View>
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

        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>{dummyTask.title}</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Clock color={Colors.light.primary} size={20} />
              <Text style={styles.infoText}>Prazo: {dummyTask.dueDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Users color={Colors.light.primary} size={20} />
              <Text style={styles.infoText}>{dummyTask.assignees.length} participantes</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{dummyTask.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progresso</Text>
            <TaskProgress progress={dummyTask.progress} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participantes</Text>
            <AssigneesList assignees={dummyTask.assignees} />
          </View>

          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => {}}
          >
            <CheckCircle2 color="#FFF" size={20} />
            <Text style={styles.completeButtonText}>MARCAR COMO CONCLUÍDA</Text>
          </TouchableOpacity>
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
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  assigneesContainer: {
    gap: 10,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  assigneeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  assigneeName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});