import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules } from "react-native";
import type { Rune } from "../data/runes";

const WIDGET_STORAGE_KEY = "runeOfTheDayWidget";

/**
 * Service for managing widget data storage and updates
 * Handles data sharing between the app and home screen widgets
 */
export const useWidgetStorageService = () => {
  /**
   * Saves rune data for widget consumption
   * @param rune The rune to save for widget display
   * @param index The index of the rune in the runes array
   * @param isReversed Whether the rune is reversed
   */
  const saveRuneData = async (
    rune: Rune | null,
    index: number,
    isReversed: boolean = false,
  ): Promise<void> => {
    if (!rune) return;

    try {
      const runeData = {
        symbol: rune.symbol,
        name: rune.name,
        primaryThemes: isReversed && rune.meaning.reversed 
          ? rune.meaning.reversed 
          : rune.meaning.primaryThemes,
        deity:
          rune.associations.godsGoddesses.length > 0
            ? rune.associations.godsGoddesses[0]
            : "None",
        index,
        isReversed,
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(runeData));

      if (Platform.OS === "android") {
        try {
          if (NativeModules.RuneWidgetModule) {
            await NativeModules.RuneWidgetModule.updateWidget(
              JSON.stringify(runeData),
            );
          } else {
            console.warn(
              "RuneWidgetModule not available - widget will not update",
            );
          }
        } catch (error) {
          console.error("Error updating Android widget:", error);
        }
      }
    } catch (error) {
      console.error("Error saving widget data:", error);
    }
  };

  /**
   * Retrieves the currently stored widget data
   */
  const getRuneData = async (): Promise<any | null> => {
    try {
      const data = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error retrieving widget data:", error);
      return null;
    }
  };

  /**
   * Clears widget data (useful for debugging)
   */
  const clearWidgetData = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(WIDGET_STORAGE_KEY);

      if (Platform.OS === "android" && NativeModules.RuneWidgetModule) {
        await NativeModules.RuneWidgetModule.clearWidgetData();
      }
    } catch (error) {
      console.error("Error clearing widget data:", error);
    }
  };

  return {
    saveRuneData,
    getRuneData,
    clearWidgetData,
  };
};

export default useWidgetStorageService;
