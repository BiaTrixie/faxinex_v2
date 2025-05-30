import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';

export default function CreateTaskScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleCreateTask = () => {
    // Handle task creation logic here
    router.back();
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
          multiline
        />

        <View style={styles.difficultyContainer}>
          <Text style={styles.label}>Dificuldade</Text>
          <View style={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
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

        <Button
          title="CRIAR TAREFA"
          onPress={handleCreateTask}
          style={styles.createButton}
        />
      </ScrollView>
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
  },
});