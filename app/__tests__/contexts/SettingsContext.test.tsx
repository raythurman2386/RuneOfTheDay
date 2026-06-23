import { renderHook, act } from "@testing-library/react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings, SettingsProvider } from "../../contexts/SettingsContext";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);
wrapper.displayName = "SettingsWrapper";

const wrapperWithInitial = (initialSettings: {
  theme?: "system" | "light" | "dark";
  haptics?: boolean;
}) => {
  const Component = ({ children }: { children: React.ReactNode }) => (
    <SettingsProvider initialSettings={initialSettings}>
      {children}
    </SettingsProvider>
  );
  Component.displayName = "SettingsWrapperWithInitial";
  return Component;
};

describe("SettingsContext", () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("throws when useSettings is used outside SettingsProvider", () => {
    expect(() => {
      renderHook(() => useSettings());
    }).toThrow("useSettings must be used within a SettingsProvider");
  });

  it("provides default theme=system and haptics=true", async () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    expect(result.current.theme).toBe("system");
    expect(result.current.haptics).toBe(true);
  });

  it("uses initialSettings when provided", async () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: wrapperWithInitial({ theme: "dark", haptics: false }),
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.haptics).toBe(false);
  });

  it("loads theme from AsyncStorage when no initialSettings", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "theme") return Promise.resolve("dark");
      if (key === "haptics") return Promise.resolve("false");
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useSettings(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.haptics).toBe(false);
  });

  it("ignores invalid theme values from AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "theme") return Promise.resolve("purple");
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useSettings(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.theme).toBe("system");
  });

  it("setTheme persists to AsyncStorage and updates state", async () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    await act(async () => {
      await result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("setHaptics persists to AsyncStorage and updates state", async () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    await act(async () => {
      await result.current.setHaptics(false);
    });

    expect(result.current.haptics).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("haptics", "false");
  });

  it("does not reload from AsyncStorage when initialSettings are provided", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "theme") return Promise.resolve("dark");
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useSettings(), {
      wrapper: wrapperWithInitial({ theme: "light" }),
    });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.theme).toBe("light");
    expect(AsyncStorage.getItem).not.toHaveBeenCalledWith("theme");
  });
});
