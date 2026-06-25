import { View, Text, Button } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Page not found</Text>
      <Button title="Go Home" onPress={() => router.push("/")} />
    </View>
  );
}
