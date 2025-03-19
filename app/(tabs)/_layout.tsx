import React from "react";
import { Pressable } from "react-native";
import { Tabs, router } from "expo-router";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";
import RuneIcon from "../components/RuneIcon";
import SettingsIcon from "../components/SettingsIcon";

interface TabButtonProps {
  onPress?: (e: any) => void;
  [key: string]: any;
}

export default function TabLayout() {
  const { colors } = useColorTheme();
  const { lightFeedback } = useHaptics();

  const handleSettingsPress = () => {
    lightFeedback();
    router.push("/(modals)/settings");
  };

  const TabButton = ({ onPress, ...props }: TabButtonProps) => (
    <Pressable
      {...props}
      onPress={(e) => {
        lightFeedback();
        onPress?.(e);
      }}
      accessibilityRole="button"
    />
  );

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: 75,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: {
          marginTop: 4,
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarButton: TabButton,
        headerRight: () => (
          <Pressable
            onPress={handleSettingsPress}
            style={{ marginRight: 16 }}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <SettingsIcon color={colors.text} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <RuneIcon symbol="ᚠ" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="runes"
        options={{
          title: "Runes",
          tabBarIcon: ({ color, size }) => (
            <RuneIcon symbol="ᚱ" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <RuneIcon symbol="ᚨ" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
