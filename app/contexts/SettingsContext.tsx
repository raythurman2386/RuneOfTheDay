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

const DEFAULT_DAILY_RESET_HOUR = 6;
const DEFAULT_DAILY_RESET_MINUTE = 0;
const VALID_MINUTES = [0, 15, 30, 45];

interface SettingsContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  haptics: boolean;
  setHaptics: (enabled: boolean) => void;
  dailyResetHour: number;
  dailyResetMinute: number;
  setDailyResetTime: (hour: number, minute: number) => void;
}

interface SettingsProviderProps {
  children: React.ReactNode;
  initialSettings?: {
    theme?: ThemeMode;
    haptics?: boolean;
    dailyResetHour?: number;
    dailyResetMinute?: number;
  };
}

const VALID_THEMES: ThemeMode[] = ["system", "light", "dark"];

const isThemeMode = (value: string | null): value is ThemeMode =>
  value !== null && VALID_THEMES.includes(value as ThemeMode);

const isValidHour = (value: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= 23;

const isValidMinute = (value: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= 59;

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
  const [dailyResetHour, setDailyResetHour] = useState<number>(
    initialSettings.dailyResetHour ?? DEFAULT_DAILY_RESET_HOUR,
  );
  const [dailyResetMinute, setDailyResetMinute] = useState<number>(
    initialSettings.dailyResetMinute ?? DEFAULT_DAILY_RESET_MINUTE,
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

        if (initialSettings.dailyResetHour === undefined) {
          const savedHour = await AsyncStorage.getItem("dailyResetHour");
          if (savedHour !== null) {
            const parsed = parseInt(savedHour, 10);
            if (isValidHour(parsed)) {
              setDailyResetHour(parsed);
            }
          }
        }

        if (initialSettings.dailyResetMinute === undefined) {
          const savedMinute = await AsyncStorage.getItem("dailyResetMinute");
          if (savedMinute !== null) {
            const parsed = parseInt(savedMinute, 10);
            if (isValidMinute(parsed)) {
              setDailyResetMinute(parsed);
            }
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

  const handleDailyResetTimeChange = useCallback(
    async (hour: number, minute: number) => {
      if (!isValidHour(hour) || !isValidMinute(minute)) {
        return;
      }
      try {
        await Promise.all([
          AsyncStorage.setItem("dailyResetHour", String(hour)),
          AsyncStorage.setItem("dailyResetMinute", String(minute)),
        ]);
        setDailyResetHour(hour);
        setDailyResetMinute(minute);
      } catch (error) {
        console.error("Error saving daily reset time:", error);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme: handleThemeChange,
      haptics,
      setHaptics: handleHapticsChange,
      dailyResetHour,
      dailyResetMinute,
      setDailyResetTime: handleDailyResetTimeChange,
    }),
    [
      theme,
      haptics,
      dailyResetHour,
      dailyResetMinute,
      handleThemeChange,
      handleHapticsChange,
      handleDailyResetTimeChange,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export { VALID_MINUTES };
