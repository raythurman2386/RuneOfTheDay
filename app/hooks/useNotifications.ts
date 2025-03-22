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
  ): Promise<boolean> => {
    // Always check permission status before scheduling
    await checkNotificationPermissions();

    if (!isEnabled) {
      console.log("Cannot schedule notification: permissions not granted");
      return false;
    }

    try {
      if (triggerDate.getTime() <= Date.now()) {
        console.warn("Cannot schedule notification in the past");
        return false;
      }

      // Cancel any existing notification with this identifier
      await Notifications.cancelScheduledNotificationAsync(identifier).catch(
        () => {
          // Ignore error if notification didn't exist
        },
      );

      const content = {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      };

      const secondsFromNow = Math.max(
        Math.floor((triggerDate.getTime() - Date.now()) / 1000),
      );

      const trigger =
        Platform.OS === "android"
          ? ({
              seconds: secondsFromNow,
              channelId: NOTIFICATION_CHANNEL_ID,
            } as Notifications.NotificationTriggerInput)
          : ({
              seconds: secondsFromNow,
            } as Notifications.TimeIntervalTriggerInput);

      await Notifications.scheduleNotificationAsync({
        content,
        trigger,
        identifier,
      });

      // Debug logging for notification scheduling
      console.log(
        `Scheduled notification "${title}" for ${triggerDate.toLocaleString()} (${secondsFromNow}s from now)`,
      );

      // For debugging: verify notification was actually scheduled
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      const wasScheduled = scheduledNotifications.some(
        (n) => n.identifier === identifier,
      );

      if (!wasScheduled) {
        console.error(
          "Notification verification failed - not found in scheduled list",
        );
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
    ); // Check hourly

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
