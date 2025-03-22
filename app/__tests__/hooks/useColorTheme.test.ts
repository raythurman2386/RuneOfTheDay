import { renderHook } from "@testing-library/react-native";
import useColorTheme from "../../hooks/useColorTheme";
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
});
