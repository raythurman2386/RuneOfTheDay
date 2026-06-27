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

        if (repeatsDaily) {
          if (__DEV__) {
            console.log(
              `Scheduling daily notification for ${String(triggerDate.getHours()).padStart(2, "0")}:${String(triggerDate.getMinutes()).padStart(2, "0")}`,
            );
          }

          // The DAILY trigger fires at the *next* occurrence of the given
          // hour/minute, which may be today if the app opens before the
          // reset time. That would deliver tomorrow's rune a day early. When
          // the requested fire date is tomorrow, defer the daily repeat until
          // after the first (one-time) fire so the content stays correct.
          const now = new Date();
          const nextDailyFire = new Date();
          nextDailyFire.setHours(
            triggerDate.getHours(),
            triggerDate.getMinutes(),
            0,
            0,
          );
          const fireIsTomorrow = triggerDate.getDate() !== now.getDate();

          if (fireIsTomorrow && nextDailyFire.getTime() > now.getTime()) {
            // Today's reset time hasn't arrived yet — a DAILY trigger would
            // fire today. Schedule a one-time notification for the intended
            // fire date instead; the daily repeat is re-established on the
            // next app open after the reset has passed.
            const secondsFromNow = Math.max(
              Math.floor((triggerDate.getTime() - now.getTime()) / 1000),
              1,
            );
            const timeIntervalTrigger: Notifications.TimeIntervalTriggerInput =
              {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: secondsFromNow,
                repeats: false,
                channelId:
                  Platform.OS === "android"
                    ? NOTIFICATION_CHANNEL_ID
                    : undefined,
              };

            await Notifications.scheduleNotificationAsync({
              content,
              trigger: timeIntervalTrigger,
              identifier,
            });
          } else {
            const dailyTrigger: Notifications.DailyTriggerInput = {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: triggerDate.getHours(),
              minute: triggerDate.getMinutes(),
              channelId:
                Platform.OS === "android" ? NOTIFICATION_CHANNEL_ID : undefined,
            };

            await Notifications.scheduleNotificationAsync({
              content,
              trigger: dailyTrigger,
              identifier,
            });
          }
        } else {
          if (triggerDate.getTime() <= Date.now()) {
            console.warn("Cannot schedule one-time notification in the past");
            return false;
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
        }

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
