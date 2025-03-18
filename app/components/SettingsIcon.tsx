import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import useHaptics from "../hooks/useHaptics";

type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SettingsIconProps {
  color: string;
}

const SettingsIcon = ({ color }: SettingsIconProps) => {
  const navigation = useNavigation<NavigationProp>();
  const { lightFeedback } = useHaptics();

  const handlePress = () => {
    lightFeedback();
    navigation.getParent()?.navigate("Settings");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Ionicons name="settings-outline" size={24} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 8,
  },
});

export default SettingsIcon;
