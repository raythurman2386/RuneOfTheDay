import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const NOTIFICATION_CHANNEL_ID = "rune-daily-updates";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const checkNotificationPermissions = async (): Promise<void> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setIsEnabled(status === "granted");
    } catch (error) {
      console.error("Error checking notification permissions:", error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      if (existingStatus === "granted") {
        setIsEnabled(true);
        return true;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      setIsEnabled(status === "granted");

      if (Platform.OS === "android" && status === "granted") {
        await Notifications.setNotificationChannelAsync(
          NOTIFICATION_CHANNEL_ID,
          {
            name: "Daily Rune Updates",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            enableVibrate: true,
          },
        );
      }

      return status === "granted";
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    triggerDate: Date,
    identifier: string,
    repeatsDaily: boolean = false,
  ): Promise<boolean> => {
    await checkNotificationPermissions();
    if (!isEnabled) {
      console.log("Cannot schedule notification: permissions not granted");
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
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };

      if (repeatsDaily) {
        let nextTriggerTimeLog = "";
        if (triggerDate.getTime() <= Date.now()) {
          let nextTriggerCalc = new Date(triggerDate);
          nextTriggerCalc.setHours(
            triggerDate.getHours(),
            triggerDate.getMinutes(),
            0,
            0,
          );
          if (nextTriggerCalc.getTime() <= Date.now()) {
            nextTriggerCalc.setDate(nextTriggerCalc.getDate() + 1);
          }
          nextTriggerTimeLog = ` Next occurrence approx: ${nextTriggerCalc.toLocaleString()}`;
        }
        console.log(
          `Scheduling daily notification for ${String(triggerDate.getHours()).padStart(2, "0")}:${String(triggerDate.getMinutes()).padStart(2, "0")}.${nextTriggerTimeLog}`,
        );

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
        console.log(
          `Scheduled daily notification "${title}" (ID: ${identifier})`,
        );
      } else {
        if (triggerDate.getTime() <= Date.now()) {
          console.warn("Cannot schedule one-time notification in the past");
          return false;
        }
        const secondsFromNow = Math.max(
          Math.floor((triggerDate.getTime() - Date.now()) / 1000),
          1,
        );
        console.log(
          `Scheduling one-time notification for ${triggerDate.toLocaleString()} (${secondsFromNow}s from now)`,
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
        console.log(
          `Scheduled one-time notification "${title}" (ID: ${identifier})`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      const wasScheduled = scheduledNotifications.some(
        (n) => n.identifier === identifier,
      );

      if (!wasScheduled) {
        console.error(
          `Verification failed for "${identifier}" - not found in scheduled list. List:`,
          scheduledNotifications,
        );
      } else {
        console.log(`Verification successful for "${identifier}".`);
      }

      return true;
    } catch (error) {
      console.error(`Error scheduling notification "${identifier}":`, error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      return false;
    }
  };

  const cancelNotification = async (identifier: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  };

  const cancelAllNotifications = async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  };

  useEffect(() => {
    requestPermissions();
    checkNotificationPermissions();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    const permissionCheckInterval = setInterval(
      checkNotificationPermissions,
      3600000,
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      clearInterval(permissionCheckInterval);
    };
  }, []);

  return {
    isEnabled,
    requestPermissions,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
  };
};

export default useNotifications;
