import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "system" | "light" | "dark";

interface SettingsContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  haptics: boolean;
  setHaptics: (enabled: boolean) => void;
}

interface SettingsProviderProps {
  children: React.ReactNode;
  initialSettings?: {
    theme?: ThemeMode;
    haptics?: boolean;
  };
}

const VALID_THEMES: ThemeMode[] = ["system", "light", "dark"];

const isThemeMode = (value: string | null): value is ThemeMode =>
  value !== null && VALID_THEMES.includes(value as ThemeMode);

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
  const [theme, setTheme] = useState<ThemeMode>(
    initialSettings.theme || "system",
  );
  const [haptics, setHaptics] = useState(
    initialSettings.haptics === undefined ? true : initialSettings.haptics,
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!initialSettings.theme) {
          const savedTheme = await AsyncStorage.getItem("theme");
          if (isThemeMode(savedTheme)) {
            setTheme(savedTheme);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeChange = useCallback(async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }, []);

  const handleHapticsChange = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem("haptics", String(enabled));
      setHaptics(enabled);
    } catch (error) {
      console.error("Error saving haptics setting:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: handleThemeChange,
      haptics,
      setHaptics: handleHapticsChange,
    }),
    [theme, haptics, handleThemeChange, handleHapticsChange],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
