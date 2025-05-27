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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Moon, Bell, Globe, Lock, Database, ChevronRight, LogOut } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import BackButton from '@/components/BackButton';
import BottomBar from '@/components/BottomBar';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function SettingsScreen() {
  const { theme, colors, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const { signOut } = useAuth();
  const { user } = useUser();

  type SettingItemProps = {
    icon: React.ReactNode;
    title: string;
    value?: any;
    onPress: () => void;
    showToggle?: boolean;
    showChevron?: boolean;
  };

  const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    value,
    onPress,
    showToggle = false,
    showChevron = true,
  }) => (
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

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permissão Necessária',
          'É necessário permitir o acesso à galeria de fotos para alterar sua imagem de perfil.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Alterar Foto de Perfil',
        'Escolha uma opção:',
        [
          {
            text: 'Galeria de Fotos',
            onPress: () => pickImageFromGallery(),
          },
          {
            text: 'Câmera',
            onPress: () => pickImageFromCamera(),
          },
          {
            text: 'Remover Foto',
            onPress: () => removeProfileImage(),
            style: 'destructive',
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível alterar a imagem de perfil.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setIsUpdatingImage(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], 
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem da galeria:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permissão Necessária',
          'É necessário permitir o acesso à câmera para tirar uma foto.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsUpdatingImage(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], 
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await updateProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const updateProfileImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    try {
      if (!imageAsset.base64 || !imageAsset.mimeType) {
        throw new Error('Dados da imagem incompletos');
      }

      // Formatar a imagem como base64 com o tipo MIME correto
      const base64Image = `data:${imageAsset.mimeType};base64,${imageAsset.base64}`;
      
      // Atualizar a imagem de perfil usando o método do Clerk
      await user?.setProfileImage({
        file: base64Image,
      });

      Alert.alert('Sucesso', 'Imagem de perfil atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar imagem de perfil:', error);
      
      let errorMessage = 'Não foi possível atualizar a imagem de perfil.';
      
      if (error?.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].message || errorMessage;
      }
      
      Alert.alert('Erro', errorMessage);
    }
  };

  const removeProfileImage = async () => {
    try {
      setIsUpdatingImage(true);
      
      await user?.setProfileImage({
        file: null,
      });

      Alert.alert('Sucesso', 'Imagem de perfil removida com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover imagem de perfil:', error);
      
      let errorMessage = 'Não foi possível remover a imagem de perfil.';
      
      if (error?.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].message || errorMessage;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.lightBlue1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleImagePicker}
            disabled={isUpdatingImage}
          >
            <Image
              source={{ 
                uri: user?.imageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' 
              }}
              style={[styles.profileImage, isUpdatingImage && styles.profileImageLoading]}
            />
            <View style={styles.cameraButton}>
              {isUpdatingImage ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <Camera color={Colors.light.primary} size={20} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{user?.firstName || user?.username || 'Usuário'}</Text>
          <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress || ''}</Text>
          <Text style={styles.profileImageHint}>Toque na imagem para alterar</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APARÊNCIA</Text>
          <SettingItem
            icon={<Moon color={colors.primary} size={24} />}
            title="Modo Escuro"
            value={theme === 'dark'}
            onPress={toggleTheme}
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
            value={undefined}
          />
          <SettingItem
            icon={<Database color={Colors.light.primary} size={24} />}
            title="Dados do Aplicativo"
            onPress={() => {}} 
            value={undefined}
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon={<LogOut color={Colors.light.primary} size={24} />}
            title="Sair"
            onPress={signOut}
            showChevron={false} 
            value={undefined}
          />
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
    padding: 35,
    paddingBottom: 60
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
  profileImageLoading: {
    opacity: 0.7,
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
    marginBottom: 5,
  },
  profileImageHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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