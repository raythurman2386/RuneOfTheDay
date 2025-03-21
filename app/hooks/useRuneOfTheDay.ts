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
}

const useRuneOfTheDay = (): Rune | null => {
  const [rune, setRune] = useState<Rune | null>(null);
  const { isEnabled, scheduleNotification } = useNotifications();

  const shouldUpdateRune = (storedTimestamp: number): boolean => {
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
  };

  const getRandomRune = (previousIndex?: number): number => {
    if (runes.length <= 1) return 0;
    let newIndex = Math.floor(Math.random() * runes.length);
    if (previousIndex !== undefined && newIndex === previousIndex) {
      newIndex = (newIndex + 1) % runes.length;
    }
    return newIndex;
  };

  const scheduleRuneNotification = useCallback(async () => {
    if (!isEnabled) return;

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0);

      await scheduleNotification(
        "Your Daily Rune Awaits",
        "A new rune has been drawn for you. Tap to view its wisdom.",
        tomorrow,
        NOTIFICATION_IDENTIFIER,
      );
    } catch (error) {
      console.error("Error scheduling rune notification:", error);
    }
  }, [isEnabled, scheduleNotification]);

  const updateRuneOfTheDay = useCallback(async () => {
    try {
      const currentTime = new Date().getTime();
      const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedDataStr) {
        const storedData: StoredData = JSON.parse(storedDataStr);

        if (shouldUpdateRune(storedData.timestamp)) {
          const newIndex = getRandomRune(storedData.index);
          const currentDate = new Date().toISOString().split("T")[0];
          const newData: StoredData = {
            date: currentDate,
            index: newIndex,
            timestamp: currentTime,
          };

          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
          setRune(runes[newIndex]);

          await scheduleRuneNotification();
        } else {
          setRune(runes[storedData.index]);
        }
      } else {
        const currentDate = new Date().toISOString().split("T")[0];
        const newIndex = getRandomRune();
        const newData: StoredData = {
          date: currentDate,
          index: newIndex,
          timestamp: currentTime,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        setRune(runes[newIndex]);

        await scheduleRuneNotification();
      }
    } catch (error) {
      console.error("Error in updateRuneOfTheDay:", error);
      const index = Math.floor(Math.random() * runes.length);
      setRune(runes[index]);
    }
  }, [scheduleRuneNotification]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    updateRuneOfTheDay();
    interval = setInterval(updateRuneOfTheDay, 15 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [updateRuneOfTheDay]);

  return rune;
};

export { useRuneOfTheDay };
export default useRuneOfTheDay;
