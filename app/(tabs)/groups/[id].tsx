import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/FirebaseConfig';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/Button';
import { Users } from 'lucide-react-native';
import BottomBar from '@/components/BottomBar';

interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: any;
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!id) return;

      try {
        const groupDoc = await getDoc(doc(firestore, 'groups', id as string));
        if (groupDoc.exists()) {
          setGroup({ id: groupDoc.id, ...groupDoc.data() } as Group);
        }
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };

    fetchGroupDetails();
  }, [id]);

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{group.name}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{group.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Membros</Text>
            <TouchableOpacity
              style={styles.addMemberButton}
              onPress={() => setShowAddMemberModal(true)}
            >
              <Users color={Colors.light.primary} size={24} />
              <Text style={styles.addMemberText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
          {/* Add member list here */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          {/* Add group statistics here */}
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
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addMemberText: {
    marginLeft: 8,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});