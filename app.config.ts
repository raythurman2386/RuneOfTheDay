import type { ExpoConfig, ConfigContext } from "expo/config";
import type { WithAndroidWidgetsParams } from "react-native-android-widget";

const widgetConfig: WithAndroidWidgetsParams = {
  // Custom fonts used in widgets — the ElderFuthark rune font + Inter
  fonts: ["./assets/fonts/rune.ttf"],
  widgets: [
    {
      name: "RuneCompact",
      label: "Daily Rune (Compact)",
      description:
        "Shows today's rune symbol and name — compact 2x2 format with no meaning text.",
      // 2x2 cells — small, just the rune and name
      targetCellWidth: 2,
      targetCellHeight: 2,
      // Fallback for Android 11 and below
      minWidth: "140dp",
      minHeight: "140dp",
      // Preview image shown in the widget picker
      previewImage: "./assets/images/widget-preview.png",
      // Update every 30 minutes (minimum allowed)
      updatePeriodMillis: 1800000,
    },
    {
      name: "Rune",
      label: "Daily Rune",
      description: "Shows today's Elder Futhark rune and its meaning.",
      // 3x2 cells — fits most phones with room for the meaning text
      targetCellWidth: 3,
      targetCellHeight: 2,
      // Fallback for Android 11 and below
      minWidth: "220dp",
      minHeight: "180dp",
      // Preview image shown in the widget picker
      previewImage: "./assets/images/widget-preview.png",
      // Update every 30 minutes (minimum allowed)
      updatePeriodMillis: 1800000,
    },
    {
      name: "RuneWide",
      label: "Daily Rune (Wide)",
      description:
        "Shows today's Elder Futhark rune and its meaning in a wider format.",
      // 4x2 cells — full width on most phones, extra room on large phones
      targetCellWidth: 4,
      targetCellHeight: 2,
      // Fallback for Android 11 and below
      minWidth: "320dp",
      minHeight: "180dp",
      // Preview image shown in the widget picker
      previewImage: "./assets/images/widget-preview.png",
      // Update every 30 minutes (minimum allowed)
      updatePeriodMillis: 1800000,
    },
    {
      name: "RuneWide4x1",
      label: "Daily Rune (Wide, Short)",
      description:
        "Shows today's rune symbol and name in a short, wide 4x1 strip — no meaning text.",
      // 4x1 cells — full width, single row height
      targetCellWidth: 4,
      targetCellHeight: 1,
      // Fallback for Android 11 and below
      minWidth: "320dp",
      minHeight: "80dp",
      // Preview image shown in the widget picker
      previewImage: "./assets/images/widget-preview.png",
      // Update every 30 minutes (minimum allowed)
      updatePeriodMillis: 1800000,
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Rune Of The Day",
  slug: "RuneOfTheDay",
  version: "1.2.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "runeoftheday",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.ravenwoodcreations.runeoftheday",
    buildNumber: "3",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.ravenwoodcreations.runeoftheday",
    versionCode: 21,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    permissions: [
      "android.permissions.POST_NOTIFICATIONS",
      "android.permission.VIBRATE",
      "android.permissions.RECEIVE_BOOT_COMPLETED",
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-light.png",
        dark: {
          image: "./assets/images/splash-dark.png",
          backgroundColor: "#000000",
        },
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          minifyEnabled: true,
          shrinkResourcesEnabled: true,
        },
      },
    ],
    ["react-native-android-widget", widgetConfig],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "9c9afc04-4c7e-43c1-8df6-9d6da0246503",
    },
  },
});
