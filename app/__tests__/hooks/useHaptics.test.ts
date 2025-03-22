import { renderHook, act } from "@testing-library/react-native";
import useHaptics from "../../hooks/useHaptics";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Error: "error",
    Warning: "warning",
  },
}));

jest.mock("../../contexts/SettingsContext", () => ({
  useSettings: jest.fn(() => ({
    haptics: true,
  })),
}));

const originalPlatform = { ...Platform };

describe("useHaptics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", { get: () => originalPlatform.OS });
  });

  it("should provide haptic feedback methods", () => {
    const { result } = renderHook(() => useHaptics());

    expect(result.current).toHaveProperty("lightFeedback");
    expect(result.current).toHaveProperty("mediumFeedback");
    expect(result.current).toHaveProperty("heavyFeedback");
    expect(result.current).toHaveProperty("successFeedback");
    expect(result.current).toHaveProperty("errorFeedback");
  });

  it("should call Haptics.impactAsync with Light style when lightFeedback is called", async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.lightFeedback();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
  });

  it("should call Haptics.impactAsync with Medium style when mediumFeedback is called", async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.mediumFeedback();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith("medium");
  });

  it("should not call haptics on web platform", async () => {
    Object.defineProperty(Platform, "OS", { get: () => "web" });

    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.lightFeedback();
    });

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it("should not call haptics when haptics setting is disabled", async () => {
    const useSettings = require("../../contexts/SettingsContext").useSettings;
    useSettings.mockReturnValueOnce({ haptics: false });

    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.successFeedback();
    });

    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
