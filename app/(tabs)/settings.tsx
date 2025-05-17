import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Moon, Bell, Globe, Lock, Database, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const SettingItem = ({ icon, title, value, onPress, showToggle = false, showChevron = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      {icon}
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.settingRight}>
        {showToggle ? (
          <Switch
            value={value}
            onValueChange={onPress}
            trackColor={{ false: '#767577', true: Colors.light.lightBlue1 }}
            thumbColor={value ? Colors.light.primary : '#f4f3f4'}
          />
        ) : value ? (
          <Text style={styles.settingValue}>{value}</Text>
        ) : null}
        {showChevron && <ChevronRight color={Colors.light.primary} size={20} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
              style={styles.profileImage}
            />
            <View style={styles.cameraButton}>
              <Camera color={Colors.light.primary} size={20} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>RONALDO</Text>
          <Text style={styles.profileEmail}>ronaldo@example.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APARÊNCIA</Text>
          <SettingItem
            icon={<Moon color={Colors.light.primary} size={24} />}
            title="Modo Escuro"
            value={darkMode}
            onPress={() => setDarkMode(!darkMode)}
            showToggle
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICAÇÕES</Text>
          <SettingItem
            icon={<Bell color={Colors.light.primary} size={24} />}
            title="Notificações Push"
            value={notifications}
            onPress={() => setNotifications(!notifications)}
            showToggle
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GERAL</Text>
          <SettingItem
            icon={<Globe color={Colors.light.primary} size={24} />}
            title="Idioma"
            value="Português"
            onPress={() => {}}
          />
          <SettingItem
            icon={<Lock color={Colors.light.primary} size={24} />}
            title="Privacidade"
            onPress={() => {}}
          />
          <SettingItem
            icon={<Database color={Colors.light.primary} size={24} />}
            title="Dados do Aplicativo"
            onPress={() => {}}
          />
        </View>
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
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
});