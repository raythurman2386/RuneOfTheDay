import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RunesScreen from "../../(tabs)/runes";
import { runes } from "../../data/runes";
import { router } from "expo-router";

jest.mock("../../hooks/useColorTheme", () => ({
  useColorTheme: () => ({
    theme: "light" as const,
    colors: {
      background: "#000000",
      surface: "#111111",
      text: "#ffffff",
      icon: "#888888",
      tint: "#FF231F7C",
      tabIconSelected: "#ffffff",
      tabIconDefault: "#888888",
      reversedRune: "#FF0000",
      border: "#333333",
      accent: "#D4A857",
    },
  }),
}));

jest.mock("../../hooks/useHaptics", () => ({
  __esModule: true,
  default: () => ({
    lightFeedback: jest.fn(),
    mediumFeedback: jest.fn(),
    heavyFeedback: jest.fn(),
    successFeedback: jest.fn(),
    errorFeedback: jest.fn(),
  }),
}));

jest.mock("expo-router", () => ({
  __esModule: true,
  router: {
    push: jest.fn(),
  },
}));

describe("RunesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders without crashing", () => {
    const { getByTestId } = render(<RunesScreen />);
    // The FlatList is rendered inside a View — verify it doesn't crash
    expect(getByTestId).toBeDefined();
  });

  it("renders the first rune name in the list", () => {
    const { getByText } = render(<RunesScreen />);
    expect(getByText(runes[0].name)).toBeTruthy();
  });

  it("renders the first rune symbol in the list", () => {
    const { getByText } = render(<RunesScreen />);
    expect(getByText(runes[0].symbol)).toBeTruthy();
  });

  it("renders the first rune pronunciation in the list", () => {
    const { getByText } = render(<RunesScreen />);
    expect(getByText(runes[0].pronunciation)).toBeTruthy();
  });

  it("renders the first rune primary themes in the list", () => {
    const { getByText } = render(<RunesScreen />);
    expect(getByText(runes[0].meaning.primaryThemes)).toBeTruthy();
  });

  it("renders deities for the first rune when present", () => {
    const { getByText } = render(<RunesScreen />);
    if (runes[0].associations.godsGoddesses) {
      expect(
        getByText(`Deities: ${runes[0].associations.godsGoddesses.join(", ")}`),
      ).toBeTruthy();
    }
  });

  it("renders multiple runes in the list", () => {
    const { getByText } = render(<RunesScreen />);
    expect(getByText(runes[0].name)).toBeTruthy();
    expect(getByText(runes[1].name)).toBeTruthy();
  });

  it("navigates to rune detail when a rune is pressed", () => {
    const { getByText } = render(<RunesScreen />);
    const runeItem = getByText(runes[0].name);

    fireEvent.press(runeItem);

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/rune/[id]",
      params: { id: runes[0].name },
    });
  });

  it("navigates to the correct rune for each item pressed", () => {
    const { getByText } = render(<RunesScreen />);

    fireEvent.press(getByText(runes[1].name));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/rune/[id]",
      params: { id: runes[1].name },
    });
  });
});
