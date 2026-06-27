import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const NOTIFICATION_CHANNEL_ID = "rune-daily-updates";
const CHANNEL_ACCENT_COLOR = "#FF231F7C";
const PERMISSION_CHECK_INTERVAL_MS = 3600000;

const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const notificationListener = useRef<
    Notifications.EventSubscription | undefined
  >(undefined);

  const setupAndroidChannel = useCallback(async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: "Daily Rune Updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: CHANNEL_ACCENT_COLOR,
        enableVibrate: true,
      });
    }
  }, []);

  // Resolves the current permission status (reflecting any recent grant) and
  // mirrors it into state for UI consumers. Returning the boolean avoids the
  // stale-closure bug where scheduling read `isEnabled` before re-render.
  const checkNotificationPermissions =
    useCallback(async (): Promise<boolean> => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        const granted = status === "granted";
        setIsEnabled(granted);
        if (granted) {
          await setupAndroidChannel();
        }
        return granted;
      } catch (error) {
        console.error("Error checking notification permissions:", error);
        return false;
      }
    }, [setupAndroidChannel]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      if (existingStatus === "granted") {
        setIsEnabled(true);
        await setupAndroidChannel();
        return true;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";
      setIsEnabled(granted);

      if (granted) {
        await setupAndroidChannel();
      }

      return granted;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }, [setupAndroidChannel]);

  const scheduleNotification = useCallback(
    async (
      title: string,
      body: string,
      triggerDate: Date,
      identifier: string,
      repeatsDaily: boolean = false,
    ): Promise<boolean> => {
      const hasPermission = await checkNotificationPermissions();
      if (!hasPermission) {
        return false;
      }

      try {
        await Notifications.cancelScheduledNotificationAsync(identifier).catch(
          (err) => {
            if (!err.message.includes("Could not find")) {
              console.warn(
                `Error cancelling potentially existing notification ${identifier}:`,
                err,
              );
            }
          },
        );

        const content = {
          title,
          body,
          sound: true as const,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        };

        // Always schedule a ONE-TIME notification. A repeating DAILY trigger
        // freezes the content at schedule time, so it keeps announcing the
        // same rune every day — falling a day further behind whenever the app
        // isn't reopened. One-time triggers guarantee the content matches the
        // date they actually fire on; the caller reschedules the next day's
        // notification on each app open (and via the periodic interval check).
        // The `repeatsDaily` flag is retained for API compatibility but no
        // longer produces a repeating trigger.
        if (triggerDate.getTime() <= Date.now()) {
          console.warn("Cannot schedule notification in the past");
          return false;
        }

        if (__DEV__) {
          console.log(
            `Scheduling one-time notification for ${triggerDate.toISOString()}`,
          );
        }

        const secondsFromNow = Math.max(
          Math.floor((triggerDate.getTime() - Date.now()) / 1000),
          1,
        );

        const timeIntervalTrigger: Notifications.TimeIntervalTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsFromNow,
          repeats: false,
          channelId:
            Platform.OS === "android" ? NOTIFICATION_CHANNEL_ID : undefined,
        };

        await Notifications.scheduleNotificationAsync({
          content,
          trigger: timeIntervalTrigger,
          identifier,
        });

        return true;
      } catch (error) {
        console.error(`Error scheduling notification "${identifier}":`, error);
        return false;
      }
    },
    [checkNotificationPermissions],
  );

  const cancelNotification = useCallback(
    async (identifier: string): Promise<void> => {
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      } catch (error) {
        console.error("Error canceling notification:", error);
      }
    },
    [],
  );

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }, []);

  useEffect(() => {
    // Register the foreground notification handler. Previously at module
    // top-level, mutating global state on import (even in tests).
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    (async () => {
      await requestPermissions();
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        if (__DEV__) {
          console.log("Notification received:", notification);
        }
      });

    const permissionCheckInterval = setInterval(
      checkNotificationPermissions,
      PERMISSION_CHECK_INTERVAL_MS,
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      clearInterval(permissionCheckInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => ({
      isEnabled,
      requestPermissions,
      scheduleNotification,
      cancelNotification,
      cancelAllNotifications,
    }),
    [
      isEnabled,
      requestPermissions,
      scheduleNotification,
      cancelNotification,
      cancelAllNotifications,
    ],
  );
};

export default useNotifications;
