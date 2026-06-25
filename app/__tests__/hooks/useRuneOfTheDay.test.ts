import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRuneOfTheDay from "../../hooks/useRuneOfTheDay";
import { runes } from "../../data/runes";
import { seededIntFromKey, seededRandomFromKey } from "../../utils/seededRandom";
import { getLocalDateKey } from "../../utils/dateKey";

const mockScheduleNotification = jest.fn(() => Promise.resolve(true));
const mockUseSettings = jest.fn(() => ({
  dailyResetHour: 6,
  dailyResetMinute: 0,
}));

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

jest.mock("../../contexts/SettingsContext", () => ({
  useSettings: () => mockUseSettings(),
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
    mockUseSettings.mockReturnValue({ dailyResetHour: 6, dailyResetMinute: 0 });
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

  it("picks a deterministic rune for today's date key on first run", async () => {
    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    expect(mockScheduleNotification).toHaveBeenCalledTimes(1);

    const call = mockScheduleNotification.mock.calls[0];
    const [title, body, triggerDate, identifier, repeatsDaily] = call;
    const todayKey = getLocalDateKey(new Date());
    const expectedIndex = seededIntFromKey(todayKey, runes.length);
    const expectedRune = runes[expectedIndex];
    const reversedRoll = seededRandomFromKey(`${todayKey}:reversed`);
    const hasReversedMeaning = Boolean(
      expectedRune?.meaning?.reversed &&
        typeof expectedRune.meaning.reversed === "string" &&
        expectedRune.meaning.reversed.trim() !== "",
    );
    const expectedIsReversed = hasReversedMeaning ? reversedRoll < 0.5 : false;
    const expectedMeaning =
      expectedIsReversed && expectedRune.meaning.reversed
        ? expectedRune.meaning.reversed
        : expectedRune.meaning.primaryThemes;

    expect(identifier).toBe("runeOfTheDayNotification");
    expect(repeatsDaily).toBe(true);
    expect(title).toContain(expectedRune.symbol);
    expect(body).toContain(expectedRune.name);
    expect(body).toContain(expectedMeaning);

    expect(triggerDate.getHours()).toBe(6);
    expect(triggerDate.getMinutes()).toBe(0);

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, valueStr] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(key).toBe("runeOfTheDay");
    const persisted = JSON.parse(valueStr);
    expect(persisted.index).toBe(expectedIndex);
    expect(persisted.isReversed).toBe(expectedIsReversed);
    expect(persisted.date).toBe(todayKey);
  });

  it("uses the reversed meaning when the seed rolls reversed", async () => {
    const todayKey = getLocalDateKey(new Date());
    const expectedIndex = seededIntFromKey(todayKey, runes.length);
    const expectedRune = runes[expectedIndex];
    const hasReversedMeaning = Boolean(
      expectedRune?.meaning?.reversed &&
        typeof expectedRune.meaning.reversed === "string" &&
        expectedRune.meaning.reversed.trim() !== "",
    );
    const reversedRoll = seededRandomFromKey(`${todayKey}:reversed`);
    const expectReversed = hasReversedMeaning && reversedRoll < 0.5;

    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    const call = mockScheduleNotification.mock.calls[0];
    const body = call[1];

    if (expectReversed) {
      expect(body).toContain(expectedRune.meaning.reversed as string);
    } else {
      expect(body).toContain(expectedRune.meaning.primaryThemes);
    }
  });

  it("uses the stored rune when stored date matches today and the index matches the seed", async () => {
    const todayKey = getLocalDateKey(new Date());
    const seededIndex = seededIntFromKey(todayKey, runes.length);
    const stored = {
      date: todayKey,
      index: seededIndex,
      timestamp: Date.now(),
      isReversed: false,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(stored),
    );

    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    expect(mockScheduleNotification).toHaveBeenCalledTimes(1);
    const call = mockScheduleNotification.mock.calls[0];
    expect(call[1]).toContain(runes[seededIndex].name);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("uses the configured daily reset hour and minute for the notification trigger", async () => {
    mockUseSettings.mockReturnValue({
      dailyResetHour: 8,
      dailyResetMinute: 30,
    });

    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    const call = mockScheduleNotification.mock.calls[0];
    const triggerDate = call[2];
    expect(triggerDate.getHours()).toBe(8);
    expect(triggerDate.getMinutes()).toBe(30);
  });

  it("schedules the notification with today's rune, not yesterday's", async () => {
    const todayKey = getLocalDateKey(new Date());
    const todayIndex = seededIntFromKey(todayKey, runes.length);
    const todayRune = runes[todayIndex];

    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    const call = mockScheduleNotification.mock.calls[0];
    const [, body] = call;
    expect(body).toContain(todayRune.name);
  });
});
