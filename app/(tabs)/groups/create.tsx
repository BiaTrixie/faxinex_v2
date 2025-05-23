import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';

export default function CreateGroupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateGroup = () => {
    // Handle group creation logic here
    router.back();
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
          multiline
        />

        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Participantes</Text>
          <View style={styles.membersList}>
            <View style={styles.memberItem}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
                style={styles.memberAvatar}
              />
              <Text style={styles.memberName}>RONALDO</Text>
            </View>
            <Button
              title="+ ADICIONAR"
              onPress={() => {}}
              variant="outline"
              style={styles.addButton}
            />
          </View>
        </View>

        <Button
          title="CRIAR GRUPO"
          onPress={handleCreateGroup}
          style={styles.createButton}
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