import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';
import { firestore } from '@/FirebaseConfig';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateGroupId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const getUniqueGroupId = async () => {
    let unique = false;
    let groupId = '';
    while (!unique) {
      groupId = generateGroupId();
      const docRef = doc(firestore, 'Groups', groupId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        unique = true;
      }
    }
    return groupId;
  };

const handleCreateGroup = async () => {
  if (!name.trim() || !description.trim()) return;
  setIsLoading(true);
  try {
    const groupId = await getUniqueGroupId();
    await setDoc(doc(firestore, 'Groups', groupId), {
      id: groupId,
      name: name.trim(),
      description: description.trim(),
      createdBy: user?.id || '',
      createdAt: serverTimestamp(),
      participants: user?.id ? [user.id] : [],
    });
    if (user?.id) {
      await setDoc(
        doc(firestore, 'Users', user.id),
        { isAdmin: true, group_id: groupId },
        { merge: true }
      );
    }
    router.replace('/home');
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
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
        <Text style={styles.headerTitle}>CRIAR NOVO GRUPO</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nome do grupo"
          style={styles.input}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Descrição"
          style={styles.input}
        />
        <Button
          title={isLoading ? "CRIANDO..." : "CRIAR GRUPO"}
          onPress={handleCreateGroup}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 15,
  },
  membersSection: {
    marginBottom: 30,
  },
  membersList: {
    gap: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  addButton: {
    marginTop: 10,
  },
  createButton: {
    marginTop: 20,
  },
});