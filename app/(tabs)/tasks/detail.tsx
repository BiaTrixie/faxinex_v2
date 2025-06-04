import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Modal } from 'react-native';

import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';
import { useTheme } from '@/contexts/ThemeContext';
import { firestore } from '@/FirebaseConfig';
import { Task } from '../home';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Star,
  Trophy,
  Users,
} from 'lucide-react-native';

interface Difficulty {
  id: number;
  name: string;
  points: number;
}

interface GroupMember {
  id: string;
  name: string;
  email: string;
  image: string;
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useUser();
  const { taskId, taskData } = useLocalSearchParams();

  const [task, setTask] = useState<Task | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [participants, setParticipants] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadTaskData();
  }, [taskId, taskData]);

  const loadTaskData = async () => {
    try {
      setIsLoading(true);

      if (taskData) {
        const parsedTask = JSON.parse(taskData as string) as Task;
        console.log('Tarefa carregada:', parsedTask);
        setTask(parsedTask);

        await fetchDifficultyInfo(parsedTask.difficulty);
        await fetchParticipantsInfo(parsedTask.participants);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da tarefa:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da tarefa');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDifficultyInfo = async (difficultyId: number) => {
    try {
      const response = await fetch(
        'https://backend-faxinex.vercel.app/difficulties'
      );
      const difficulties = await response.json();
      const difficultyInfo = difficulties.find(
        (d: Difficulty) => d.id === difficultyId
      );

      if (difficultyInfo) {
        setDifficulty(difficultyInfo);
      } else {
        setDifficulty({
          id: difficultyId,
          name:
            difficultyId === 1
              ? 'Fácil'
              : difficultyId === 2
                ? 'Média'
                : 'Difícil',
          points: difficultyId === 1 ? 3 : difficultyId === 2 ? 5 : 8,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dificuldade:', error);
      setDifficulty({
        id: difficultyId,
        name:
          difficultyId === 1
            ? 'Fácil'
            : difficultyId === 2
              ? 'Média'
              : 'Difícil',
        points: difficultyId === 1 ? 3 : difficultyId === 2 ? 5 : 8,
      });
    }
  };

  const fetchParticipantsInfo = async (participantIds: string[]) => {
    try {
      const participantsPromises = participantIds.map(async (participantId) => {
        if (participantId === user?.id) {
          return {
            id: user.id,
            name: user.firstName || user.username || 'Você',
            email: user.primaryEmailAddress?.emailAddress || '',
            image:
              user.imageUrl ||
              'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          };
        }

        const userDoc = await getDoc(doc(firestore, 'Users', participantId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            id: participantId,
            name: userData.name || 'Usuário',
            email: userData.email || '',
            image:
              userData.image ||
              'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          };
        }
        return null;
      });

      const participantsData = await Promise.all(participantsPromises);
      setParticipants(
        participantsData.filter((p): p is GroupMember => p !== null)
      );
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
    }
  };

  const handleCompleteTask = () => {
    if (!task || !user?.id || !difficulty) {
      console.log('Dados faltando:', {
        task: !!task,
        user: !!user?.id,
        difficulty: !!difficulty,
      });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmComplete = () => {
    setShowConfirmModal(false);
    completeTask();
  };

  const handleCancelComplete = () => {
    setShowConfirmModal(false);
  };

  const completeTask = async () => {
    if (!task || !user?.id || !difficulty) {
      console.log('Dados insuficientes para completar tarefa');
      return;
    }

    console.log('Executando conclusão da tarefa...');
    setIsCompletingTask(true);

    try {
      console.log('Atualizando status da tarefa...');
      await updateDoc(doc(firestore, 'Tasks', task.id), {
        status: 'Finalizada',
        completedAt: new Date(),
        completedBy: user.id,
      });

      console.log('Adicionando pontos para os participantes...');

      const pointsToAdd = difficulty.points;
      console.log(
        `Adicionando ${pointsToAdd} pontos para ${task.participants.length} participantes`
      );

      const updatePromises = task.participants.map(
        async (participantId: string) => {
          try {
            const userDocRef = doc(firestore, 'Users', participantId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const currentPoints = userDoc.data().points || 0;
              const newPoints = currentPoints + pointsToAdd;

              await updateDoc(userDocRef, {
                points: newPoints,
                lastPointsUpdate: new Date(),
              });

              console.log(
                `Pontos atualizados para usuário ${participantId}: ${currentPoints} → ${newPoints}`
              );
            }
          } catch (error) {
            console.error(
              `Erro ao atualizar pontos do usuário ${participantId}:`,
              error
            );
          }
        }
      );

      await Promise.all(updatePromises);

      // 3. Atualizar o estado local
      setTask((prev) => (prev ? { ...prev, status: 'Finalizada' } : null));

      // 4. Mostrar sucesso
      Toast.show({
        type: 'success',
        text1: 'Parabéns!',
        text2: `Tarefa concluída! Você ganhou ${pointsToAdd} pontos!`,
        position: 'top',
      });

      // 5. Voltar para home após 2 segundos
      setTimeout(() => {
        router.replace('/home');
      }, 2000);
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível completar a tarefa. Tente novamente.',
        position: 'top',
      });
    } finally {
      setIsCompletingTask(false);
    }
  };

  const getDifficultyColor = (difficultyId: number) => {
    switch (difficultyId) {
      case 1:
        return '#4CAF50';
      case 2:
        return '#FF9800';
      case 3:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatDate = (dateInput: any): string => {
    console.log('ERROOOO', dateInput)
    // Verifica se a entrada é nula, indefinida ou vazia
    if (dateInput === null || typeof dateInput === 'undefined' || dateInput === '') {
      return 'Data não disponível';
    }

    let dateObj: Date;

    try {
      if (dateInput && typeof dateInput.toDate === 'function') {
        // Caso 1: Objeto com método toDate() (ex: Firebase Timestamp)
        dateObj = dateInput.toDate();
      } else if (dateInput instanceof Date) {
        // Caso 2: Já é um objeto Date
        dateObj = dateInput;
      } else if (typeof dateInput === 'number') {
        // Caso 3: É um número. Assumimos que está em SEGUNDOS, conforme o contexto do problema.
        // Convertendo para milissegundos para o construtor Date.
        dateObj = new Date(dateInput * 1000);
      } else if (typeof dateInput === 'string') {
        // Caso 4: É uma string. Tentamos interpretá-la.
        // Verifica se é uma string puramente numérica
        const numericValue = Number(dateInput);
        if (!isNaN(numericValue) && dateInput.trim() === String(numericValue)) {
          // É uma string numérica. Decidir se é segundos ou milissegundos.
          // Uma heurística comum: timestamps em segundos têm ~10 dígitos, em milissegundos ~13.
          // Se tiver 10 dígitos, tratamos como segundos.
          if (String(Math.floor(Math.abs(numericValue))).length === 10) {
            dateObj = new Date(numericValue * 1000); // Assume segundos
          } else {
            dateObj = new Date(numericValue); // Assume milissegundos
          }
        } else {
          // É uma string não numérica (ex: "2023-10-26" ou "May 26, 2025")
          dateObj = new Date(dateInput);
        }
      } else {
        // Outros tipos: Tenta criar um objeto Date diretamente (pode resultar em data inválida)
        dateObj = new Date(dateInput);
      }

      // Verifica se o objeto Date resultante é válido
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }

      // Formata a data para o padrão pt-BR
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        // timeZone: 'America/Sao_Paulo' // Adicionar para consistência de fuso horário
      });

    } catch (error) {
      // Em caso de qualquer erro durante o processo
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.lightBlue1]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DETALHES DA TAREFA</Text>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            Carregando detalhes...
          </Text>
        </View>
        <BottomBar />
      </SafeAreaView>
    );
  }

  if (!task || !difficulty) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LinearGradient
          colors={[colors.primary, colors.lightBlue1]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DETALHES DA TAREFA</Text>
        </LinearGradient>

        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.primary }]}>
            Tarefa não encontrada
          </Text>
        </View>
        <BottomBar />
      </SafeAreaView>
    );
  }

  const difficultyColor = getDifficultyColor(task.difficulty);
  const isTaskCompleted = task.status === 'Finalizada';
  const canCompleteTask =
    !isTaskCompleted && task.participants.includes(user?.id || '');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[colors.primary, colors.lightBlue1]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DETALHES DA TAREFA</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, { color: colors.primary }]}>
              {task.taskName}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isTaskCompleted ? '#4CAF50' : '#FF9800',
                },
              ]}
            >
              <Text style={styles.statusText}>{task.status}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Star color={difficultyColor} size={20} />
              <Text style={styles.infoLabel}>Dificuldade:</Text>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: difficultyColor },
                ]}
              >
                <Text style={styles.difficultyText}>{difficulty.name}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Trophy color={Colors.light.primary} size={20} />
              <Text style={styles.infoLabel}>Pontos:</Text>
              <Text style={[styles.infoValue, { color: difficultyColor }]}>
                {difficulty.points} pts
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Users color={Colors.light.primary} size={20} />
              <Text style={styles.infoLabel}>Participantes:</Text>
              <Text style={styles.infoValue}>
                {participants.length}{' '}
                {participants.length === 1 ? 'pessoa' : 'pessoas'}
              </Text>
            </View>

            {/* {task.createdAt && ( */}
            <View style={styles.infoRow}>
              <Calendar color={Colors.light.primary} size={20} />
              <Text style={styles.infoLabel}>Criada em:</Text>
              <Text style={styles.infoValue}>
                {formatDate(task.createdAt._seconds)}
              </Text>
            </View>
            {/* )} */}
          </View>

          {task.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Descrição
              </Text>
              <Text
                style={[styles.description, { color: colors.secondaryText }]}
              >
                {task.description}
              </Text>
            </View>
          )}

          {task.category && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Categoria
              </Text>
              <Text
                style={[styles.categoryText, { color: colors.secondaryText }]}
              >
                {task.category}
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Participantes ({participants.length})
            </Text>
            <View style={styles.participantsList}>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <Image
                    source={{ uri: participant.image }}
                    style={styles.participantAvatar}
                  />
                  <View style={styles.participantInfo}>
                    <Text
                      style={[
                        styles.participantName,
                        { color: colors.primary },
                      ]}
                    >
                      {participant.name}
                      {participant.id === user?.id && ' (Você)'}
                    </Text>
                    <Text
                      style={[
                        styles.participantEmail,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {participant.email}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {canCompleteTask && (
            <TouchableOpacity
              style={[
                styles.completeButton,
                { backgroundColor: difficultyColor },
              ]}
              onPress={handleCompleteTask}
              disabled={isCompletingTask}
            >
              {isCompletingTask ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <CheckCircle2 color="#FFF" size={20} />
                  <Text style={styles.completeButtonText}>
                    MARCAR COMO CONCLUÍDA (+{difficulty.points} pts)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {isTaskCompleted && (
            <View style={styles.completedIndicator}>
              <CheckCircle2 color="#4CAF50" size={24} />
              <Text style={styles.completedText}>
                Tarefa concluída com sucesso!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de confirmação */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelComplete}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.primary }]}>
              Completar Tarefa
            </Text>
            <Text
              style={[styles.modalMessage, { color: colors.secondaryText }]}
            >
              Tem certeza que deseja marcar esta tarefa como concluída?{'\n'}
              Todos os participantes ganharão {difficulty?.points} pontos!
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E0E0E0' }]}
                onPress={handleCancelComplete}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.primary }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleConfirmComplete}
                disabled={isCompletingTask}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                  Completar
                </Text>
              </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    marginBottom: 70,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoryText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  participantsList: {
    gap: 10,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    gap: 10,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    marginTop: 20,
    gap: 10,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
