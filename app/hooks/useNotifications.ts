import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const NOTIFICATION_CHANNEL_ID = "rune-daily-updates";

const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

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
  ): Promise<boolean> => {
    if (!isEnabled) return false;

    try {
      if (triggerDate.getTime() <= Date.now()) {
        console.warn("Cannot schedule notification in the past");
        return false;
      }

      await Notifications.cancelScheduledNotificationAsync(identifier);

      const content = {
        title,
        body,
        sound: true,
      };

      if (Platform.OS === "android") {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            channelId: NOTIFICATION_CHANNEL_ID,
            date: triggerDate,
          },
          identifier,
        });
      } else {
        const secondsFromNow = Math.max(
          0,
          Math.floor((triggerDate.getTime() - Date.now()) / 1000),
        );
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            seconds: secondsFromNow,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          },
          identifier,
        });
      }

      return true;
    } catch (error) {
      console.error("Error scheduling notification:", error);
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
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
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
