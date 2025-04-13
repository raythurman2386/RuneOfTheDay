import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { runes, Rune } from "../data/runes";
import useNotifications from "./useNotifications";

const STORAGE_KEY = "runeOfTheDay";
const NOTIFICATION_IDENTIFIER = "runeOfTheDayNotification";

interface StoredData {
  date: string;
  index: number;
  timestamp: number;
  isReversed?: boolean;
}

const useRuneOfTheDay = (): { rune: Rune | null; isReversed: boolean } => {
  const [rune, setRune] = useState<Rune | null>(null);
  const [isReversed, setIsReversed] = useState<boolean>(false);
  const { isEnabled, scheduleNotification } = useNotifications();

  const shouldUpdateRune = useCallback((storedTimestamp: number): boolean => {
    const currentDate = new Date();
    const storedDate = new Date(storedTimestamp);

    const isDifferentDay =
      currentDate.toDateString() !== storedDate.toDateString();

    const sixAM = new Date(currentDate);
    sixAM.setHours(6, 0, 0, 0);

    return (
      (isDifferentDay && currentDate >= sixAM) ||
      (currentDate >= sixAM && storedDate < sixAM)
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

  const scheduleRuneNotification = useCallback(async () => {
    if (!isEnabled || !rune) return;

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);

      const meaningText =
        isReversed && rune.meaning.reversed
          ? rune.meaning.reversed
          : rune.meaning.primaryThemes;

      await scheduleNotification(
        `Your Daily Rune Awaits ${rune.symbol || ""}`,
        `${rune.name} - ${meaningText}`,
        tomorrow,
        NOTIFICATION_IDENTIFIER,
        true,
      );
    } catch (error) {
      console.error("Error scheduling rune notification:", error);
    }
  }, [isEnabled, scheduleNotification, rune, isReversed]);

  const updateRuneOfTheDay = useCallback(async () => {
    try {
      const currentTime = new Date().getTime();
      let storedData: StoredData | null = null;

      try {
        const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDataStr) {
          storedData = JSON.parse(storedDataStr);
        }
      } catch (storageError) {
        console.error("Error reading from AsyncStorage:", storageError);
      }

      if (storedData && !shouldUpdateRune(storedData.timestamp)) {
        setRune(runes[storedData.index]);
        setIsReversed(storedData.isReversed === true); // Ensure it's a boolean
      } else {
        const { index: newIndex, isReversed } = getRandomRune();
        const currentDate = new Date().toISOString().split("T")[0];
        const newData: StoredData = {
          date: currentDate,
          index: newIndex,
          timestamp: currentTime,
          isReversed,
        };

        setRune(runes[newIndex]);
        setIsReversed(isReversed);

        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        } catch (saveError) {
          console.error("Error saving to AsyncStorage:", saveError);
        }

        await scheduleRuneNotification();
      }
    } catch (error) {
      console.error("Error in updateRuneOfTheDay:", error);

      try {
        const { index, isReversed } = getRandomRune();
        setRune(runes[index]);
        setIsReversed(isReversed);
      } catch (fallbackError) {
        console.error(
          "Critical error in fallback rune selection:",
          fallbackError,
        );
      }
    }
  }, [scheduleRuneNotification, shouldUpdateRune, getRandomRune]);

  useEffect(() => {
    let isMounted = true;
    updateRuneOfTheDay();
    return () => {
      isMounted = false;
    };
  }, [updateRuneOfTheDay]);

  useEffect(() => {
    const checkInterval = 15 * 60 * 1000; // 15 minutes

    const intervalCheck = async () => {
      try {
        const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedDataStr) {
          const storedData: StoredData = JSON.parse(storedDataStr);
          if (shouldUpdateRune(storedData.timestamp)) {
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
