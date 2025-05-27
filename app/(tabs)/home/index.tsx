import BottomBar from '@/components/BottomBar';
import Button from '@/components/Button';
import ProjectCard from '@/components/ProjectCard';
import Colors from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { auth, firestore } from '@/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Task {
  id: string,
  taskName: string;
  difficulty: number; // alguns são strings, outros são números
  participants: string[];
  category: string;
  idGroup: string;
  status: 'Pendente' | 'Finalizada' | string;
}


export default function HomeScreen() {
  const { theme, colors } = useTheme();
  const [userName, setUserName] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'todas' | 'Pendente' | 'Finalizada'>('todas');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      const authentication = auth;
      const user = authentication.currentUser;
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || user.email || 'Usuário não encontrado');
        const db = firestore;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setGroupId(data.group_id ?? null);
          setUserPhoto(
            data.image ||
            user.photoURL ||
            'https://i.postimg.cc/3rmYdXYy/estilo-de-fantasia-de-cao-adoravel.jpg'
          );
         
          if (data.group_id) {
            const groupDoc = await getDoc(doc(db, 'groups', data.group_id));
            if (groupDoc.exists()) {
              setGroupName(groupDoc.data().name);
            }
          }
        } else {
          setGroupId(null);
          setUserPhoto(
            user.photoURL ||
            'https://i.postimg.cc/3rmYdXYy/estilo-de-fantasia-de-cao-adoravel.jpg'
          );
        }
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await fetch('https://backend-faxinex.vercel.app/tasks'); 
        const task = await response.json();
        console.log(task);
        setTasks(task);
      } catch (error) {
        console.error('Erro ao buscar tasks:', error);
        setTasks([]);
      }
    };

    fetchUserData();
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (selectedTab === 'todas') return true;
    if (selectedTab === 'Pendente') return task.status === 'Pendente';
    if (selectedTab === 'Finalizada') return task.status === 'Finalizada';
    return true;
  });

  const nomeDificuldade = (id:number) => {
    if(id === 1){
      return "Fácil"
    }
    else if(id === 2){
      return "Média"
    }
    else {
      return "Difícil"
    }
  }

  const userTasks = tasks.filter(
    (task) =>
      groupId &&
      task.idGroup === groupId &&
      userId &&
      task.participants.includes(userId)
  );
  const completedUserTasks = userTasks.filter(
    (task) => task.status === 'Finalizada'
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user?.imageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
            style={styles.avatar}
          />
          <Text style={[styles.userName, { color: colors.text }]}>{user?.firstName || user?.username ||  'Usuário'}</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <Settings color={colors.icon} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {groupId ? (
          <View style={{ marginHorizontal: 20, marginVertical: 10, padding: 20, borderRadius: 15, backgroundColor: colors.primary }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{groupName || 'Grupo'}</Text>
            <Text style={{ color: '#fff', fontSize: 16, marginTop: 5 }}>
              Minhas tarefas: {completedUserTasks.length}/{userTasks.length}
            </Text>
          </View>
        ) : (
          <ProjectCard
            groupId={groupId}
            onAddGroup={() => router.push('/groups/create')}
          />
        )}

        <View style={styles.tasksContainer}>
          <Text style={[styles.tasksTitle, { color: colors.primary }]}>TAREFAS</Text>
          <View style={styles.menuBar}>
            <Button
              title="Todas"
              variant={selectedTab === 'todas' ? 'primary' : 'outline'}
              onPress={() => setSelectedTab('todas')}
              style={styles.menuButton}
              textStyle={styles.menuButtonText}
            />
            <Button
              title="Pendentes"
              variant={selectedTab === 'Pendente' ? 'primary' : 'outline'}
              onPress={() => setSelectedTab('Pendente')}
              style={styles.menuButton}
              textStyle={styles.menuButtonText}
            />
            <Button
              title="Finalizadas"
              variant={selectedTab === 'Finalizada' ? 'primary' : 'outline'}
              onPress={() => setSelectedTab('Finalizada')}
              style={styles.menuButton}
              textStyle={styles.menuButtonText}
            />
          </View>

          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <View
                key={index}
                style={{
                  marginBottom: 15,
                  padding: 15,
                  backgroundColor: task.difficulty === 1 ? 'green' : task.difficulty === 2 ? '#eead2d' : 'red',
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontWeight: 'bold', color: colors.text }}>{task.taskName}</Text>
                <Text style={{ color: colors.text, marginTop: 5 }}>
                  Dificuldade: {nomeDificuldade(task.difficulty)} | Status: {task.status === 'Pendente' ? 'Pendente' : 'Finalizada'}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.noTasksContainer}>
              <Text style={[styles.noTasksText, { color: colors.text }]}>Você ainda não tem tarefas criadas</Text>
              <Button
                title="Adicionar Tarefa"
                onPress={() => router.push('/tasks/create')}
                style={styles.addTaskButton}
              />
            </View>
          )}
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
    backgroundColor: Colors.light.primary,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  settingsButton: {
    marginLeft: 10,
    padding: 4,
  },
  content: {
    flex: 1,
    marginTop: 20,
    marginBottom: 70,
  },
  tasksContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 15,
  },
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
    alignItems: 'center',
  },
  menuButton: {
    flex: 1,
    marginHorizontal: 2,
    minWidth: 0,
    maxWidth: '33%',
  },
  menuButtonText: {
    flexShrink: 1,
    flexWrap: 'nowrap',
    textAlign: 'center',
    fontSize: 12,
    includeFontPadding: false,
  },
  noTasksContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  noTasksText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 20,
  },
  addTaskButton: {
    minWidth: 180,
  },
});