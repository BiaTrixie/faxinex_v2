import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import ProjectCard from '@/components/ProjectCard';
import TaskItem from '@/components/TaskItem';
import BottomBar from '@/components/BottomBar';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const hasProjects = true; // Toggle this to show different states

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>RONALDO</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <ProjectCard
          empty={!hasProjects}
          title={hasProjects ? "Família Moura" : undefined}
          completedTasks={hasProjects ? 2 : undefined}
          totalTasks={hasProjects ? 3 : undefined}
          progress={hasProjects ? 80 : undefined}
        />

        {hasProjects && (
          <View style={styles.tasksContainer}>
            <Text style={styles.tasksTitle}>TAREFAS</Text>
            <TaskItem
              title="LIMPAR BANHEIRO"
              difficulty="hard"
              onPress={() => {}}
            />
            <TaskItem
              title="LIMPAR SALA"
              difficulty="medium"
              onPress={() => {}}
            />
            <TaskItem
              title="ORGANIZAR ARMÁRIO"
              difficulty="easy"
              onPress={() => {}}
            />
            <TaskItem
              title="ORGANIZAR COZINHA"
              difficulty="medium"
              onPress={() => {}}
            />
            <TaskItem
              title="LAVAR ESTEIRA"
              difficulty="hard"
              onPress={() => {}}
            />
          </View>
        )}
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
});