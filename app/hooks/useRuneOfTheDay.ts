import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { runes, Rune } from "../data/runes";
import useNotifications from "./useNotifications";
import useWidgetStorageService from "../services/WidgetStorageService";

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
  const [isReversed, setIsReversed] = useState<boolean>(true);
  const { isEnabled, scheduleNotification } = useNotifications();
  const { saveRuneData } = useWidgetStorageService();

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

  const getRandomRune = useCallback((previousIndex?: number): { index: number; isReversed: boolean } => {
    if (runes.length <= 1) return { index: 0, isReversed: false };
    
    let newIndex = Math.floor(Math.random() * runes.length);
    if (previousIndex !== undefined && newIndex === previousIndex) {
      newIndex = (newIndex + 1) % runes.length;
    }

    const canBeReversed = Boolean(runes[newIndex].meaning.reversed);
    const isReversed = canBeReversed && Math.random() < 0.5;

    return { index: newIndex, isReversed };
  }, []);

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
          const { index: newIndex, isReversed } = getRandomRune(storedData.index);
          const currentDate = new Date().toISOString().split("T")[0];
          const newData: StoredData = {
            date: currentDate,
            index: newIndex,
            timestamp: currentTime,
            isReversed,
          };

          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
          setRune(runes[newIndex]);
          setIsReversed(isReversed);

          await saveRuneData(runes[newIndex], newIndex, isReversed);
          await scheduleRuneNotification();
        } else {
          setRune(runes[storedData.index]);
          setIsReversed(storedData.isReversed ?? false);
        }
      } else {
        const currentDate = new Date().toISOString().split("T")[0];
        const { index: newIndex, isReversed } = getRandomRune();
        const newData: StoredData = {
          date: currentDate,
          index: newIndex,
          timestamp: currentTime,
          isReversed,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        setRune(runes[newIndex]);
        setIsReversed(isReversed);

        await saveRuneData(runes[newIndex], newIndex, isReversed);
        await scheduleRuneNotification();
      }
    } catch (error) {
      console.error("Error in updateRuneOfTheDay:", error);
      const { index, isReversed } = getRandomRune();
      setRune(runes[index]);
      setIsReversed(isReversed);

      try {
        await saveRuneData(runes[index], index, isReversed);
      } catch (widgetError) {
        console.error(
          "Failed to update widget in error recovery:",
          widgetError,
        );
      }
    }
  }, [scheduleRuneNotification, saveRuneData, shouldUpdateRune, getRandomRune]);

  // Initial load of rune data
  useEffect(() => {
    updateRuneOfTheDay();
  }, [updateRuneOfTheDay]);

  // Setup periodic check
  useEffect(() => {
    const interval = setInterval(async () => {
      const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedDataStr) {
        const storedData: StoredData = JSON.parse(storedDataStr);
        if (shouldUpdateRune(storedData.timestamp)) {
          updateRuneOfTheDay();
        }
      }
    }, 15 * 60 * 1000); // Check every 15 minutes

    return () => clearInterval(interval);
  }, [shouldUpdateRune, updateRuneOfTheDay]);

  return { rune, isReversed };
};

export { useRuneOfTheDay };
export default useRuneOfTheDay;
