import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  light: {
    primary: '#5E75F2',
    lightBlue1: '#668CD9',
    lightBlue2: '#73B2D9',
    lightGreen: '#73BFAA',
    text: '#333333',
    background: '#FFFFFF',
    tint: '#5E75F2',
    tabIconDefault: '#ccc',
    tabIconSelected: '#5E75F2',
    icon: '#fff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    inputBackground: '#F8F9FA',
    inputBorder: '#E1E5E9',
    inputText: '#333333',
    secondaryText: '#6B7280',
  },
  dark: {
    primary: '#5E75F2',
    lightBlue1: '#668CD9',
    lightBlue2: '#73B2D9',
    lightGreen: '#73BFAA',
    text: '#FFFFFF',
    background: '#1A1A1A',
    tint: '#5E75F2',
    tabIconDefault: '#ccc',
    tabIconSelected: '#5E75F2',
    icon: '#73B2D9',
    overlay: 'rgba(0, 0, 0, 0.7)',
    inputBackground: '#2A2A2A',
    inputBorder: '#404040',
    inputText: '#FFFFFF',
    secondaryText: '#9CA3AF',
  },
};

type CodePromptProps = {
  visible: boolean;
  onSubmit: (code: string) => void;
  onCancel: () => void;
};

const CodePrompt: React.FC<CodePromptProps> = ({
  visible,
  onSubmit,
  onCancel,
}) => {
  const [code, setCode] = useState('');
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme || 'light'];

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code);
      setCode('');
    }
  };

  const handleCancel = () => {
    setCode('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Verificação de Código
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Digite o código de 6 dígitos enviado para seu email
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor={theme.secondaryText}
              keyboardType="number-pad"
              maxLength={6}
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.inputText,
                },
              ]}
              textAlign="center"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Confirmar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { borderColor: theme.inputBorder },
              ]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.secondaryText },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.footerText, { color: theme.secondaryText }]}>
            Não recebeu o código?{' '}
            <Text style={[styles.linkText, { color: theme.primary }]}>
              Reenviar
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconText: {
    fontSize: 28,
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
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  linkText: {
    fontWeight: '600',
  },
});

export default CodePrompt;
