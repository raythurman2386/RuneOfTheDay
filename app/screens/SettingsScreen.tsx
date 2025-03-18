import React from "react";
import { View, Text, Switch, StyleSheet, ScrollView } from "react-native";
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
        <View
          style={[
            styles.option,
            styles.optionBorder,
            { borderBottomColor: colors.background },
          ]}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>
            System
          </Text>
          <Switch
            value={theme === "system"}
            onValueChange={() => setTheme("system")}
            trackColor={{
              false: colors.tabIconDefault,
              true: colors.tabIconSelected,
            }}
            thumbColor={colors.background}
          />
        </View>
        <View
          style={[
            styles.option,
            styles.optionBorder,
            { borderBottomColor: colors.background },
          ]}
        >
          <Text style={[styles.optionText, { color: colors.text }]}>Light</Text>
          <Switch
            value={theme === "light"}
            onValueChange={() => setTheme("light")}
            trackColor={{
              false: colors.tabIconDefault,
              true: colors.tabIconSelected,
            }}
            thumbColor={colors.background}
          />
        </View>
        <View style={styles.option}>
          <Text style={[styles.optionText, { color: colors.text }]}>Dark</Text>
          <Switch
            value={theme === "dark"}
            onValueChange={() => setTheme("dark")}
            trackColor={{
              false: colors.tabIconDefault,
              true: colors.tabIconSelected,
            }}
            thumbColor={colors.background}
          />
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
});

export default SettingsScreen;
