import { renderHook, act } from "@testing-library/react-native";
import useHaptics from "../../hooks/useHaptics";
import { useSettings } from "../../contexts/SettingsContext";
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
    useSettings.mockReturnValueOnce({ haptics: false });

    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.successFeedback();
    });

    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it("should call Haptics.impactAsync with Heavy style when heavyFeedback is called", async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.heavyFeedback();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith("heavy");
  });

  it("should call Haptics.notificationAsync with Error type when errorFeedback is called", async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.errorFeedback();
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith("error");
  });

  it("should call Haptics.notificationAsync with Success type when successFeedback is called", async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.successFeedback();
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith("success");
  });

  it("should report isSupported as true on native platforms", () => {
    const { result } = renderHook(() => useHaptics());
    expect(result.current.isSupported).toBe(true);
  });

  it("should report isSupported as false on web", () => {
    Object.defineProperty(Platform, "OS", { get: () => "web" });

    const { result } = renderHook(() => useHaptics());
    expect(result.current.isSupported).toBe(false);
  });

  it("should silently handle haptics errors", async () => {
    const consoleSpy = jest
      .spyOn(console, "debug")
      .mockImplementation(() => {});
    Haptics.impactAsync.mockRejectedValueOnce(new Error("Haptics unavailable"));

    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.lightFeedback();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Haptics not available:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("should not call any haptics on web even when enabled", async () => {
    Object.defineProperty(Platform, "OS", { get: () => "web" });

    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      result.current.mediumFeedback();
      result.current.heavyFeedback();
      result.current.errorFeedback();
    });

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
