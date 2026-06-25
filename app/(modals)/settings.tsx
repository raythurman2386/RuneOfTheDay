import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Platform,
  useColorScheme,
  Linking,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings, VALID_MINUTES } from "../contexts/SettingsContext";
import { useColorTheme } from "../hooks/useColorTheme";
import { Stack } from "expo-router";
import useNotifications from "../hooks/useNotifications";

const HOUR_OPTIONS = [5, 6, 7, 8, 9];

const formatTime = (hour: number, minute: number): string => {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m}`;
};

type PickerTarget = "hour" | "minute" | null;

export default function SettingsScreen() {
  const {
    theme,
    setTheme,
    haptics,
    setHaptics,
    dailyResetHour,
    dailyResetMinute,
    setDailyResetTime,
  } = useSettings();
  const { colors } = useColorTheme();
  const systemColorScheme = useColorScheme();
  const { isEnabled: notificationsEnabled, requestPermissions } =
    useNotifications();
  const insets = useSafeAreaInsets();
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);

  const handleManageNotifications = async () => {
    if (!notificationsEnabled) {
      // Request permissions if not already granted
      await requestPermissions();
    } else {
      // If already granted, open system settings to let user disable if desired
      if (Platform.OS === "ios") {
        Linking.openURL("app-settings:");
      } else {
        Linking.openSettings();
      }
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.icon },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          <View style={styles.optionsContainer}>
            <Pressable
              style={[
                styles.themeButton,
                {
                  backgroundColor:
                    theme === "system" ? colors.tint : colors.background,
                  borderColor: colors.icon,
                },
              ]}
              onPress={() => setTheme("system")}
              accessibilityLabel="Use system theme"
              accessibilityRole="button"
              accessibilityState={{ selected: theme === "system" }}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color: theme === "system" ? colors.background : colors.text,
                  },
                ]}
              >
                System
              </Text>
              <Text
                style={[
                  styles.themeButtonSubtext,
                  {
                    color: theme === "system" ? colors.background : colors.icon,
                  },
                ]}
              >
                {systemColorScheme === "dark" ? "Dark" : "Light"}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.themeButton,
                {
                  backgroundColor:
                    theme === "light" ? colors.tint : colors.background,
                  borderColor: colors.icon,
                },
              ]}
              onPress={() => setTheme("light")}
              accessibilityLabel="Use light theme"
              accessibilityRole="button"
              accessibilityState={{ selected: theme === "light" }}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color: theme === "light" ? colors.background : colors.text,
                  },
                ]}
              >
                Light
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.themeButton,
                {
                  backgroundColor:
                    theme === "dark" ? colors.tint : colors.background,
                  borderColor: colors.icon,
                },
              ]}
              onPress={() => setTheme("dark")}
              accessibilityLabel="Use dark theme"
              accessibilityRole="button"
              accessibilityState={{ selected: theme === "dark" }}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  {
                    color: theme === "dark" ? colors.background : colors.text,
                  },
                ]}
              >
                Dark
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.icon },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Haptics
          </Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Enable haptic feedback
            </Text>
            <Switch
              value={haptics}
              onValueChange={setHaptics}
              trackColor={{ false: colors.icon, true: colors.tint }}
              thumbColor={
                Platform.OS === "ios"
                  ? "#FFFFFF"
                  : haptics
                    ? colors.background
                    : "#f4f3f4"
              }
              ios_backgroundColor={colors.icon}
            />
          </View>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface, borderColor: colors.icon },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Daily rune notifications
              </Text>
              <Text style={{ fontSize: 13, color: colors.icon, marginTop: 4 }}>
                {notificationsEnabled ? "Enabled" : "Disabled"}
              </Text>
            </View>
            <Pressable
              onPress={handleManageNotifications}
              accessibilityLabel={
                notificationsEnabled
                  ? "Manage notifications"
                  : "Enable notifications"
              }
              accessibilityRole="button"
            >
              <Text
                style={{
                  color: colors.tint,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {notificationsEnabled ? "Manage" : "Enable"}
              </Text>
            </Pressable>
          </View>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Notification time
              </Text>
              <Text
                style={{ fontSize: 13, color: colors.icon, marginTop: 4 }}
              >
                Daily rune unlocks at this time
              </Text>
            </View>
            <Pressable
              onPress={() => setActivePicker("hour")}
              accessibilityLabel="Change notification hour"
              accessibilityRole="button"
              testID="notification-hour-button"
              style={[
                styles.timeButton,
                { borderColor: colors.icon, backgroundColor: colors.background },
              ]}
            >
              <Text
                style={[styles.timeButtonText, { color: colors.text }]}
                testID="notification-hour-value"
              >
                {String(dailyResetHour).padStart(2, "0")}
              </Text>
            </Pressable>
            <Text style={{ color: colors.text, fontSize: 18, marginHorizontal: 4 }}>
              :
            </Text>
            <Pressable
              onPress={() => setActivePicker("minute")}
              accessibilityLabel="Change notification minute"
              accessibilityRole="button"
              testID="notification-minute-button"
              style={[
                styles.timeButton,
                { borderColor: colors.icon, backgroundColor: colors.background },
              ]}
            >
              <Text
                style={[styles.timeButtonText, { color: colors.text }]}
                testID="notification-minute-value"
              >
                {String(dailyResetMinute).padStart(2, "0")}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={activePicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setActivePicker(null)}
        >
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.icon },
            ]}
            onPress={() => {}}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {activePicker === "hour" ? "Select hour" : "Select minute"}
            </Text>
            <FlatList
              data={activePicker === "hour" ? HOUR_OPTIONS : VALID_MINUTES}
              keyExtractor={(item) => String(item)}
              numColumns={activePicker === "hour" ? 5 : 4}
              contentContainerStyle={styles.modalGrid}
              renderItem={({ item }) => {
                const isSelected =
                  activePicker === "hour"
                    ? item === dailyResetHour
                    : item === dailyResetMinute;
                return (
                  <Pressable
                    onPress={() => {
                      if (activePicker === "hour") {
                        setDailyResetTime(item, dailyResetMinute);
                      } else {
                        setDailyResetTime(dailyResetHour, item);
                      }
                      setActivePicker(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${formatTime(
                      activePicker === "hour" ? item : dailyResetHour,
                      activePicker === "hour" ? dailyResetMinute : item,
                    )}`}
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.modalOption,
                      {
                        backgroundColor: isSelected
                          ? colors.tint
                          : colors.background,
                        borderColor: colors.icon,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        {
                          color: isSelected ? colors.background : colors.text,
                        },
                      ]}
                    >
                      {String(item).padStart(2, "0")}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  themeButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  themeButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  timeButton: {
    minWidth: 48,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  modalGrid: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  modalOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptionText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
