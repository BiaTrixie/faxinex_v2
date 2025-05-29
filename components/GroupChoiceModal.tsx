import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Users, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

type GroupChoiceModalProps = {
  visible: boolean;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  onCancel: () => void;
};

const GroupChoiceModal: React.FC<GroupChoiceModalProps> = ({
  visible,
  onCreateGroup,
  onJoinGroup,
  onCancel,
}) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>
              Grupos
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Escolha uma opção para continuar
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: colors.primary, backgroundColor: colors.primary },
              ]}
              onPress={onCreateGroup}
              activeOpacity={0.8}
            >
              <Plus color="#FFF" size={24} />
              <Text style={styles.optionButtonText}>Criar Novo Grupo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                styles.secondaryButton,
                { borderColor: colors.primary },
              ]}
              onPress={onJoinGroup}
              activeOpacity={0.8}
            >
              <Users color={colors.primary} size={24} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Entrar em um Grupo
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
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
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default GroupChoiceModal;