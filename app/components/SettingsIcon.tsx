import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useHaptics from "../hooks/useHaptics";

interface SettingsIconProps {
  color: string;
}

const SettingsIcon = ({ color }: SettingsIconProps) => {
  const { lightFeedback } = useHaptics();

  const handlePress = () => {
    lightFeedback();
    router.push("/(modals)/settings");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityLabel="Settings"
      accessibilityRole="button"
    >
      <Ionicons name="settings-outline" size={24} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
});

export default SettingsIcon;
