import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { runes, Rune } from "../data/runes";
import useNotifications from "./useNotifications";
import { useSettings } from "../contexts/SettingsContext";
import { getLocalDateKey, getTodayKey } from "../utils/dateKey";
import { seededIntFromKey, seededRandomFromKey } from "../utils/seededRandom";
import { getUserSalt, saltedKey } from "../utils/userSalt";

const STORAGE_KEY = "runeOfTheDay";
const NOTIFICATION_IDENTIFIER = "runeOfTheDayNotification";
const DAILY_CHECK_INTERVAL_MS = 15 * 60 * 1000;

interface StoredData {
  date: string;
  index: number;
  timestamp: number;
  isReversed?: boolean;
}

const pickRuneForDate = (
  dateKey: string,
  salt: string = "",
): { index: number; isReversed: boolean } => {
  const key = saltedKey(dateKey, salt);
  const index = seededIntFromKey(key, runes.length);
  const selectedRune = runes[index];
  const hasReversedMeaning = Boolean(
    selectedRune?.meaning?.reversed &&
    typeof selectedRune.meaning.reversed === "string" &&
    selectedRune.meaning.reversed.trim() !== "",
  );
  const reversedRoll = seededRandomFromKey(`${key}:reversed`);
  const isReversed = hasReversedMeaning ? reversedRoll < 0.5 : false;
  return { index, isReversed };
};

const useRuneOfTheDay = (): { rune: Rune | null; isReversed: boolean } => {
  const [rune, setRune] = useState<Rune | null>(null);
  const [isReversed, setIsReversed] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const saltRef = useRef<string>("");
  const { scheduleNotification } = useNotifications();
  const { dailyResetHour, dailyResetMinute } = useSettings();

  const safeSetRune = useCallback((value: Rune | null) => {
    if (isMountedRef.current) setRune(value);
  }, []);
  const safeSetIsReversed = useCallback((value: boolean) => {
    if (isMountedRef.current) setIsReversed(value);
  }, []);

  /**
   * Compute the next upcoming daily-reset timestamp strictly after `from`.
   * If today's reset hasn't happened yet, that's today's reset; otherwise it
   * rolls to tomorrow. This is the moment the *next* rune-day begins, so the
   * notification announces the rune for the date the push fires on.
   */
  const getNextResetDate = useCallback(
    (from: Date = new Date()): Date => {
      const candidate = new Date(from);
      candidate.setHours(dailyResetHour, dailyResetMinute, 0, 0);
      if (candidate.getTime() <= from.getTime()) {
        candidate.setDate(candidate.getDate() + 1);
      }
      return candidate;
    },
    [dailyResetHour, dailyResetMinute],
  );

  const scheduleRuneNotification = useCallback(
    async (dateKey: string) => {
      try {
        // The notification fires at the next daily reset, which marks the
        // start of the *next* rune day. Announce the rune for the date the
        // notification will actually fire on, not the current day — otherwise
        // the push shows yesterday's rune ("day before" bug).
        const fireDate = getNextResetDate();
        const fireDateKey = getLocalDateKey(fireDate);

        const { index, isReversed: pickedIsReversed } = pickRuneForDate(
          fireDateKey,
          saltRef.current,
        );
        const pickedRune = runes[index];

        const meaningText =
          pickedIsReversed && pickedRune.meaning.reversed
            ? pickedRune.meaning.reversed
            : pickedRune.meaning.primaryThemes;

        await scheduleNotification(
          `Your Daily Rune Awaits ${pickedRune.symbol || ""}`,
          `${pickedRune.name} - ${meaningText}`,
          fireDate,
          NOTIFICATION_IDENTIFIER,
          true,
        );
      } catch (error) {
        console.error("Error scheduling rune notification:", error);
      }
    },
    [getNextResetDate, scheduleNotification],
  );

  /**
   * Re-schedule the next daily notification. Called on app open and by the
   * periodic interval check. Because notifications are now one-time (not
   * repeating), each fire must be re-armed so the content always matches the
   * date it fires on — eliminating the "day behind" staleness bug.
   */
  const rescheduleNextNotification = useCallback(async () => {
    await scheduleRuneNotification(getTodayKey());
  }, [scheduleRuneNotification]);

  const updateRuneOfTheDay = useCallback(async () => {
    try {
      const todayKey = getTodayKey();
      const currentTime = new Date().getTime();
      let storedData: StoredData | null = null;

      try {
        const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDataStr) {
          const parsed = JSON.parse(storedDataStr) as StoredData;
          if (
            typeof parsed?.index === "number" &&
            parsed.index >= 0 &&
            parsed.index < runes.length &&
            typeof parsed?.timestamp === "number" &&
            !Number.isNaN(parsed.timestamp)
          ) {
            storedData = parsed;
          }
        }
      } catch (storageError) {
        console.error("Error reading from AsyncStorage:", storageError);
      }

      const storedKeyMatchesToday =
        storedData !== null && storedData.date === todayKey;
      const deterministic = pickRuneForDate(todayKey, saltRef.current);

      if (storedKeyMatchesToday && storedData) {
        safeSetRune(runes[storedData.index]);
        safeSetIsReversed(storedData.isReversed === true);
      } else {
        const pickedRune = runes[deterministic.index];
        const newData: StoredData = {
          date: todayKey,
          index: deterministic.index,
          timestamp: currentTime,
          isReversed: deterministic.isReversed,
        };

        safeSetRune(pickedRune);
        safeSetIsReversed(deterministic.isReversed);

        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        } catch (saveError) {
          console.error("Error saving to AsyncStorage:", saveError);
        }
      }

      await scheduleRuneNotification(todayKey);
    } catch (error) {
      console.error("Error in updateRuneOfTheDay:", error);

      try {
        const todayKey = getTodayKey();
        const { index, isReversed: pickedIsReversed } = pickRuneForDate(
          todayKey,
          saltRef.current,
        );
        safeSetRune(runes[index]);
        safeSetIsReversed(pickedIsReversed);
      } catch (fallbackError) {
        console.error(
          "Critical error in fallback rune selection:",
          fallbackError,
        );
      }
    }
  }, [scheduleRuneNotification, safeSetRune, safeSetIsReversed]);

  // Load the per-install salt once on mount before computing any rune.
  // Without this, the first render would use an empty salt (the legacy
  // date-only behaviour) and then flip to the salted rune once loaded.
  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;
    (async () => {
      const salt = await getUserSalt();
      if (!cancelled && salt) {
        saltRef.current = salt;
        await updateRuneOfTheDay();
      }
    })();
    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, [updateRuneOfTheDay]);

  useEffect(() => {
    const intervalCheck = async () => {
      try {
        const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
        const todayKey = getTodayKey();
        let needsUpdate = true;

        if (storedDataStr) {
          const storedData = JSON.parse(storedDataStr) as StoredData;
          if (storedData?.date === todayKey) {
            needsUpdate = false;
          }
        }

        if (needsUpdate) {
          await updateRuneOfTheDay();
        } else {
          // Even when today's rune is already current, re-arm the next
          // one-time notification so its content always matches its fire
          // date. (One-time triggers don't repeat, so this is required.)
          await rescheduleNextNotification();
        }
      } catch (error) {
        console.error("Error during interval check:", error);
      }
    };

    const interval = setInterval(intervalCheck, DAILY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [updateRuneOfTheDay, rescheduleNextNotification]);

  return { rune, isReversed };
};

export default useRuneOfTheDay;
export { getLocalDateKey };
