import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { runes, Rune } from "../data/runes";
import useNotifications from "./useNotifications";
import { useSettings } from "../contexts/SettingsContext";
import { getLocalDateKey, getTodayKey } from "../utils/dateKey";
import { seededIntFromKey, seededRandomFromKey } from "../utils/seededRandom";

const STORAGE_KEY = "runeOfTheDay";
const NOTIFICATION_IDENTIFIER = "runeOfTheDayNotification";
const DAILY_CHECK_INTERVAL_MS = 15 * 60 * 1000;

interface StoredData {
  date: string;
  index: number;
  timestamp: number;
  isReversed?: boolean;
}

const pickRuneForDate = (dateKey: string): { index: number; isReversed: boolean } => {
  const index = seededIntFromKey(dateKey, runes.length);
  const selectedRune = runes[index];
  const hasReversedMeaning = Boolean(
    selectedRune?.meaning?.reversed &&
      typeof selectedRune.meaning.reversed === "string" &&
      selectedRune.meaning.reversed.trim() !== "",
  );
  const reversedRoll = seededRandomFromKey(`${dateKey}:reversed`);
  const isReversed = hasReversedMeaning ? reversedRoll < 0.5 : false;
  return { index, isReversed };
};

const useRuneOfTheDay = (): { rune: Rune | null; isReversed: boolean } => {
  const [rune, setRune] = useState<Rune | null>(null);
  const [isReversed, setIsReversed] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const { scheduleNotification } = useNotifications();
  const { dailyResetHour, dailyResetMinute } = useSettings();

  const safeSetRune = useCallback((value: Rune | null) => {
    if (isMountedRef.current) setRune(value);
  }, []);
  const safeSetIsReversed = useCallback((value: boolean) => {
    if (isMountedRef.current) setIsReversed(value);
  }, []);

  const scheduleRuneNotification = useCallback(
    async (dateKey: string) => {
      try {
        const { index, isReversed: pickedIsReversed } = pickRuneForDate(dateKey);
        const pickedRune = runes[index];

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(dailyResetHour, dailyResetMinute, 0, 0);

        const meaningText =
          pickedIsReversed && pickedRune.meaning.reversed
            ? pickedRune.meaning.reversed
            : pickedRune.meaning.primaryThemes;

        await scheduleNotification(
          `Your Daily Rune Awaits ${pickedRune.symbol || ""}`,
          `${pickedRune.name} - ${meaningText}`,
          tomorrow,
          NOTIFICATION_IDENTIFIER,
          true,
        );
      } catch (error) {
        console.error("Error scheduling rune notification:", error);
      }
    },
    [scheduleNotification, dailyResetHour, dailyResetMinute],
  );

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
      const deterministic = pickRuneForDate(todayKey);

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
        const { index, isReversed: pickedIsReversed } = pickRuneForDate(todayKey);
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

  useEffect(() => {
    isMountedRef.current = true;
    updateRuneOfTheDay();
    return () => {
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
        }
      } catch (error) {
        console.error("Error during interval check:", error);
      }
    };

    const interval = setInterval(intervalCheck, DAILY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [updateRuneOfTheDay]);

  return { rune, isReversed };
};

export default useRuneOfTheDay;
export { getLocalDateKey };
