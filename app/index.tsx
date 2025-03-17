import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, SafeAreaView } from "react-native";
import * as Font from "expo-font";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import MainScreen from "./screens/MainScreen";
import RuneListScreen from "./screens/RuneListScreen";
import FlashcardScreen from "./screens/FlashcardScreen";
import RuneIcon from "./components/RuneIcon";
import { useColorTheme } from "./hooks/useColorTheme";

const Tab = createBottomTabNavigator();

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const theme = useColorTheme();
  const isDark = theme === "dark";

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
          backgroundColor: isDark ? "#000" : "#fff",
        }}
      >
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#000" : "#fff",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: isDark ? "#fff" : "#000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          tabBarStyle: {
            backgroundColor: isDark ? "#111" : "#f5f5f5",
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: isDark ? "#fff" : "#000",
          tabBarInactiveTintColor: isDark ? "#666" : "#999",
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
              <RuneIcon symbol="ᚴ" color={color} size={size} />
            ), // Hló
            tabBarLabel: "Learn",
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default App;
