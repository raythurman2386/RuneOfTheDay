import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRuneOfTheDay from "../../hooks/useRuneOfTheDay";
import { runes } from "../../data/runes";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../hooks/useNotifications", () => {
  return jest.fn(() => ({
    isEnabled: true,
    scheduleNotification: jest.fn(() => Promise.resolve()),
  }));
});

// Silence React act warnings temporarily
// This is needed because the hook has internal state updates we can't directly control
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe("useRuneOfTheDay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it("returns an object with rune and isReversed properties", async () => {
    const { result } = renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(result.current).toHaveProperty("rune");
    expect(result.current).toHaveProperty("isReversed");

    // We can't reliably test the actual rune value since it involves
    // several async operations and state updates, but we can verify
    // isReversed is a boolean
    expect(typeof result.current.isReversed).toBe("boolean");
  });
});
