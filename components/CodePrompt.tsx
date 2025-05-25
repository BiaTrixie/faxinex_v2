import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button } from 'react-native';

type CodePromptProps = {
  visible: boolean;
  onSubmit: (code: string) => void;
  onCancel: () => void;
};

const CodePrompt: React.FC<CodePromptProps> = ({ visible, onSubmit, onCancel }) => {
  const [code, setCode] = useState('');

  return (
    <Modal visible={visible} transparent>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: 'white', padding: 20 }}>
          <Text>Digite o código enviado para seu email:</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <Button title="Confirmar" onPress={() => onSubmit(code)} />
          <Button title="Cancelar" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
};

export default CodePrompt;