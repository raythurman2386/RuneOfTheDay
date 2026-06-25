import React from "react";
import { Pressable } from "react-native";
import { Tabs } from "expo-router";
import type { BottomTabBarButtonProps } from "expo-router/build/react-navigation/bottom-tabs/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";
import RuneIcon from "../components/RuneIcon";
import SettingsIcon from "../components/SettingsIcon";

// Moved outside TabLayout so React treats it as a stable component type.
// Previously defined inside the render, causing all tab buttons to unmount
// and remount on every parent render (losing state, replaying animations).
const TabButton = ({ onPress, ref, ...props }: BottomTabBarButtonProps) => {
  const { lightFeedback } = useHaptics();
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        lightFeedback();
        onPress?.(e);
      }}
    />
  );
};

export default function TabLayout() {
  const { colors } = useColorTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
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
        headerRight: () => <SettingsIcon color={colors.text} />,
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
