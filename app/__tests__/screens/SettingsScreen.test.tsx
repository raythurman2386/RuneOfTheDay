import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

const mockSetTheme = jest.fn();
const mockSetHaptics = jest.fn();
const mockRequestPermissions = jest.fn(() => Promise.resolve(true));

jest.mock("../../contexts/SettingsContext", () => ({
  useSettings: jest.fn(() => ({
    theme: "system" as const,
    setTheme: mockSetTheme,
    haptics: true,
    setHaptics: mockSetHaptics,
  })),
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

jest.mock("../../hooks/useNotifications", () => ({
  __esModule: true,
  default: () => ({
    isEnabled: false,
    requestPermissions: mockRequestPermissions,
    scheduleNotification: jest.fn(() => Promise.resolve(true)),
    cancelNotification: jest.fn(() => Promise.resolve()),
    cancelAllNotifications: jest.fn(() => Promise.resolve()),
  }),
}));

jest.mock("expo-router", () => ({
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}));

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  __esModule: true,
  default: jest.fn(() => "light"),
}));

// Import after mocks are set up
import SettingsScreen from "../../(modals)/settings";
import { useSettings } from "../../contexts/SettingsContext";

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Appearance section", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Appearance")).toBeTruthy();
  });

  it("renders three theme buttons: System, Light, Dark", () => {
    const { getByLabelText } = render(<SettingsScreen />);
    expect(getByLabelText("Use system theme")).toBeTruthy();
    expect(getByLabelText("Use light theme")).toBeTruthy();
    expect(getByLabelText("Use dark theme")).toBeTruthy();
  });

  it("calls setTheme('system') when System button pressed", () => {
    const { getByLabelText } = render(<SettingsScreen />);
    fireEvent.press(getByLabelText("Use system theme"));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("calls setTheme('light') when Light button pressed", () => {
    const { getByLabelText } = render(<SettingsScreen />);
    fireEvent.press(getByLabelText("Use light theme"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("calls setTheme('dark') when Dark button pressed", () => {
    const { getByLabelText } = render(<SettingsScreen />);
    fireEvent.press(getByLabelText("Use dark theme"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("shows the Haptics section with toggle label", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Haptics")).toBeTruthy();
    expect(getByText("Enable haptic feedback")).toBeTruthy();
  });

  it("shows the Notifications section with Disabled status", () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText("Notifications")).toBeTruthy();
    expect(getByText("Daily rune notifications")).toBeTruthy();
    expect(getByText("Disabled")).toBeTruthy();
    expect(getByText("Enable")).toBeTruthy();
  });

  it("has accessibility labels for theme buttons", () => {
    const { getByLabelText } = render(<SettingsScreen />);
    expect(getByLabelText("Use system theme")).toBeTruthy();
    expect(getByLabelText("Use light theme")).toBeTruthy();
    expect(getByLabelText("Use dark theme")).toBeTruthy();
  });

  it("has accessibility label for notification management button", () => {
    const { getByLabelText } = render(<SettingsScreen />);
    expect(getByLabelText("Enable notifications")).toBeTruthy();
  });
});
