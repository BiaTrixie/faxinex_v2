import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TaskDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18 }}>Detalhes da Tarefa</Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>ID da Tarefa: {id}</Text>
    </View>
  );
}
