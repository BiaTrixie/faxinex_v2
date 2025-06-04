import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { firestore } from '@/FirebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo';
import BottomBar from '@/components/BottomBar';
import { Minus, Plus } from 'lucide-react-native';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  image: string;
}

export default function CreateTaskScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'fácil' | 'média' | 'difícil'>('média');
  const [category, setCategory] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [userGroupId, setUserGroupId] = useState<string>('');

  useEffect(() => {
    fetchUserGroupAndMembers();
  }, [user]);

  const fetchUserGroupAndMembers = async () => {
    if (!user?.id) return;

    try {
      setLoadingMembers(true);
      
      const userDoc = await getDoc(doc(firestore, 'Users', user.id));
      if (!userDoc.exists()) {
        Alert.alert('Erro', 'Dados do usuário não encontrados');
        return;
      }

      const userData = userDoc.data();
      const groupId = userData.group_id;
      
      if (!groupId) {
        Alert.alert('Aviso', 'Você precisa estar em um grupo para criar tarefas');
        router.back();
        return;
      }

      setUserGroupId(groupId);

      const groupDoc = await getDoc(doc(firestore, 'Groups', groupId));
      if (!groupDoc.exists()) {
        Alert.alert('Erro', 'Grupo não encontrado');
        return;
      }

      const groupData = groupDoc.data();
      const participants = groupData.participants || [];

      const membersPromises = participants.map(async (participantId: string) => {
        if (participantId === user.id) {
          return {
            id: user.id,
            name: user.firstName || user.username || 'Usuário sem nome',
            email: user.primaryEmailAddress?.emailAddress || '',
            image: user.imageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          };
        }
        
        const memberDoc = await getDoc(doc(firestore, 'Users', participantId));
        if (memberDoc.exists()) {
          const memberData = memberDoc.data();
          return {
            id: participantId,
            name: memberData.name || 'Usuário sem nome',
            email: memberData.email || '',
            image: memberData.image || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          };
        }
        return null;
      });

      const membersData = await Promise.all(membersPromises);
      const validMembers = membersData.filter((member): member is GroupMember => member !== null);
      
      setGroupMembers(validMembers);

    } catch (error) {
      console.error('Erro ao buscar membros do grupo:', error);
      Alert.alert('Erro', 'Não foi possível carregar os membros do grupo');
    } finally {
      setLoadingMembers(false);
    }
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  const generateTaskId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

const handleCreateTask = async () => {
  if (!title.trim() || !description.trim() || !userGroupId) { // Removido !category.trim()
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: 'Por favor, preencha todos os campos obrigatórios',
      position: 'top',
    });
    return;
  }

  if (selectedParticipants.length === 0) {
    Toast.show({
      type: 'error',
      text1: 'Participantes necessários',
      text2: 'Selecione pelo menos um participante para criar a tarefa',
      position: 'top',
    });
    return;
  }

  setIsLoading(true);

  try {
    const taskId = generateTaskId();
    await setDoc(doc(firestore, 'Tasks', taskId), {
      id: taskId,
      taskName: title.trim(),
      description: description.trim(),
      difficulty: difficulty === 'fácil' ? 1 : difficulty === 'média' ? 2 : 3,
      category: category.trim(), // Pode ser string vazia
      participants: selectedParticipants,
      idGroup: userGroupId,
      status: 'Pendente',
      createdBy: user?.id || '',
      createdAt: serverTimestamp(),
    });

    Toast.show({
      type: 'success',
      text1: 'Sucesso',
      text2: 'Tarefa criada com sucesso!',
      position: 'top',
    });

    setTimeout(() => {
      router.replace('/home');
    }, 1200);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: 'Não foi possível criar a tarefa. Tente novamente.',
      position: 'top',
    });
  } finally {
    setIsLoading(false);
  }
};

  const ParticipantItem = ({ member, isSelected }: { member: GroupMember; isSelected: boolean }) => {
    const isCurrentUser = member.id === user?.id;
    
    return (
      <View style={styles.participantItem}>
        <Image source={{ uri: member.image }} style={styles.participantAvatar} />
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>
            {member.name} {isCurrentUser && '(Você)'}
          </Text>
          <Text style={styles.participantEmail}>{member.email}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isSelected ? styles.removeButton : styles.addButton,
          ]}
          onPress={() => toggleParticipant(member.id)}
        >
          {isSelected ? (
            <Minus color="#FFF" size={16} />
          ) : (
            <Plus color="#FFF" size={16} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loadingMembers) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.lightBlue1]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>CRIAR NOVA TAREFA</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando membros do grupo...</Text>
        </View>
        <BottomBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>CRIAR NOVA TAREFA</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Nome da tarefa"
          style={styles.input}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Descrição"
          style={styles.input}
        />

        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Categoria"
          style={styles.input}
        />

        <View style={styles.difficultyContainer}>
          <Text style={styles.label}>Dificuldade</Text>
          <View style={styles.difficultyButtons}>
            {(['fácil', 'média', 'difícil'] as const).map((level) => (
              <Button
                key={level}
                title={level.toUpperCase()}
                onPress={() => setDifficulty(level)}
                variant={difficulty === level ? 'primary' : 'outline'}
                style={styles.difficultyButton}
              />
            ))}
          </View>
        </View>

        <View style={styles.participantsSection}>
          <View style={styles.participantsSectionHeader}>
            <Text style={styles.label}>Participantes ({selectedParticipants.length})</Text>
          </View>
          
          <Text style={styles.participantsSubtitle}>
            Selecione os membros do grupo que participarão desta tarefa
          </Text>

          <View style={styles.participantsList}>
            {groupMembers.map((member) => (
              <ParticipantItem
                key={member.id}
                member={member}
                isSelected={selectedParticipants.includes(member.id)}
              />
            ))}
          </View>

          {selectedParticipants.length > 0 && (
            <View style={styles.selectedParticipantsContainer}>
              <Text style={styles.selectedParticipantsTitle}>
                Participantes selecionados:
              </Text>
              <View style={styles.selectedParticipantsList}>
                {groupMembers
                  .filter(member => selectedParticipants.includes(member.id))
                  .map((member, index) => (
                    <View key={member.id} style={styles.selectedParticipantChip}>
                      <Image source={{ uri: member.image }} style={styles.chipAvatar} />
                      <Text style={styles.chipName}>
                        {member.name}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          )}
        </View>

        <Button
          title={isLoading ? "CRIANDO..." : "CRIAR TAREFA"}
          onPress={handleCreateTask}
          style={styles.createButton}
          disabled={isLoading || selectedParticipants.length === 0}
          loading={isLoading}
        />
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.primary,
  },
  input: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  difficultyContainer: {
    marginBottom: 30,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  participantsSection: {
    marginBottom: 30,
  },
  participantsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  participantsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  participantsList: {
    gap: 12,
    marginBottom: 20,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  participantAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 13,
    color: '#666',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: Colors.light.primary,
  },
  removeButton: {
    backgroundColor: '#FF4444',
  },
  selectedParticipantsContainer: {
    backgroundColor: '#F0F4FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedParticipantsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  selectedParticipantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedParticipantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.lightBlue1,
    gap: 6,
  },
  chipAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  chipName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  createButton: {
    marginTop: 20,
    marginBottom: 80,
  },
});