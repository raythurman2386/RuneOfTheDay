/**
 * Color palette for Rune of the Day.
 *
 * The dark theme draws from a Norse-inspired aesthetic: deep charcoal
 * backgrounds, warm gold accents, and muted blue-gray text — mirroring the
 * landing page at docs/index.html.
 *
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Shared accent — warm gold used for headings, selected states, and highlights
const gold = "#B8860B"; // Dark goldenrod — readable on light backgrounds
const goldBright = "#D4A857"; // Brighter gold for dark mode

const reversedRuneLight = "rgba(180, 30, 30, 0.85)";
const reversedRuneDark = "rgba(255, 90, 90, 0.9)";

export const Colors = {
  light: {
    text: "#1A1A2E",
    background: "#FAFAF7",
    surface: "#F0EDE5",
    tint: gold,
    icon: "#6B6B7B",
    tabIconDefault: "#8A8A99",
    tabIconSelected: gold,
    reversedRune: reversedRuneLight,
    border: "#D8D4C7",
    accent: gold,
  },
  dark: {
    text: "#E6EDF3",
    background: "#0D1117",
    surface: "#1C2128",
    tint: goldBright,
    icon: "#9DA7B3",
    tabIconDefault: "#6B7280",
    tabIconSelected: goldBright,
    reversedRune: reversedRuneDark,
    border: "#30363D",
    accent: goldBright,
  },
};

export type ColorTheme = typeof Colors.light | typeof Colors.dark;
export type ThemeMode = keyof typeof Colors;

export default Colors;
