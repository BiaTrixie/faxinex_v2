import BottomBar from '@/components/BottomBar';
import Button from '@/components/Button';
import ProjectCard from '@/components/ProjectCard';
import Colors from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { auth, firestore } from '@/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { useRouter, useFocusEffect } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Plus, Settings } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import GroupChoiceModal from '@/components/GroupChoiceModal';
import JoinGroupModal from '@/components/JoinGroupModal';
import UserDataSync from '@/components/UserDataSync';

export interface Task {
  id: string;
  taskName: string;
  difficulty: number;
  participants: string[];
  category: string;
  idGroup: string;
  status: 'Pendente' | 'Finalizada' | string;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const [userName, setUserName] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    'todas' | 'Pendente' | 'Finalizada'
  >('todas');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados de loading
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);

  const [showGroupChoiceModal, setShowGroupChoiceModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);

  const router = useRouter();
  const { user, isLoaded } = useUser();

  const fetchUserTasks = useCallback(async (uid: string) => {
    try {
      setIsLoadingTasks(true);
      const response = await fetch(
        `https://backend-faxinex.vercel.app/tasks/user/${uid}`
      );
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!isLoaded || !user) {
      setIsLoadingUserData(false);
      return;
    }

    try {
      setIsLoadingUserData(true);
      
      // Definir dados básicos do usuário
      setUserId(user.id);
      setUserName(user.firstName || user.username || 'Usuário');
      setUserPhoto(
        user.imageUrl || 
        'https://i.postimg.cc/3rmYdXYy/estilo-de-fantasia-de-cao-adoravel.jpg'
      );

      // Buscar dados do Firestore
      const userDoc = await getDoc(doc(firestore, 'Users', user.id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userGroupId = data.group_id ?? null;
        setGroupId(userGroupId);
        
        // Atualizar foto se disponível no Firestore
        if (data.image) {
          setUserPhoto(data.image);
        }

        // Se o usuário tem grupo, buscar dados do grupo
        if (userGroupId && typeof userGroupId === 'string' && userGroupId.trim() !== '') {
          setIsLoadingGroup(true);
          try {
            const groupDoc = await getDoc(doc(firestore, 'Groups', userGroupId));
            if (groupDoc.exists()) {
              const groupData = groupDoc.data();
              setGroupName(groupData.name);
            } else {
              setGroupName(null);
              // Se o grupo não existe mais, limpar o group_id do usuário
              setGroupId(null);
            }
          } catch (error) {
            console.error('Erro ao buscar dados do grupo:', error);
            setGroupName(null);
          } finally {
            setIsLoadingGroup(false);
          }
        } else {
          setGroupName(null);
        }
      } else {
        // Se não existe documento do usuário no Firestore, criar um
        console.log('Documento do usuário não encontrado, será criado pelo UserDataSync');
        setGroupId(null);
        setGroupName(null);
      }

      // Buscar tarefas do usuário
      await fetchUserTasks(user.id);
      
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
    } finally {
      setIsLoadingUserData(false);
    }
  }, [isLoaded, user, fetchUserTasks]);

  // Carregar dados quando o componente monta ou quando o usuário muda
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Recarregar dados quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (isLoaded && user) {
        // Recarregar apenas as tarefas quando voltar para a tela
        fetchUserTasks(user.id);
      }
    }, [isLoaded, user, fetchUserTasks])
  );

  const handleShowGroupOptions = () => {
    setShowGroupChoiceModal(true);
  };

  const handleCreateGroup = () => {
    setShowGroupChoiceModal(false);
    router.push('/groups/create');
  };

  const handleShowJoinGroup = () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado. Tente novamente.');
      return;
    }
    setUserId(user.id);
    setShowGroupChoiceModal(false);
    setShowJoinGroupModal(true);
  };

  const handleJoinGroup = async (groupIdToJoin: string) => {
    if (!userId) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    setIsJoiningGroup(true);

    try {
      const groupDoc = await getDoc(doc(firestore, 'Groups', groupIdToJoin));

      if (!groupDoc.exists()) {
        Alert.alert('Erro', 'Grupo não encontrado. Verifique o ID do grupo.');
        return;
      }

      const userDocRef = doc(firestore, 'Users', userId);
      await updateDoc(userDocRef, {
        group_id: groupIdToJoin,
      });

      setGroupId(groupIdToJoin);
      setGroupName(groupDoc.data().name);
      setShowJoinGroupModal(false);

      Alert.alert('Sucesso', 'Você entrou no grupo com sucesso!');
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      Alert.alert('Erro', 'Não foi possível entrar no grupo. Tente novamente.');
    } finally {
      setIsJoiningGroup(false);
    }
  };

  const handleCancelModals = () => {
    setShowGroupChoiceModal(false);
    setShowJoinGroupModal(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedTab === 'todas') return true;
    if (selectedTab === 'Pendente') return task.status === 'Pendente';
    if (selectedTab === 'Finalizada') return task.status === 'Finalizada';
    return true;
  });

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

  // Loading principal
  if (!isLoaded || isLoadingUserData) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            Carregando dados...
          </Text>
        </View>
        <BottomBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <UserDataSync />
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                userPhoto ||
                user?.imageUrl ||
                'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            }}
            style={styles.avatar}
          />
          <Text style={[styles.userName, { color: colors.text }]}>
            {userName || user?.firstName || user?.username || 'Usuário'}
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Settings color={colors.icon} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {isLoadingGroup ? (
          <View style={styles.projectCardLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.primary }]}>
              Carregando grupo...
            </Text>
          </View>
        ) : (
          <ProjectCard
            groupId={groupId}
            groupName={groupName}
            completedTasks={tasks.filter((t) => t.status === 'Finalizada').length}
            totalTasks={tasks.length}
            userCompletedTasks={completedUserTasks.length}
            userTotalTasks={userTasks.length}
            onShowGroupOptions={handleShowGroupOptions}
          />
        )}
        
        <View style={styles.tasksContainer}>
          <View style={styles.tasksHeaderRow}>
            <Text style={[styles.tasksTitle, { color: colors.primary }]}>
              TAREFAS
            </Text>
            <TouchableOpacity
              style={styles.addTaskCircle}
              onPress={() => router.push('/tasks/create')}
            >
              <View style={styles.plusCircle}>
                <Plus color="#FFF" size={20} />
              </View>
            </TouchableOpacity>
          </View>
          
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

          {isLoadingTasks ? (
            <View style={styles.loadingTasksContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.primary }]}>
                Carregando tarefas...
              </Text>
            </View>
          ) : groupId ? (
            userTasks.length > 0 ? (
              userTasks
                .filter((task) =>
                  selectedTab === 'todas'
                    ? true
                    : selectedTab === 'Pendente'
                    ? task.status === 'Pendente'
                    : task.status === 'Finalizada'
                )
                .map((task, index) => (
                  <View
                    key={index}
                    style={{
                      marginBottom: 15,
                      padding: 15,
                      backgroundColor:
                        task.difficulty === 1
                          ? 'green'
                          : task.difficulty === 2
                          ? '#eead2d'
                          : 'red',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontWeight: 'bold', color: colors.text }}>
                      {task.taskName}
                    </Text>
                    <Text style={{ color: colors.text, marginTop: 5 }}>
                      Status: {task.status}
                    </Text>
                  </View>
                ))
            ) : (
              <View style={styles.noTasksContainer}>
                <Text style={[styles.noTasksText, { color: colors.text }]}>
                  Nenhuma tarefa criada ainda
                </Text>
              </View>
            )
          ) : (
            <View style={styles.noTasksContainer}>
              <Text style={[styles.noTasksText, { color: colors.secondaryText }]}>
                Você precisa estar em um grupo para criar tarefas
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <GroupChoiceModal
        visible={showGroupChoiceModal}
        onCreateGroup={handleCreateGroup}
        onJoinGroup={handleShowJoinGroup}
        onCancel={handleCancelModals}
      />

      <JoinGroupModal
        visible={showJoinGroupModal}
        onJoinGroup={handleJoinGroup}
        onCancel={handleCancelModals}
        loading={isJoiningGroup}
        userId={userId}
        setShowJoinGroupModal={setShowJoinGroupModal}
        setGroupId={setGroupId}
        setGroupName={setGroupName}
      />
      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  projectCardLoading: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 40,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTasksContainer: {
    alignItems: 'center',
    marginTop: 20,
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
  tasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  addTaskCircle: {
    marginLeft: 10,
  },
  plusCircle: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});