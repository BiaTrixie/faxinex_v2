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
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import sendEmail from '@/services/SendEmail';

export interface Task {
  id: string,
  taskName: string;
  difficulty: number;
  participants: string[];
  category: string;
  idGroup: string;
  status: 'Pendente' | 'Finalizada' | string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: any;
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
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [joinGroupId, setJoinGroupId] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
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
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
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
              const groupData = groupDoc.data() as Group;
              setGroupName(groupData.name);
              setCurrentGroup(groupData);
            }
          }
        }
      }
    };

    const fetchTasks = async () => {
      if (!groupId) return;
      
      try {
        const response = await fetch('https://backend-faxinex.vercel.app/tasks');
        const allTasks = await response.json();
        // Filter tasks for current group
        const groupTasks = allTasks.filter((task: Task) => task.idGroup === groupId);
        setTasks(groupTasks);
      } catch (error) {
        console.error('Erro ao buscar tasks:', error);
        setTasks([]);
      }
    };

    fetchUserData();
    if (groupId) {
      fetchTasks();
    }
  }, [groupId]);

  const handleJoinGroup = async () => {
    if (!joinGroupId.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira um ID de grupo válido.',
      });
      return;
    }

    try {
      const groupDoc = await getDoc(doc(firestore, 'groups', joinGroupId));
      if (!groupDoc.exists()) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Grupo não encontrado.',
        });
        return;
      }

      // Update user's group_id
      await updateDoc(doc(firestore, 'Users', userId!), {
        group_id: joinGroupId,
        isAdmin: false,
      });

      setGroupId(joinGroupId);
      setShowJoinGroupModal(false);
      setJoinGroupId('');

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Você entrou no grupo com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível entrar no grupo.',
      });
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira um email válido.',
      });
      return;
    }

    try {
      await sendEmail(newMemberEmail, groupId!);
      setShowAddMemberModal(false);
      setNewMemberEmail('');

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Convite enviado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível enviar o convite.',
      });
    }
  };

  const handleGroupPress = () => {
    if (!groupId) {
      setShowJoinGroupModal(true);
    } else {
      // Navigate to group details
      router.push({
        pathname: '/groups/[id]',
        params: { id: groupId }
      });
    }
  };

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
        <ProjectCard
          groupId={groupId}
          groupName={groupName}
          completedTasks={tasks.filter(t => t.status === 'Finalizada').length}
          totalTasks={tasks.length}
          onPress={handleGroupPress}
          onAddGroup={() => router.push('/groups/create')}
        />

        {groupId && (
          <View style={styles.tasksContainer}>
            <Text style={[styles.tasksTitle, { color: colors.primary }]}>TAREFAS</Text>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
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
                    Status: {task.status}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noTasksContainer}>
                <Text style={[styles.noTasksText, { color: colors.text }]}>Nenhuma tarefa criada ainda</Text>
                <Button
                  title="Criar Tarefa"
                  onPress={() => router.push('/tasks/create')}
                  style={styles.addTaskButton}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Join Group Modal */}
      <Modal
        visible={showJoinGroupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Entrar em um Grupo</Text>
            <TextInput
              value={joinGroupId}
              onChangeText={setJoinGroupId}
              placeholder="Digite o ID do grupo"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setShowJoinGroupModal(false)}
                variant="outline"
              />
              <Button
                title="Entrar"
                onPress={handleJoinGroup}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Membro</Text>
            <TextInput
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              placeholder="Digite o email do novo membro"
              style={styles.modalInput}
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                onPress={() => setShowAddMemberModal(false)}
                variant="outline"
              />
              <Button
                title="Enviar Convite"
                onPress={handleAddMember}
              />
            </View>
          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.light.primary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});