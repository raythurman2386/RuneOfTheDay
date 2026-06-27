import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColorTheme } from "./hooks/useColorTheme";

export default function NotFound() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useColorTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Text style={[styles.rune, { color: colors.accent }]}>ᛉ</Text>
      <Text style={[styles.title, { color: colors.text }]}>Page not found</Text>
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        The page you&apos;re looking for doesn&apos;t exist.
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={() => router.push("/")}
      >
        <Text style={styles.buttonText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  rune: {
    fontFamily: "ElderFuthark",
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  buttonText: {
    color: "#1A1208",
    fontSize: 16,
    fontWeight: "600",
  },
});
