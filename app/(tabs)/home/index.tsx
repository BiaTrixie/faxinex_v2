import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import ProjectCard from '@/components/ProjectCard';
import BottomBar from '@/components/BottomBar';
import Colors from '@/constants/Colors';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from '@/FirebaseConfig';
import { Settings } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { theme, colors } = useTheme();
  const [userName, setUserName] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string | undefined>(undefined);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'todas' | 'pendentes' | 'finalizadas'>('todas');
  const router = useRouter();

useEffect(() => {
  const fetchUserData = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email || 'Usuário não encontrado');
      // Busca o user no Firestore para pegar a foto
      const db = getFirestore(app);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setGroupId(data.group_id ?? null);
        setUserPhoto(
          data.image ||
          user.photoURL ||
          'https://i.postimg.cc/3rmYdXYy/estilo-de-fantasia-de-cao-adoravel.jpg'
        );
      } else {
        setGroupId(null);
        setUserPhoto(
          user.photoURL ||
          'https://i.postimg.cc/3rmYdXYy/estilo-de-fantasia-de-cao-adoravel.jpg'
        );
      }
    }
  };
  fetchUserData();
}, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: userPhoto || 'https://i.postimg.cc/3rmYdXYy/estilo-de-fantasia-de-cao-adoravel.jpg' }}
            style={styles.avatar}
          />
          <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <Settings color={colors.icon} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <ProjectCard
          groupId={groupId}
          onAddGroup={() => router.push('/groups/create')}
        />

        <View style={styles.tasksContainer}>
          <Text style={[styles.tasksTitle, { color: colors.primary }]}>TAREFAS</Text>
          <View style={styles.menuBar}>
            <Button
              title="Todas"
              variant={selectedTab === 'todas' ? 'primary' : 'outline'}
              onPress={() => setSelectedTab('todas')}
              style={styles.menuButton}
            />
            <Button
              title="Pendentes"
              variant={selectedTab === 'pendentes' ? 'primary' : 'outline'}
              onPress={() => setSelectedTab('pendentes')}
              style={styles.menuButton}
            />
            <Button
              title="Finalizadas"
              variant={selectedTab === 'finalizadas' ? 'primary' : 'outline'}
              onPress={() => setSelectedTab('finalizadas')}
              style={styles.menuButton}
            />
          </View>
          <View style={styles.noTasksContainer}>
            <Text style={[styles.noTasksText, { color: colors.text }]}>Você ainda não tem tarefas criadas</Text>
            <Button
              title="Adicionar Tarefa"
              onPress={() => router.push('/tasks/create')}
              style={styles.addTaskButton}
            />
          </View>
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
  },
  menuButton: {
    flex: 1,
    marginHorizontal: 2,
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