import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Platform,
  useColorScheme,
} from "react-native";
import { useSettings } from "../contexts/SettingsContext";
import { useColorTheme } from "../hooks/useColorTheme";
import { Stack } from "expo-router";

export default function SettingsScreen() {
  const { theme, setTheme, haptics, setHaptics } = useSettings();
  const { colors } = useColorTheme();
  const systemColorScheme = useColorScheme();

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Settings",
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
        }} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          <View style={styles.optionsContainer}>
            <Pressable
              style={[
                styles.themeButton,
                {
                  backgroundColor:
                    theme === "system" ? colors.tint : colors.surface,
                  borderColor: colors.icon,
                },
              ]}
              onPress={() => setTheme("system")}
              accessibilityLabel="Use system theme"
              accessibilityRole="button"
              accessibilityState={{ selected: theme === "system" }}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color:
                      theme === "system"
                        ? colors.background
                        : colors.text,
                  },
                ]}
              >
                System
              </Text>
              <Text
                style={[
                  styles.themeButtonSubtext,
                  {
                    color:
                      theme === "system"
                        ? colors.background
                        : colors.icon,
                  },
                ]}
              >
                {systemColorScheme === "dark" ? "Dark" : "Light"}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.themeButton,
                {
                  backgroundColor:
                    theme === "light" ? colors.tint : colors.surface,
                  borderColor: colors.icon,
                },
              ]}
              onPress={() => setTheme("light")}
              accessibilityLabel="Use light theme"
              accessibilityRole="button"
              accessibilityState={{ selected: theme === "light" }}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color:
                      theme === "light"
                        ? colors.background
                        : colors.text,
                  },
                ]}
              >
                Light
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.themeButton,
                {
                  backgroundColor:
                    theme === "dark" ? colors.tint : colors.surface,
                  borderColor: colors.icon,
                },
              ]}
              onPress={() => setTheme("dark")}
              accessibilityLabel="Use dark theme"
              accessibilityRole="button"
              accessibilityState={{ selected: theme === "dark" }}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color:
                      theme === "dark"
                        ? colors.background
                        : colors.text,
                  },
                ]}
              >
                Dark
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Haptics
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Enable haptic feedback
            </Text>
            <Switch
              value={haptics}
              onValueChange={setHaptics}
              trackColor={{ false: colors.icon, true: colors.tint }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : haptics
                  ? colors.background
                  : "#f4f3f4"
              }
              ios_backgroundColor={colors.icon}
            />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  themeButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  themeButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
