import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, SafeAreaView } from "react-native";
import * as Font from "expo-font";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import MainScreen from "./screens/MainScreen";
import RuneListScreen from "./screens/RuneListScreen";
import FlashcardScreen from "./screens/FlashcardScreen";
import RuneIcon from "./components/RuneIcon";
import CustomTabBar from "./components/CustomTabBar";
import { useColorTheme } from "./hooks/useColorTheme";

const Tab = createBottomTabNavigator();

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const { theme, colors } = useColorTheme();

  useEffect(() => {
    const loadFont = async () => {
      await Font.loadAsync({
        ElderFuthark: require("../assets/fonts/rune.ttf"),
      });
      setFontLoaded(true);
    };
    loadFont();
  }, []);

  if (!fontLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
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
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.icon,
        }}
      >
        <Tab.Screen
          name="Today"
          component={MainScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <RuneIcon symbol="ᚠ" color={color} size={size} />
            ), // Fehu
            tabBarLabel: "Today",
          }}
        />
        <Tab.Screen
          name="Runes"
          component={RuneListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <RuneIcon symbol="ᚱ" color={color} size={size} />
            ), // Raidho
            tabBarLabel: "Runes",
          }}
        />
        <Tab.Screen
          name="Learn"
          component={FlashcardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <RuneIcon symbol="ᚨ" color={color} size={size} />
            ), // Ansuz
            tabBarLabel: "Learn",
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default App;
