import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorSchemeName } from "react-native";

interface SettingsContextType {
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
  haptics: boolean;
  setHaptics: (enabled: boolean) => void;
}

interface SettingsProviderProps {
  children: React.ReactNode;
  initialSettings?: {
    theme?: "system" | "light" | "dark";
    haptics?: boolean;
  };
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  initialSettings = {},
}) => {
  const [theme, setTheme] = useState<"system" | "light" | "dark">(
    initialSettings.theme || "system"
  );
  const [haptics, setHaptics] = useState(
    initialSettings.haptics === undefined ? true : initialSettings.haptics
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Only load from storage if we don't have initial settings
        if (!initialSettings.theme) {
          const savedTheme = await AsyncStorage.getItem("theme");
          if (savedTheme) {
            setTheme(savedTheme as "system" | "light" | "dark");
          }
        }

        if (initialSettings.haptics === undefined) {
          const savedHaptics = await AsyncStorage.getItem("haptics");
          if (savedHaptics !== null) {
            setHaptics(savedHaptics === "true");
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [initialSettings]);

  const handleThemeChange = async (newTheme: "system" | "light" | "dark") => {
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const handleHapticsChange = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("haptics", String(enabled));
      setHaptics(enabled);
    } catch (error) {
      console.error("Error saving haptics setting:", error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme: handleThemeChange,
        haptics,
        setHaptics: handleHapticsChange,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
