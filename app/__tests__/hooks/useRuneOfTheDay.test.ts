import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRuneOfTheDay from "../../hooks/useRuneOfTheDay";
import { runes } from "../../data/runes";

const mockScheduleNotification = jest.fn(() => Promise.resolve(true));

jest.mock("../../hooks/useNotifications", () => ({
  __esModule: true,
  default: () => ({
    isEnabled: true,
    requestPermissions: jest.fn(() => Promise.resolve(true)),
    scheduleNotification: mockScheduleNotification,
    cancelNotification: jest.fn(() => Promise.resolve()),
    cancelAllNotifications: jest.fn(() => Promise.resolve()),
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

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

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("useRuneOfTheDay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns an object with rune and isReversed properties", async () => {
    const { result } = renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    expect(result.current).toHaveProperty("rune");
    expect(result.current).toHaveProperty("isReversed");
    expect(typeof result.current.isReversed).toBe("boolean");
  });

  it("schedules a daily notification for the picked rune on first run", async () => {
    const runeIndex = 5;
    const isReversed = false;
    const randomSpy = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(runeIndex / runes.length)
      .mockReturnValueOnce(isReversed ? 0.1 : 0.9);

    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    expect(randomSpy).toHaveBeenCalled();
    expect(mockScheduleNotification).toHaveBeenCalledTimes(1);

    const call = mockScheduleNotification.mock.calls[0];
    const [title, body, triggerDate, identifier, repeatsDaily] = call;
    const expectedRune = runes[runeIndex];

    expect(identifier).toBe("runeOfTheDayNotification");
    expect(repeatsDaily).toBe(true);
    expect(title).toContain(expectedRune.symbol);
    expect(body).toContain(expectedRune.name);
    expect(body).toContain(expectedRune.meaning.primaryThemes);

    const expectedHour = 6;
    expect(triggerDate.getHours()).toBe(expectedHour);
    expect(triggerDate.getMinutes()).toBe(0);

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, valueStr] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(key).toBe("runeOfTheDay");
    const persisted = JSON.parse(valueStr);
    expect(persisted.index).toBe(runeIndex);
    expect(persisted.isReversed).toBe(isReversed);
    expect(persisted.date).toBe(new Date().toISOString().split("T")[0]);
  });

  it("uses the reversed meaning when the rune is picked reversed", async () => {
    const runeIndex = 0;
    const randomSpy = jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(runeIndex / runes.length)
      .mockReturnValueOnce(0.1);

    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    expect(randomSpy).toHaveBeenCalled();
    const call = mockScheduleNotification.mock.calls[0];
    const body = call[1];
    const expectedRune = runes[runeIndex];
    expect(body).toContain(expectedRune.name);
    expect(body).toContain(expectedRune.meaning.reversed as string);
  });

  it("does not schedule a new notification when today's rune is still valid", async () => {
    const now = new Date();
    if (now.getHours() < 6) {
      now.setHours(6, 0, 0, 0);
    }
    const stored = {
      date: now.toISOString().split("T")[0],
      index: 3,
      timestamp: now.getTime(),
      isReversed: false,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(stored),
    );

    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    expect(mockScheduleNotification).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
