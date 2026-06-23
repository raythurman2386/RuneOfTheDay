import { useEffect, useRef, useState } from "react";
import { Stack, router } from "expo-router";
import { View, ActivityIndicator, Platform } from "react-native";
import * as Font from "expo-font";
import * as Notifications from "expo-notifications";
import { SettingsProvider } from "./contexts/SettingsContext";
import { SplashScreen } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorTheme } from "./hooks/useColorTheme";

SplashScreen.preventAutoHideAsync();

interface InitialSettings {
  theme?: "system" | "light" | "dark";
  haptics?: boolean;
}

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <ActivityIndicator size="large" color="#000000" />
    </View>
  );
}

function RootLayoutNav() {
  const { colors } = useColorTheme();

  return (
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
          animationDuration: 200,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          contentStyle: {
            backgroundColor: colors.background,
          },
          presentation: "card",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialSettings, setInitialSettings] = useState<InitialSettings>({});
  const responseListener = useRef<Notifications.EventSubscription>();

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
        Notifications.removeNotificationSubscription(responseListener.current);
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
        const [savedTheme, savedHaptics] = await Promise.all([
          AsyncStorage.getItem("theme"),
          AsyncStorage.getItem("haptics"),
        ]);

        setInitialSettings({
          theme: (savedTheme as "system" | "light" | "dark") || "system",
          haptics: savedHaptics === null ? true : savedHaptics === "true",
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
      <RootLayoutNav />
    </SettingsProvider>
  );
}
