import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const useHaptics = () => {
  const isSupported = Platform.OS !== "web";

  const safeHaptics = async (callback: () => Promise<void>) => {
    if (!isSupported) return;
    try {
      await callback();
    } catch (error) {
      // Silently handle haptics errors
      console.debug("Haptics not available:", error);
    }
  };

  const lightFeedback = () => {
    safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  };

  const mediumFeedback = () => {
    safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  };

  const heavyFeedback = () => {
    safeHaptics(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  };

  const successFeedback = () => {
    safeHaptics(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  };

  const errorFeedback = () => {
    safeHaptics(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    );
  };

  return {
    isSupported,
    lightFeedback,
    mediumFeedback,
    heavyFeedback,
    successFeedback,
    errorFeedback,
  };
};

export default useHaptics;
