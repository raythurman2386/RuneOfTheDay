import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export const useColorTheme = (): ColorSchemeName => {
  const [theme, setTheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => listener.remove();
  }, []);

  return theme;
};