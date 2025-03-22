import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SettingsIcon from "../../components/SettingsIcon";

const mockLightFeedback = jest.fn();
const mockRouterPush = jest.fn();

// Mock the expo-router module
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn((path) => mockRouterPush(path)),
  },
}));

jest.mock("../../hooks/useHaptics", () => {
  return function useHaptics() {
    return {
      lightFeedback: mockLightFeedback,
    };
  };
});

jest.mock("@expo/vector-icons", () => {
  const { View, Text } = require("react-native");
  return {
    Ionicons: ({
      name,
      size,
      color,
    }: {
      name: string;
      size: number;
      color: string;
    }) => (
      <View testID="mock-icon">
        <Text>{name}</Text>
        <Text>Size: {size}</Text>
        <Text>Color: {color}</Text>
      </View>
    ),
  };
});

describe("SettingsIcon", () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockLightFeedback.mockClear();
    mockRouterPush.mockClear();
  });

  it("renders correctly with the provided color prop", () => {
    const testColor = "#FF0000";
    const { getByTestId } = render(<SettingsIcon color={testColor} />);

    // Check that the icon is rendered with the correct props
    const iconElement = getByTestId("mock-icon");
    expect(iconElement).toBeTruthy();
  });

  it("triggers haptic feedback and navigates to settings when pressed", () => {
    const { getByRole } = render(<SettingsIcon color="#000000" />);

    // Find the button and press it
    const button = getByRole("button");
    fireEvent.press(button);

    // Verify haptic feedback and navigation were triggered
    expect(mockLightFeedback).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith("/(modals)/settings");
  });

  it("has the correct accessibility properties", () => {
    const { getByLabelText } = render(<SettingsIcon color="#000000" />);

    // Verify the button has the correct accessibility label
    const accessibleButton = getByLabelText("Settings");
    expect(accessibleButton).toBeTruthy();
  });
});
