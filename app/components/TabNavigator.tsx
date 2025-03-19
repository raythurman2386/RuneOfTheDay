import React from "react";
import { Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MainScreen from "../screens/MainScreen";
import FlashcardScreen from "../screens/FlashcardScreen";
import RuneIcon from "./RuneIcon";
import SettingsIcon from "./SettingsIcon";
import { useColorTheme } from "../hooks/useColorTheme";
import useHaptics from "../hooks/useHaptics";
import RunesStackNavigator from "./RunesStackNavigator";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { colors } = useColorTheme();
  const { lightFeedback } = useHaptics();

  return (
    <Tab.Navigator
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
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {
              lightFeedback();
              props.onPress?.(e);
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Today"
        component={MainScreen}
        options={{
          headerRight: () => <SettingsIcon color={colors.text} />,
          tabBarIcon: ({ color, size }) => (
            <RuneIcon symbol="ᚠ" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Runes"
        component={RunesStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <RuneIcon symbol="ᚱ" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Learn"
        component={FlashcardScreen}
        options={{
          headerRight: () => <SettingsIcon color={colors.text} />,
          tabBarIcon: ({ color, size }) => (
            <RuneIcon symbol="ᚨ" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
