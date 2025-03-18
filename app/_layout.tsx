import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";
import { SettingsProvider } from "./contexts/SettingsContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </SettingsProvider>
  );
}
