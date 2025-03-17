import { useState, useEffect } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { Colors } from "../constants/Colors";

export type ColorTheme = typeof Colors.light | typeof Colors.dark;

const useColorTheme = () => {
  const [theme, setTheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => listener.remove();
  }, []);

  const colors = theme === "dark" ? Colors.dark : Colors.light;
  return { theme, colors };
};

export { useColorTheme };
export default useColorTheme;
