import { useEffect, useRef, useState } from "react";
import { Stack, router, SplashScreen } from "expo-router";
import { View, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Font from "expo-font";
import * as Notifications from "expo-notifications";
import { SettingsProvider } from "./contexts/SettingsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorTheme } from "./hooks/useColorTheme";

SplashScreen.preventAutoHideAsync();

interface InitialSettings {
  theme?: "system" | "light" | "dark";
  haptics?: boolean;
  dailyResetHour?: number;
  dailyResetMinute?: number;
}

function LoadingScreen() {
  const { colors } = useColorTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

function RootLayoutNav() {
  const { colors, theme } = useColorTheme();

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)/settings"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Settings",
            animation: Platform.select({
              ios: "default",
              android: "fade",
            }),
          }}
        />
        <Stack.Screen
          name="rune/[id]"
          options={{
            headerShown: true,
            animation: "default",
            animationDuration: 250,
            gestureEnabled: true,
            gestureDirection: "horizontal",
            contentStyle: {
              backgroundColor: colors.background,
            },
            presentation: "card",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialSettings, setInitialSettings] = useState<InitialSettings>({});
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined,
  );

  useEffect(() => {
    // Tap (response) handling lives here so the router is in scope. Switches
    // to the Today tab when the user taps a daily rune notification. Use
    // replace for a cold start (no existing stack) and navigate otherwise.
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        try {
          if (router.canGoBack()) {
            router.navigate("/(tabs)");
          } else {
            router.replace("/(tabs)");
          }
        } catch (error) {
          console.error("Error navigating from notification:", error);
        }
      });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Load font
        await Font.loadAsync({
          ElderFuthark: require("../assets/fonts/rune.ttf"),
        });

        // Load initial settings
        const [
          savedTheme,
          savedHaptics,
          savedDailyResetHour,
          savedDailyResetMinute,
        ] = await Promise.all([
          AsyncStorage.getItem("theme"),
          AsyncStorage.getItem("haptics"),
          AsyncStorage.getItem("dailyResetHour"),
          AsyncStorage.getItem("dailyResetMinute"),
        ]);

        const parsedHour =
          savedDailyResetHour !== null ? parseInt(savedDailyResetHour, 10) : 6;
        const parsedMinute =
          savedDailyResetMinute !== null
            ? parseInt(savedDailyResetMinute, 10)
            : 0;

        setInitialSettings({
          theme: (savedTheme as "system" | "light" | "dark") || "system",
          haptics: savedHaptics === null ? true : savedHaptics === "true",
          dailyResetHour: Number.isNaN(parsedHour) ? 6 : parsedHour,
          dailyResetMinute: Number.isNaN(parsedMinute) ? 0 : parsedMinute,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SettingsProvider initialSettings={initialSettings}>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </SettingsProvider>
  );
}
