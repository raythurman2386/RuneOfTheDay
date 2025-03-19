import React from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSettings } from "../contexts/SettingsContext";
import { useColorTheme } from "../hooks/useColorTheme";
import { useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
  const { theme, setTheme, haptics, setHaptics } = useSettings();
  const { colors } = useColorTheme();
  const navigation = useNavigation();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
        <View style={styles.themeButtonContainer}>
          <Pressable
            style={[
              styles.themeButton,
              theme === "system" && [
                styles.themeButtonActive,
                { backgroundColor: colors.tabIconSelected },
              ],
              { borderColor: colors.text },
            ]}
            onPress={() => setTheme("system")}
            accessibilityLabel="System theme"
            accessibilityRole="button"
            accessibilityState={{ selected: theme === "system" }}
          >
            <Text
              style={[
                styles.themeButtonText,
                { color: theme === "system" ? colors.background : colors.text },
              ]}
            >
              System
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.themeButton,
              theme === "light" && [
                styles.themeButtonActive,
                { backgroundColor: colors.tabIconSelected },
              ],
              { borderColor: colors.text },
            ]}
            onPress={() => setTheme("light")}
            accessibilityLabel="Light theme"
            accessibilityRole="button"
            accessibilityState={{ selected: theme === "light" }}
          >
            <Text
              style={[
                styles.themeButtonText,
                { color: theme === "light" ? colors.background : colors.text },
              ]}
            >
              Light
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.themeButton,
              theme === "dark" && [
                styles.themeButtonActive,
                { backgroundColor: colors.tabIconSelected },
              ],
              { borderColor: colors.text },
            ]}
            onPress={() => setTheme("dark")}
            accessibilityLabel="Dark theme"
            accessibilityRole="button"
            accessibilityState={{ selected: theme === "dark" }}
          >
            <Text
              style={[
                styles.themeButtonText,
                { color: theme === "dark" ? colors.background : colors.text },
              ]}
            >
              Dark
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Haptics
        </Text>
        <View style={styles.option}>
          <Text style={[styles.optionText, { color: colors.text }]}>
            Enable Haptic Feedback
          </Text>
          <Switch
            value={haptics}
            onValueChange={setHaptics}
            trackColor={{
              false: colors.tabIconDefault,
              true: colors.tabIconSelected,
            }}
            thumbColor={colors.background}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionBorder: {
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  themeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  themeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  themeButtonActive: {
    // The backgroundColor is now applied directly in the component
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SettingsScreen;
