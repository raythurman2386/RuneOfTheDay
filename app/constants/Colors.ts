/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";
const reversedRuneLight = "rgba(200, 30, 30, 0.9)"; // Subtle red for light mode
const reversedRuneDark = "rgba(255, 80, 80, 0.9)"; // Brighter red for dark mode

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    surface: "#f5f5f5",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    reversedRune: reversedRuneLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    surface: "#222222",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    reversedRune: reversedRuneDark,
  },
};

export type ColorTheme = typeof Colors.light | typeof Colors.dark;
export type ThemeMode = keyof typeof Colors;

export default Colors;
