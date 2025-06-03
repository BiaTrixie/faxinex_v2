import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/contexts/ThemeContext';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '@/FirebaseConfig';

const { width } = Dimensions.get('window');

type JoinGroupModalProps = {
  visible: boolean;
  onJoinGroup: (groupId: string) => void;
  onCancel: () => void;
  loading?: boolean;
  userId: string | null;
  setShowJoinGroupModal: (show: boolean) => void;
  setGroupId: (id: string) => void;
  setGroupName: (name: string) => void;
};

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  visible,
  onJoinGroup,
  onCancel,
  loading = false,
  userId,
  setShowJoinGroupModal,
  setGroupId,
  setGroupName,
}) => {
  const [groupId, setGroupIdState] = useState('');
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const { colors } = useTheme();

  const handleJoin = () => {
    if (groupId.trim().length === 0) {
      Alert.alert('Erro', 'Por favor, digite o ID do grupo');
      return;
    }

    const groupIdRegex = /^[A-Z0-9]{5}$/i;
    if (!groupIdRegex.test(groupId.trim())) {
      Alert.alert('Erro', 'ID do grupo inválido. Deve conter 5 letras ou números.');
      return;
    }

    handleJoinGroup(groupId.trim());
  };

  const handleCancel = () => {
    setGroupIdState('');
    onCancel();
  };

  const handleJoinGroup = async (groupIdToJoin: string) => {
    if (!userId) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    setIsJoiningGroup(true);

    try {
      const groupDocRef = doc(firestore, 'Groups', groupIdToJoin);
      const groupDoc = await getDoc(groupDocRef);

      if (!groupDoc.exists()) {
        Alert.alert('Erro', 'Grupo não encontrado. Verifique o ID do grupo.');
        return;
      }

      // Atualiza o usuário com o group_id
      const userDocRef = doc(firestore, 'Users', userId);
      await updateDoc(userDocRef, {
        group_id: groupIdToJoin,
      });

      // Adiciona o usuário aos participants do grupo
      await updateDoc(groupDocRef, {
        participants: arrayUnion(userId),
      });

      setGroupId(groupIdToJoin);
      setGroupName(groupDoc.data().name);
      setShowJoinGroupModal(false);

      Alert.alert('Sucesso', 'Você entrou no grupo com sucesso!');
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      Alert.alert('Erro', 'Não foi possível entrar no grupo. Tente novamente.');
    } finally {
      setIsJoiningGroup(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>
              Entrar no Grupo
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Digite o ID do grupo para participar
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={groupId}
              onChangeText={text => setGroupIdState(text.toUpperCase())}
              placeholder="ID do grupo"
              placeholderTextColor={colors.secondaryText}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  backgroundColor: '#F5F5F5',
                  borderColor: colors.primary,
                  color: colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: colors.primary },
                (loading || !userId) && styles.disabledButton,
              ]}
              onPress={handleJoin}
              disabled={loading || !userId}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Entrando...' : 'Entrar no Grupo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { borderColor: colors.primary },
              ]}
              onPress={handleCancel}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: colors.primary },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerText, { color: colors.secondaryText }]}>
            O ID do grupo é fornecido pelo administrador do grupo
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    shadowColor: '#5E75F2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default JoinGroupModal;