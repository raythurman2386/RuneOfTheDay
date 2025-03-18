import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorSchemeName } from "react-native";

interface SettingsContextType {
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
  haptics: boolean;
  setHaptics: (enabled: boolean) => void;
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

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [haptics, setHaptics] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme as "system" | "light" | "dark");
        }

        const savedHaptics = await AsyncStorage.getItem("haptics");
        if (savedHaptics !== null) {
          setHaptics(savedHaptics === "true");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

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
