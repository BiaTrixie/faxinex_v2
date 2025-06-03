import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import { firestore } from '@/FirebaseConfig';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo';
import BottomBar from '@/components/BottomBar';

export default function CreateTaskScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'fácil' | 'média' | 'difícil'>('média');
  const [category, setCategory] = useState('');
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Supondo que o id do grupo do usuário está em user.publicMetadata.group_id
  const groupId = user?.publicMetadata?.group_id || '';

  const handleAddParticipant = () => {
    const email = participantInput.trim().toLowerCase();
    if (email && !participants.includes(email)) {
      setParticipants([...participants, email]);
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p !== email));
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
    if (!title.trim() || !description.trim() || !category.trim() || !groupId) return;
    setIsLoading(true);
    try {
      const taskId = generateTaskId();
      await setDoc(doc(firestore, 'Tasks', taskId), {
        id: taskId,
        taskName: title.trim(),
        description: description.trim(),
        difficulty: difficulty === 'fácil' ? 1 : difficulty === 'média' ? 2 : 3,
        category: category.trim(),
        participants,
        idGroup: groupId,
        status: 'Pendente',
        createdAt: serverTimestamp(),
      });
      router.back();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <Text style={styles.label}>Participantes</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={participantInput}
              onChangeText={setParticipantInput}
              placeholder="Email do participante"
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Button
              title="Adicionar"
              onPress={handleAddParticipant}
              style={{ marginLeft: 10 }}
              disabled={!participantInput.trim()}
            />
          </View>
          {participants.length > 0 && (
            <View style={styles.participantsList}>
              {participants.map((email) => (
                <View key={email} style={styles.participantItem}>
                  <Text style={styles.participantEmail}>{email}</Text>
                  <TouchableOpacity onPress={() => handleRemoveParticipant(email)}>
                    <Text style={{ color: 'red', marginLeft: 8 }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <Button
          title={isLoading ? "CRIANDO..." : "CRIAR TAREFA"}
          onPress={handleCreateTask}
          style={styles.createButton}
          disabled={isLoading}
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
  createButton: {
    marginTop: 20,
    marginBottom: 80,
  },
  participantsSection: {
    marginBottom: 30,
  },
  participantsList: {
    marginTop: 10,
    gap: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  participantEmail: {
    fontSize: 15,
    color: Colors.light.primary,
  },
});