import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MainScreen from "../../screens/MainScreen";
import {
  mockColorTheme,
  mockHaptics,
  mockRuneOfTheDay,
} from "../../__mocks__/mockHooks";

jest.mock("../../hooks/useColorTheme", () => ({
  __esModule: true,
  default: jest.fn(() => mockColorTheme),
  useColorTheme: jest.fn(() => mockColorTheme),
}));

jest.mock("../../hooks/useHaptics", () => ({
  __esModule: true,
  default: jest.fn(() => mockHaptics),
}));

jest.mock("../../hooks/useRuneOfTheDay", () => ({
  __esModule: true,
  default: jest.fn(() => mockRuneOfTheDay),
}));

describe("MainScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state when rune is not available", () => {
    // Override the mock to return null rune
    const loadingMock = {
      rune: null,
      isReversed: false,
      isLoading: true,
      error: null,
    };

    jest
      .requireMock("../../hooks/useRuneOfTheDay")
      .default.mockReturnValueOnce(loadingMock);

    const { getByText, getByTestId } = render(<MainScreen />);

    expect(getByTestId("main-container")).toBeTruthy();
    expect(getByText("Loading...")).toBeTruthy();
  });

  it("renders the rune information when rune is available", () => {
    const { getByText, getByTestId } = render(<MainScreen />);

    expect(getByTestId("main-container")).toBeTruthy();
    expect(getByText("Rune of the Day")).toBeTruthy();
    expect(getByText("Fehu")).toBeTruthy();
    expect(getByText("fey-who")).toBeTruthy();
    expect(getByText("Primary Meaning")).toBeTruthy();
    expect(getByText("Wealth, prosperity, abundance, reward.")).toBeTruthy();
    expect(getByText("Associated Deities")).toBeTruthy();
    expect(getByText("Freyr, Freya")).toBeTruthy();
  });

  it("calls haptic feedback when the rune is pressed", () => {
    const { getByText, getByTestId } = render(<MainScreen />);

    const runeSymbol = getByText("ᚠ");

    if (runeSymbol && runeSymbol.parent) {
      fireEvent.press(runeSymbol.parent);

      expect(mockHaptics.mediumFeedback).toHaveBeenCalledTimes(1);
    } else {
      const runeContainer = getByTestId("main-container");
      fireEvent.press(runeContainer);
      expect(mockHaptics.mediumFeedback).toHaveBeenCalledTimes(1);
    }
  });

  it("calls success feedback on initial render when rune is available", () => {
    render(<MainScreen />);

    expect(mockHaptics.successFeedback).toHaveBeenCalledTimes(1);
  });

  it("renders reversed meaning when rune is reversed", () => {
    const reversedMock = {
      ...mockRuneOfTheDay,
      isReversed: true,
    };

    jest
      .requireMock("../../hooks/useRuneOfTheDay")
      .default.mockReturnValueOnce(reversedMock);

    const { getByText } = render(<MainScreen />);

    expect(getByText("Reversed Meaning")).toBeTruthy();
    expect(getByText("Loss of wealth or self-esteem.")).toBeTruthy();
  });
});
