import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRuneOfTheDay from "../../hooks/useRuneOfTheDay";
import { runes } from "../../data/runes";
import {
  seededIntFromKey,
  seededRandomFromKey,
} from "../../utils/seededRandom";
import { getLocalDateKey } from "../../utils/dateKey";
import { saltedKey } from "../../utils/userSalt";

// Fixed salt so tests can predict the exact rune. The real hook loads a
// random per-install salt; here we mock getUserSalt to return this.
const TEST_SALT = "abcdef0123456789";

jest.mock("../../utils/userSalt", () => ({
  __esModule: true,
  getUserSalt: jest.fn(() => Promise.resolve(TEST_SALT)),
  saltedKey: (dateKey: string, salt: string) =>
    salt ? `${dateKey}:${salt}` : dateKey,
}));

// Matches DAILY_CHECK_INTERVAL_MS in the hook (15 minutes).
const DAILY_CHECK_INTERVAL_MS = 15 * 60 * 1000;

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

// Mirrors getNextResetDate in the hook: the next reset strictly after `from`.
// Tests use this so expectations hold whether run before or after the reset.
const getNextResetDate = (
  hour: number,
  minute: number,
  from: Date = new Date(),
): Date => {
  const candidate = new Date(from);
  candidate.setHours(hour, minute, 0, 0);
  if (candidate.getTime() <= from.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
};

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

    // The notification fires at the next reset strictly after now, so it
    // announces the rune for that date — not today's (the "day before" bug).
    const fireDateKey = getLocalDateKey(triggerDate);
    const saltedFireKey = saltedKey(fireDateKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(saltedFireKey, runes.length);
    const expectedRune = runes[expectedIndex];
    const reversedRoll = seededRandomFromKey(`${saltedFireKey}:reversed`);
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

    // Persisted storage reflects today's rune (the one shown in-app), which
    // differs from the notification rune (derived from the fire date above).
    const todayKey = getLocalDateKey(new Date());
    const saltedTodayKey = saltedKey(todayKey, TEST_SALT);
    const persistedIndex = seededIntFromKey(saltedTodayKey, runes.length);
    const persistedReversedRoll = seededRandomFromKey(
      `${saltedTodayKey}:reversed`,
    );
    const persistedHasReversed = Boolean(
      runes[persistedIndex]?.meaning?.reversed &&
      typeof runes[persistedIndex].meaning.reversed === "string" &&
      runes[persistedIndex].meaning.reversed!.trim() !== "",
    );
    const persistedIsReversed = persistedHasReversed
      ? persistedReversedRoll < 0.5
      : false;

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, valueStr] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(key).toBe("runeOfTheDay");
    const persisted = JSON.parse(valueStr);
    expect(persisted.index).toBe(persistedIndex);
    expect(persisted.isReversed).toBe(persistedIsReversed);
    expect(persisted.date).toBe(todayKey);
  });

  it("uses the reversed meaning when the seed rolls reversed", async () => {
    // The notification announces the rune for the fire date (the next reset
    // strictly after now), so derive expectations from that date key.
    const fireDate = getNextResetDate(6, 0);
    const fireDateKey = getLocalDateKey(fireDate);
    const saltedFireKey = saltedKey(fireDateKey, TEST_SALT);
    const expectedIndex = seededIntFromKey(saltedFireKey, runes.length);
    const expectedRune = runes[expectedIndex];
    const hasReversedMeaning = Boolean(
      expectedRune?.meaning?.reversed &&
      typeof expectedRune.meaning.reversed === "string" &&
      expectedRune.meaning.reversed.trim() !== "",
    );
    const reversedRoll = seededRandomFromKey(`${saltedFireKey}:reversed`);
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
    const saltedTodayKey = saltedKey(todayKey, TEST_SALT);
    const seededIndex = seededIntFromKey(saltedTodayKey, runes.length);
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

    // The displayed rune comes from storage (today's seed), but the
    // notification announces the rune for the fire date (the next reset
    // strictly after now).
    const fireDate = getNextResetDate(6, 0);
    const fireDateKey = getLocalDateKey(fireDate);
    const saltedFireKey = saltedKey(fireDateKey, TEST_SALT);
    const fireIndex = seededIntFromKey(saltedFireKey, runes.length);

    expect(mockScheduleNotification).toHaveBeenCalledTimes(1);
    const call = mockScheduleNotification.mock.calls[0];
    expect(call[1]).toContain(runes[fireIndex].name);
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

  it("schedules the notification with the next reset's rune, not today's", async () => {
    const fireDate = getNextResetDate(6, 0);
    const fireDateKey = getLocalDateKey(fireDate);
    const saltedFireKey = saltedKey(fireDateKey, TEST_SALT);
    const fireIndex = seededIntFromKey(saltedFireKey, runes.length);
    const fireRune = runes[fireIndex];

    renderHook(() => useRuneOfTheDay());

    await act(async () => {
      await flushPromises();
    });

    const call = mockScheduleNotification.mock.calls[0];
    const [, body] = call;
    expect(body).toContain(fireRune.name);
  });

  it("re-arms the next notification on the periodic interval when the rune is already current", async () => {
    // Seed storage with today's rune so the interval check takes the
    // "already current" branch, which must still reschedule the notification.
    const todayKey = getLocalDateKey(new Date());
    const saltedTodayKey = saltedKey(todayKey, TEST_SALT);
    const seededIndex = seededIntFromKey(saltedTodayKey, runes.length);
    const stored = {
      date: todayKey,
      index: seededIndex,
      timestamp: Date.now(),
      isReversed: false,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(stored),
    );

    jest.useFakeTimers();
    try {
      renderHook(() => useRuneOfTheDay());

      // Flush the async mount effect (microtasks only — fake timers swallow
      // the setTimeout-based flushPromises helper).
      await act(async () => {
        await Promise.resolve();
      });

      // One schedule from the initial updateRuneOfTheDay.
      expect(mockScheduleNotification).toHaveBeenCalledTimes(1);

      // Fast-forward the 15-minute interval, then flush the async interval
      // callback's microtasks.
      await act(async () => {
        jest.advanceTimersByTime(DAILY_CHECK_INTERVAL_MS);
        await Promise.resolve();
      });

      // The interval check found today's rune current and re-armed the next
      // one-time notification — proving staleness is prevented even when the
      // app stays open across the reset boundary.
      expect(mockScheduleNotification).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it("computes the next reset as today's reset when it hasn't occurred yet", () => {
    // 05:59 local is before the 06:00 reset, so the next reset is today 06:00.
    const before = new Date();
    before.setHours(5, 59, 0, 0);
    const next = getNextResetDate(6, 0, before);
    expect(next.getHours()).toBe(6);
    expect(next.getMinutes()).toBe(0);
    expect(getLocalDateKey(next)).toBe(getLocalDateKey(before));
  });

  it("computes the next reset as tomorrow's reset when today's has passed", () => {
    // 06:01 local is after the 06:00 reset, so the next reset is tomorrow.
    const after = new Date();
    after.setHours(6, 1, 0, 0);
    const next = getNextResetDate(6, 0, after);
    expect(next.getHours()).toBe(6);
    expect(next.getMinutes()).toBe(0);
    const tomorrow = new Date(after);
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(getLocalDateKey(next)).toBe(getLocalDateKey(tomorrow));
  });
});
