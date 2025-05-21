import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Clock, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import BottomBar from '@/components/BottomBar';
import { useTheme } from '@/contexts/ThemeContext';

export default function ViewTaskScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>TAREFA</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={[styles.taskTitle, { color: colors.primary }]}>LIMPAR SALA</Text>

        <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
          <View style={styles.infoRow}>
            <Clock color={colors.primary} size={20} />
            <Text style={[styles.infoText, { color: colors.text }]}>Criado em 15 de março</Text>
          </View>
          <View style={styles.infoRow}>
            <Users color={colors.primary} size={20} />
            <Text style={[styles.infoText, { color: colors.text }]}>3 participantes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Descrição</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            Limpar e organizar a sala, incluindo varrer, tirar o pó e organizar os móveis.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Progresso</Text>
          <View style={[styles.progressBar, { backgroundColor: colors.lightBlue1 }]}>
            <View style={[styles.progressFill, { width: '60%', backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.primary }]}>60% completo</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Participantes</Text>
          <View style={styles.participantsList}>
            <View style={[styles.participantItem, { backgroundColor: colors.background }]}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
                style={styles.participantAvatar}
              />
              <Text style={[styles.participantName, { color: colors.primary }]}>RONALDO</Text>
            </View>
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
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  participantsList: {
    gap: 10,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.primary,
  },
});