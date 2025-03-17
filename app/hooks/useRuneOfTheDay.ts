import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { runes, Rune } from "../data/runes";

const STORAGE_KEY = "runeOfTheDay";

interface StoredData {
  date: string;
  index: number;
}

export const useRuneOfTheDay = (): Rune | null => {
  const [rune, setRune] = useState<Rune | null>(null);

  useEffect(() => {
    const getRune = async () => {
      try {
        const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        let index: number;

        if (storedData) {
          const { date, index: storedIndex }: StoredData =
            JSON.parse(storedData);
          if (date === currentDate) {
            index = storedIndex;
          } else {
            index = Math.floor(Math.random() * runes.length);
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ date: currentDate, index }),
            );
          }
        } else {
          index = Math.floor(Math.random() * runes.length);
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ date: currentDate, index }),
          );
        }

        setRune(runes[index]);
      } catch (error) {
        console.error("Error accessing AsyncStorage:", error);
        // Fallback: select a random rune without storing
        const index = Math.floor(Math.random() * runes.length);
        setRune(runes[index]);
      }
    };

    getRune();
  }, []);

  return rune;
};
