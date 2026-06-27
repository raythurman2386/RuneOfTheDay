import { renderHook, act } from "@testing-library/react-native";
import { useColorTheme } from "../../hooks/useColorTheme";
import { Colors } from "../../constants/Colors";

jest.mock("../../contexts/SettingsContext", () => ({
  useSettings: jest.fn().mockReturnValue({ theme: "light" }),
}));

jest.mock("react-native/Libraries/Utilities/Appearance", () => ({
  getColorScheme: jest.fn(() => "light"),
  addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
}));

describe("useColorTheme", () => {
  const mockUseSettings = jest.requireMock(
    "../../contexts/SettingsContext",
  ).useSettings;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns light theme when settings theme is light", () => {
    mockUseSettings.mockReturnValue({ theme: "light" });

    const { result } = renderHook(() => useColorTheme());

    expect(result.current.theme).toBe("light");
    expect(result.current.colors).toEqual(Colors.light);
  });

  it("returns dark theme when settings theme is dark", () => {
    mockUseSettings.mockReturnValue({ theme: "dark" });

    const { result } = renderHook(() => useColorTheme());

    expect(result.current.theme).toBe("dark");
    expect(result.current.colors).toEqual(Colors.dark);
  });

  it("follows system theme when settings theme is system", () => {
    mockUseSettings.mockReturnValue({ theme: "system" });
    jest
      .requireMock("react-native/Libraries/Utilities/Appearance")
      .getColorScheme.mockReturnValue("dark");

    const { result } = renderHook(() => useColorTheme());

    expect(result.current.theme).toBe("dark");
    expect(result.current.colors).toEqual(Colors.dark);
  });

  it("defaults to light when system returns null", () => {
    mockUseSettings.mockReturnValue({ theme: "system" });
    jest
      .requireMock("react-native/Libraries/Utilities/Appearance")
      .getColorScheme.mockReturnValue(null);

    const { result } = renderHook(() => useColorTheme());

    expect(result.current.theme).toBe("light");
    expect(result.current.colors).toEqual(Colors.light);
  });

  it("defaults to light when system returns undefined", () => {
    mockUseSettings.mockReturnValue({ theme: "system" });
    jest
      .requireMock("react-native/Libraries/Utilities/Appearance")
      .getColorScheme.mockReturnValue(undefined);

    const { result } = renderHook(() => useColorTheme());

    expect(result.current.theme).toBe("light");
    expect(result.current.colors).toEqual(Colors.light);
  });

  it("responds to system theme change listener", () => {
    mockUseSettings.mockReturnValue({ theme: "system" });
    const mockAppearance = jest.requireMock(
      "react-native/Libraries/Utilities/Appearance",
    );

    let changeCallback:
      | ((params: { colorScheme: string | null }) => void)
      | null = null;
    mockAppearance.addChangeListener.mockImplementation((cb: any) => {
      changeCallback = cb;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useColorTheme());

    // Initially light
    expect(result.current.theme).toBe("light");

    // Simulate system switching to dark
    act(() => {
      if (changeCallback) {
        changeCallback({ colorScheme: "dark" });
      }
    });

    expect(result.current.theme).toBe("dark");
    expect(result.current.colors).toEqual(Colors.dark);
  });

  it("falls back to light when system change returns null", () => {
    mockUseSettings.mockReturnValue({ theme: "system" });
    const mockAppearance = jest.requireMock(
      "react-native/Libraries/Utilities/Appearance",
    );

    let changeCallback:
      | ((params: { colorScheme: string | null }) => void)
      | null = null;
    mockAppearance.addChangeListener.mockImplementation((cb: any) => {
      changeCallback = cb;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useColorTheme());

    act(() => {
      if (changeCallback) {
        changeCallback({ colorScheme: null });
      }
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.colors).toEqual(Colors.light);
  });

  it("removes the change listener on unmount", () => {
    const mockRemove = jest.fn();
    const mockAppearance = jest.requireMock(
      "react-native/Libraries/Utilities/Appearance",
    );
    mockAppearance.addChangeListener.mockReturnValue({ remove: mockRemove });

    const { unmount } = renderHook(() => useColorTheme());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
