import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { runes, Rune } from "../data/runes";
import useNotifications from "./useNotifications";

const STORAGE_KEY = "runeOfTheDay";
const NOTIFICATION_IDENTIFIER = "runeOfTheDayNotification";
const DAILY_RESET_HOUR = 6;
const DAILY_CHECK_INTERVAL_MS = 15 * 60 * 1000;

interface StoredData {
  date: string;
  index: number;
  timestamp: number;
  isReversed?: boolean;
}

const useRuneOfTheDay = (): { rune: Rune | null; isReversed: boolean } => {
  const [rune, setRune] = useState<Rune | null>(null);
  const [isReversed, setIsReversed] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const { scheduleNotification } = useNotifications();

  const safeSetRune = useCallback((value: Rune | null) => {
    if (isMountedRef.current) setRune(value);
  }, []);
  const safeSetIsReversed = useCallback((value: boolean) => {
    if (isMountedRef.current) setIsReversed(value);
  }, []);

  const shouldUpdateRune = useCallback((storedTimestamp: number): boolean => {
    const currentDate = new Date();
    const storedDate = new Date(storedTimestamp);

    const isDifferentDay =
      currentDate.toDateString() !== storedDate.toDateString();

    const dailyReset = new Date(currentDate);
    dailyReset.setHours(DAILY_RESET_HOUR, 0, 0, 0);

    return (
      (isDifferentDay && currentDate >= dailyReset) ||
      (currentDate >= dailyReset && storedDate < dailyReset)
    );
  }, []);

  const getRandomRune = useCallback((): {
    index: number;
    isReversed: boolean;
  } => {
    const index = Math.floor(Math.random() * runes.length);

    const selectedRune = runes[index];
    const hasReversedMeaning = Boolean(
      selectedRune?.meaning?.reversed &&
      typeof selectedRune.meaning.reversed === "string" &&
      selectedRune.meaning.reversed.trim() !== "",
    );

    // 50/50 chance of reversed, but only if the rune has a reversed meaning
    const isReversed = hasReversedMeaning ? Math.random() < 0.5 : false;

    return { index, isReversed };
  }, []);

  // Accepts the just-picked rune so the notification body always reflects
  // today's rune, rather than a stale closure value. Permissions are resolved
  // inside scheduleNotification itself, so we no longer gate on `isEnabled`.
  const scheduleRuneNotification = useCallback(
    async (pickedRune: Rune, pickedIsReversed: boolean) => {
      if (!pickedRune) return;

      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(DAILY_RESET_HOUR, 0, 0, 0);

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
    [scheduleNotification],
  );

  const updateRuneOfTheDay = useCallback(async () => {
    try {
      const currentTime = new Date().getTime();
      let storedData: StoredData | null = null;

      try {
        const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDataStr) {
          const parsed = JSON.parse(storedDataStr) as StoredData;
          // Validate the parsed shape before using it — corrupted storage
          // (schema drift, manual edits) should fall through to re-pick.
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

      if (storedData && !shouldUpdateRune(storedData.timestamp)) {
        safeSetRune(runes[storedData.index]);
        safeSetIsReversed(storedData.isReversed === true);
      } else {
        const { index: newIndex, isReversed: pickedIsReversed } =
          getRandomRune();
        const currentDate = new Date().toISOString().split("T")[0];
        const pickedRune = runes[newIndex];
        const newData: StoredData = {
          date: currentDate,
          index: newIndex,
          timestamp: currentTime,
          isReversed: pickedIsReversed,
        };

        safeSetRune(pickedRune);
        safeSetIsReversed(pickedIsReversed);

        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        } catch (saveError) {
          console.error("Error saving to AsyncStorage:", saveError);
        }

        await scheduleRuneNotification(pickedRune, pickedIsReversed);
      }
    } catch (error) {
      console.error("Error in updateRuneOfTheDay:", error);

      try {
        const { index, isReversed } = getRandomRune();
        safeSetRune(runes[index]);
        safeSetIsReversed(isReversed);
      } catch (fallbackError) {
        console.error(
          "Critical error in fallback rune selection:",
          fallbackError,
        );
      }
    }
  }, [
    scheduleRuneNotification,
    shouldUpdateRune,
    getRandomRune,
    safeSetRune,
    safeSetIsReversed,
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    updateRuneOfTheDay();
    return () => {
      isMountedRef.current = false;
    };
  }, [updateRuneOfTheDay]);

  useEffect(() => {
    const checkInterval = DAILY_CHECK_INTERVAL_MS;

    const intervalCheck = async () => {
      try {
        const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDataStr) {
          const storedData = JSON.parse(storedDataStr) as StoredData;
          if (
            typeof storedData?.timestamp === "number" &&
            !Number.isNaN(storedData.timestamp) &&
            shouldUpdateRune(storedData.timestamp)
          ) {
            await updateRuneOfTheDay();
          }
        } else {
          await updateRuneOfTheDay();
        }
      } catch (error) {
        console.error("Error during interval check:", error);
      }
    };

    const interval = setInterval(intervalCheck, checkInterval);
    return () => clearInterval(interval);
  }, [shouldUpdateRune, updateRuneOfTheDay]);

  return { rune, isReversed };
};

export default useRuneOfTheDay;
