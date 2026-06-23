import React from "react";
import { render } from "@testing-library/react-native";
import { runes } from "../../data/runes";

const mockUseLocalSearchParams = jest.fn(() => ({ id: "Fehu" }));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}));

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
    },
  }),
}));

import RuneDetailsScreen from "../../rune/[id]";

describe("RuneDetailsScreen", () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: "Fehu" });
  });

  it("renders the rune name as the screen title", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    expect(fehu).toBeDefined();
    expect(getByText(fehu!.name)).toBeTruthy();
  });

  it("renders the rune symbol", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    expect(getByText(fehu!.symbol)).toBeTruthy();
  });

  it("renders the pronunciation", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    expect(getByText(fehu!.pronunciation)).toBeTruthy();
  });

  it("renders the Translation section", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    expect(getByText("Translation")).toBeTruthy();
    expect(getByText(fehu!.translation)).toBeTruthy();
  });

  it("renders the Primary Meaning section", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    expect(getByText("Primary Meaning")).toBeTruthy();
    expect(getByText(fehu!.meaning.primaryThemes)).toBeTruthy();
  });

  it("renders Additional Meanings when present", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    if (fehu!.meaning.additionalMeanings) {
      expect(getByText("Additional Meanings")).toBeTruthy();
      expect(getByText(fehu!.meaning.additionalMeanings)).toBeTruthy();
    }
  });

  it("renders Reversed Meaning when present", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    if (fehu!.meaning.reversed) {
      expect(getByText("Reversed Meaning")).toBeTruthy();
      expect(getByText(fehu!.meaning.reversed)).toBeTruthy();
    }
  });

  it("renders Historical Context", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    expect(getByText("Historical Context")).toBeTruthy();
    expect(getByText(fehu!.historicalContext)).toBeTruthy();
  });

  it("renders Associated Deities when present", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    if (fehu!.associations.godsGoddesses?.length) {
      expect(getByText("Associated Deities")).toBeTruthy();
    }
  });

  it("renders Keywords when present", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    if (fehu!.otherDetails.keywords?.length) {
      expect(getByText("Keywords")).toBeTruthy();
    }
  });

  it("renders Magical Uses when present", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    if (fehu!.otherDetails.magicalUses?.length) {
      expect(getByText("Magical Uses")).toBeTruthy();
    }
  });

  it("renders Elements when present", () => {
    const { getByText } = render(<RuneDetailsScreen />);
    const fehu = runes.find((r) => r.name === "Fehu");
    if (fehu!.otherDetails.elements?.length) {
      expect(getByText("Elements")).toBeTruthy();
    }
  });

  it("renders Rune not found when id does not match any rune", () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "NonexistentRune" });
    const { getByText } = render(<RuneDetailsScreen />);
    expect(getByText("Rune not found")).toBeTruthy();
  });
});
