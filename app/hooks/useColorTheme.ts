import { useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { Colors } from "../constants/Colors";
import { useSettings } from "../contexts/SettingsContext";

export type ColorTheme = typeof Colors.light | typeof Colors.dark;

const useColorTheme = () => {
  const { theme } = useSettings();
  const [systemTheme, setSystemTheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });
    return () => listener.remove();
  }, []);

  const effectiveTheme = theme === "system" ? systemTheme : theme;
  const colors = effectiveTheme === "dark" ? Colors.dark : Colors.light;
  return { theme: effectiveTheme as ColorSchemeName, colors };
};

export { useColorTheme };
export default useColorTheme;
