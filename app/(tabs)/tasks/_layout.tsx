import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="view" />
      <Stack.Screen name="viewDetail" />
      <Stack.Screen name="detail" />
    </Stack>
  );
}