import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Page not found</Text>
      <Button title="Go Home" onPress={() => router.push('/')} />
    </View>
  );
}